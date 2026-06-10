import {
  getFallbackRiskFreeRate,
  getRiskFreeRate,
} from "../../src/server/riskFreeRateService";

interface Env {
  FRED_API_KEY?: string;
}

interface PagesFunctionContext {
  request: Request;
  env: Env;
}

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=3600",
};

export const onRequestGet = async ({
  request,
  env,
}: PagesFunctionContext): Promise<Response> => {
  const daysToExpiration = readDaysToExpiration(request);

  try {
    const payload = await getRiskFreeRate(daysToExpiration, env.FRED_API_KEY);
    return Response.json(payload, { headers: JSON_HEADERS });
  } catch (error) {
    console.warn("Risk-free rate lookup failed", error);

    return Response.json(getFallbackRiskFreeRate(daysToExpiration), {
      headers: JSON_HEADERS,
    });
  }
};

function readDaysToExpiration(request: Request): number {
  const url = new URL(request.url);
  const rawDays = Number.parseFloat(url.searchParams.get("days") ?? "");
  return Number.isFinite(rawDays) && rawDays >= 0 ? rawDays : 0;
}
