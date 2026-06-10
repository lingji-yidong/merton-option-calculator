const SERIES = {
  short: "DTB3",
  long: "DGS10",
} as const;

const FALLBACK_RATES = {
  short: 3.62,
  long: 4.3,
} as const;

const RATE_SWITCH_THRESHOLD_DAYS = 30;
const FRED_OBSERVATIONS_URL =
  "https://api.stlouisfed.org/fred/series/observations";

export type RateType = keyof typeof SERIES;

export interface RiskFreeRatePayload {
  rate: number;
  rateType: RateType;
  seriesId: string;
  date: string | null;
  source: "fred" | "fallback";
}

interface FredObservation {
  date?: string;
  value?: string;
}

interface FredResponse {
  observations?: FredObservation[];
}

export function getRateType(daysToExpiration: number): RateType {
  return daysToExpiration < RATE_SWITCH_THRESHOLD_DAYS ? "short" : "long";
}

export function getFallbackRiskFreeRate(
  daysToExpiration: number,
): RiskFreeRatePayload {
  const rateType = getRateType(daysToExpiration);
  return buildFallbackPayload(
    rateType,
    SERIES[rateType],
    FALLBACK_RATES[rateType],
  );
}

export async function getRiskFreeRate(
  daysToExpiration: number,
  fredApiKey: string | undefined,
): Promise<RiskFreeRatePayload> {
  const rateType = getRateType(daysToExpiration);
  const seriesId = SERIES[rateType];
  const fallbackRate = FALLBACK_RATES[rateType];

  if (!fredApiKey) {
    return getFallbackRiskFreeRate(daysToExpiration);
  }

  const url = new URL(FRED_OBSERVATIONS_URL);
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", fredApiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("sort_order", "desc");
  url.searchParams.set("limit", "10");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FRED request failed with ${response.status}`);
  }

  const data = (await response.json()) as FredResponse;
  const latest = data.observations?.find((observation) => {
    const rate = Number.parseFloat(observation.value ?? "");
    return Number.isFinite(rate) && rate > 0;
  });

  if (!latest) {
    throw new Error(`FRED returned no numeric observations for ${seriesId}`);
  }

  return {
    rate: Number.parseFloat(latest.value ?? ""),
    rateType,
    seriesId,
    date: latest.date ?? null,
    source: "fred",
  };
}

export function buildFallbackPayload(
  rateType: RateType,
  seriesId: string,
  rate: number,
): RiskFreeRatePayload {
  return {
    rate,
    rateType,
    seriesId,
    date: null,
    source: "fallback",
  };
}
