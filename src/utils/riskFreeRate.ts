const CACHE_KEY_SHORT = "risk_free_rate_short_cache";
const CACHE_KEY_LONG = "risk_free_rate_long_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const DEFAULT_RATES = {
  short: 3.62,
  long: 4.3,
};

const RATE_SWITCH_THRESHOLD = 30; // Use short rate for T < 30 days

interface CacheData {
  rate: number;
  timestamp: number;
  date: string;
  isLive: boolean;
}

interface RiskFreeRateResponse {
  rate: number;
  date: string | null;
  source: "fred" | "fallback";
}

export function getRateType(T_days: number): "short" | "long" {
  return T_days < RATE_SWITCH_THRESHOLD ? "short" : "long";
}

export async function fetchRiskFreeRate(T_days: number): Promise<number> {
  const safeDays = Number.isFinite(T_days) && T_days >= 0 ? T_days : 0;
  const rateType = getRateType(safeDays);
  const cacheKey = rateType === "short" ? CACHE_KEY_SHORT : CACHE_KEY_LONG;
  const defaultRate =
    rateType === "short" ? DEFAULT_RATES.short : DEFAULT_RATES.long;

  try {
    // Check cache first
    const cached = getCachedRate(cacheKey);
    if (cached) {
      return cached.rate;
    }

    const response = await fetch(
      `/api/risk-free-rate?days=${encodeURIComponent(safeDays)}`,
    );
    if (!response.ok) {
      console.warn(
        `Failed to fetch ${rateType}-term rate, using default value`,
      );
      return defaultRate;
    }

    const data = (await response.json()) as RiskFreeRateResponse;
    if (Number.isFinite(data.rate) && data.rate > 0) {
      const cacheData: CacheData = {
        rate: data.rate,
        timestamp: Date.now(),
        date: data.date ?? "",
        isLive: data.source === "fred",
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      return data.rate;
    }

    return defaultRate;
  } catch (error) {
    console.warn(`Error fetching ${rateType}-term rate:`, error);
    return defaultRate;
  }
}

function getCachedRate(cacheKey: string): CacheData | null {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const cacheData: CacheData = JSON.parse(cached);
    const now = Date.now();

    // Return cache if still valid (within 24 hours)
    if (now - cacheData.timestamp < CACHE_DURATION) {
      return cacheData;
    }

    // Cache expired, remove it
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.warn("Error reading cached rate:", error);
  }

  return null;
}

export function getCacheStatus(rateType: "short" | "long"): {
  isLive: boolean;
  rate: number;
  lastUpdated: string | null;
} | null {
  const cacheKey = rateType === "short" ? CACHE_KEY_SHORT : CACHE_KEY_LONG;
  const cached = getCachedRate(cacheKey);
  if (!cached) return null;

  return {
    isLive: cached.isLive,
    rate: cached.rate,
    lastUpdated: new Date(cached.timestamp).toLocaleDateString(),
  };
}
