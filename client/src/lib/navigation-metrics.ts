import { debug } from "@/utils/debug";

type NavigationEntry =
  | PerformanceNavigationTiming
  | { domContentLoadedEventEnd?: number; loadEventEnd?: number };

interface ComputeNavigationMetricsParams {
  path: string;
  startTime: number;
  endTime: number;
  navigationEntry?: NavigationEntry;
  firstContentfulPaint?: number;
}

export interface NavigationMetrics {
  path: string;
  durationMs: number;
  domContentLoadedMs?: number;
  loadEventEndMs?: number;
  firstContentfulPaintMs?: number;
  startedAt: number;
}

/**
 * Pure helper for building a metrics payload that can be logged or sent to telemetry.
 * Keeping this pure makes it easy to unit test.
 */
export function computeNavigationMetrics({
  path,
  startTime,
  endTime,
  navigationEntry,
  firstContentfulPaint,
}: ComputeNavigationMetricsParams): NavigationMetrics {
  const durationMs = Math.max(0, endTime - startTime);

  return {
    path,
    durationMs,
    domContentLoadedMs: navigationEntry?.domContentLoadedEventEnd,
    loadEventEndMs: navigationEntry?.loadEventEnd,
    firstContentfulPaintMs: firstContentfulPaint,
    startedAt: startTime,
  };
}

/**
 * Lightweight client-side instrumentation to understand SPA navigation timing
 * without sending data to an external service.
 */
export function logNavigationComplete(path: string, startTime: number) {
  const endTime = performance.now();
  const navigationEntry = performance.getEntriesByType("navigation")[0] as
    | NavigationEntry
    | undefined;
  const firstContentfulPaint = performance.getEntriesByName(
    "first-contentful-paint",
  )[0]?.startTime;

  const metrics = computeNavigationMetrics({
    path,
    startTime,
    endTime,
    navigationEntry,
    firstContentfulPaint,
  });

  debug.log("Navigation timing", metrics);
}
