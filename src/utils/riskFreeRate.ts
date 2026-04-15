// Risk-free rate fetcher with dynamic selection based on time horizon
// Optional: Configure VITE_FRED_API_KEY in .env file to fetch live rates
// Free API key available at: https://fred.stlouisfed.org/docs/api/api_key.html

const FRED_API_KEY = import.meta.env.VITE_FRED_API_KEY || null;

// FRED Series IDs
const SERIES_SHORT = "DTB3"; // 3-Month Treasury Bill (for short-term options)
const SERIES_LONG = "DGS10"; // 10-Year Treasury Note (for long-term options)

const CACHE_KEY_SHORT = "risk_free_rate_short_cache";
const CACHE_KEY_LONG = "risk_free_rate_long_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Default fallback risk-free rates (Treasury Bill rates)
// Update these periodically or use FRED API for live updates
const DEFAULT_RATES = {
  short: 3.62, // 3-Month Treasury Bill DTB3 (April 2026)
  long: 4.3, // 10-Year Treasury Note DGS10 (April 2026)
};

// Threshold for switching between short and long rates (in days)
const RATE_SWITCH_THRESHOLD = 30; // Use short rate for T < 30 days

interface CacheData {
  rate: number;
  timestamp: number;
  date: string;
  isLive: boolean;
}

/**
 * Determine which rate to use based on time to expiration
 * @param T_days - Days to expiration
 * @returns "short" for T_days < 30, "long" otherwise
 */
export function getRateType(T_days: number): "short" | "long" {
  return T_days < RATE_SWITCH_THRESHOLD ? "short" : "long";
}

/**
 * Fetch appropriate risk-free rate based on time horizon
 * @param T_days - Days to expiration
 * @returns Risk-free rate as percentage (e.g., 5.33 for 5.33%)
 */
export async function fetchRiskFreeRate(T_days: number): Promise<number> {
  const rateType = getRateType(T_days);
  const seriesId = rateType === "short" ? SERIES_SHORT : SERIES_LONG;
  const cacheKey = rateType === "short" ? CACHE_KEY_SHORT : CACHE_KEY_LONG;
  const defaultRate =
    rateType === "short" ? DEFAULT_RATES.short : DEFAULT_RATES.long;

  try {
    // Check cache first
    const cached = getCachedRate(cacheKey);
    if (cached) {
      return cached.rate;
    }

    // If no API key configured, return default
    if (!FRED_API_KEY) {
      console.info(
        `Using default ${rateType}-term rate. Configure VITE_FRED_API_KEY in .env for live updates.`,
      );
      return defaultRate;
    }

    // Fetch from FRED API
    const url = `https://api.stlouisfed.org/fred/series/${seriesId}/observations?api_key=${FRED_API_KEY}&limit=1&sort_order=desc`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn(
        `Failed to fetch ${rateType}-term rate from FRED API, using default value`,
      );
      return defaultRate;
    }

    const data = await response.json();
    const observations = data.observations;

    if (observations && observations.length > 0) {
      const latestObservation = observations[0];
      const rate = parseFloat(latestObservation.value);

      if (!isNaN(rate) && rate > 0) {
        // Cache the result
        const cacheData: CacheData = {
          rate,
          timestamp: Date.now(),
          date: latestObservation.date,
          isLive: true,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        return rate;
      }
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
