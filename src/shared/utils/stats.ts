// Statistical utilities — all pure functions

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function percentileOf(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

// ─── Signal Detection Theory ───────────────────────────────────────────────────

/**
 * d' with log-linear correction for extreme hit/false alarm rates.
 * Hautus (1995): replace H with (H + 0.5)/(N + 1), FAR with (FA + 0.5)/(N + 1)
 */
export function dPrime(
  hits: number,
  totalTargets: number,
  falseAlarms: number,
  totalLures: number,
): number {
  const HR  = (hits + 0.5)       / (totalTargets + 1);
  const FAR = (falseAlarms + 0.5) / (totalLures + 1);
  return probit(HR) - probit(FAR);
}

/** Inverse normal CDF (probit). Beasley–Springer–Moro approximation. */
function probit(p: number): number {
  p = Math.max(1e-6, Math.min(1 - 1e-6, p));

  const a = [
    -3.969683028665376e1,
     2.209460984245205e2,
    -2.759285104469687e2,
     1.383577518672690e2,
    -3.066479806614716e1,
     2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1,
     1.615858368580409e2,
    -1.556989798598866e2,
     6.680131188771972e1,
    -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838,
    -2.549732539343734,
     4.374664141464968,
     2.938163982698783,
  ];
  const d = [
     7.784695709041462e-3,
     3.224671290700398e-1,
     2.445134137142996,
     3.754408661907416,
  ];

  const pLow  = 0.02425;
  const pHigh = 1 - pLow;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
           ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  } else if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
           (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
              ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
}

// ─── Linear Regression ────────────────────────────────────────────────────────

export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
}

export function linearRegression(points: [number, number][]): RegressionResult {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 };

  const xMean = mean(points.map(p => p[0]));
  const yMean = mean(points.map(p => p[1]));

  let ssxy = 0, ssxx = 0, ssyy = 0;
  for (const [x, y] of points) {
    ssxy += (x - xMean) * (y - yMean);
    ssxx += (x - xMean) ** 2;
    ssyy += (y - yMean) ** 2;
  }

  const slope     = ssxx === 0 ? 0 : ssxy / ssxx;
  const intercept = yMean - slope * xMean;
  const rSquared  = (ssxx === 0 || ssyy === 0) ? 0 : (ssxy ** 2) / (ssxx * ssyy);

  return { slope, intercept, rSquared };
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Map a raw value from [inMin, inMax] to [outMin, outMax] */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return clamp(
    outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin),
    outMin,
    outMax,
  );
}

/** Fisher-Yates shuffle (in-place copy) */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
