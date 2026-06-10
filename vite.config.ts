import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv, type Plugin } from "vite";
import {
  getFallbackRiskFreeRate,
  getRiskFreeRate,
} from "./src/server/riskFreeRateService";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [riskFreeRateApi(env.FRED_API_KEY), react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== "true",
    },
  };
});

function riskFreeRateApi(fredApiKey: string | undefined): Plugin {
  return {
    name: "risk-free-rate-api",
    configureServer(server) {
      server.middlewares.use("/api/risk-free-rate", async (req, res) => {
        const requestUrl = new URL(req.url ?? "/", "http://localhost");
        const rawDays = Number.parseFloat(
          requestUrl.searchParams.get("days") ?? "",
        );
        const daysToExpiration =
          Number.isFinite(rawDays) && rawDays >= 0 ? rawDays : 0;

        try {
          const payload = await getRiskFreeRate(daysToExpiration, fredApiKey);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify(payload));
        } catch (error) {
          console.warn("Risk-free rate lookup failed", error);

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify(getFallbackRiskFreeRate(daysToExpiration)));
        }
      });
    },
  };
}
