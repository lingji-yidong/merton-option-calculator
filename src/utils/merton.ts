export function n(x: number): number {
  return (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

export function N(x: number): number {
  if (x > 8.0) return 1.0;
  if (x < -8.0) return 0.0;

  const b1 = 0.31938153,
    b2 = -0.356563782,
    b3 = 1.781477937,
    b4 = -1.821255978,
    b5 = 1.330274429;
  const p = 0.2316419,
    c = 0.39894228;
  if (x >= 0.0) {
    let t = 1.0 / (1.0 + p * x);
    return (
      1.0 -
      c *
        Math.exp((-x * x) / 2.0) *
        t *
        (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1)
    );
  } else {
    let t = 1.0 / (1.0 - p * x);
    return (
      c *
      Math.exp((-x * x) / 2.0) *
      t *
      (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1)
    );
  }
}

export interface MertonInputs {
  S: number;
  K: number;
  T_days: number;
  r_percent: number;
  v_percent: number;
  q_percent: number;
}

export interface MertonResults {
  call: number;
  put: number;
  callDelta: number;
  putDelta: number;
  gamma: number;
  vega: number;
  callTheta: number;
  putTheta: number;
  callRho: number;
  putRho: number;
}

export function calculateMerton(inputs: MertonInputs): MertonResults | null {
  const { S, K, T_days, r_percent, v_percent, q_percent } = inputs;

  if (isNaN(S) || isNaN(K) || isNaN(T_days)) return null;

  const T = Math.max(T_days / 365.0, 1e-6);
  const r = r_percent / 100.0;
  const v = v_percent / 100.0;
  const q = q_percent / 100.0;

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r - q + (v * v) / 2) * T) / (v * sqrtT);
  const d2 = d1 - v * sqrtT;
  const eqT = Math.exp(-q * T);
  const erT = Math.exp(-r * T);

  const call = S * eqT * N(d1) - K * erT * N(d2);
  const put = K * erT * N(-d2) - S * eqT * N(-d1);

  const callDelta = eqT * N(d1);
  const putDelta = eqT * (N(d1) - 1);
  const gamma = (eqT * n(d1)) / (S * v * sqrtT);
  const vega = S * eqT * n(d1) * sqrtT * 0.01;

  const term1 = -(S * eqT * n(d1) * v) / (2 * sqrtT);

  const callTheta = (term1 - q * S * eqT * N(d1) - r * K * erT * N(d2)) / 365.0;
  const putTheta =
    (term1 + q * S * eqT * N(-d1) + r * K * erT * N(-d2)) / 365.0;

  const callRho = K * T * erT * N(d2) * 0.01;
  const putRho = -(K * T * erT * N(-d2)) * 0.01;

  return {
    call,
    put,
    callDelta,
    putDelta,
    gamma,
    vega,
    callTheta,
    putTheta,
    callRho,
    putRho,
  };
}
