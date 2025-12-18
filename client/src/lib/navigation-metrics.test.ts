import { describe, expect, it } from "vitest";
import { computeNavigationMetrics } from "./navigation-metrics";

describe("computeNavigationMetrics", () => {
  it("builds a metrics payload with timing deltas", () => {
    const metrics = computeNavigationMetrics({
      path: "/chefs",
      startTime: 100,
      endTime: 250,
      navigationEntry: {
        domContentLoadedEventEnd: 400,
        loadEventEnd: 480,
      },
      firstContentfulPaint: 180,
    });

    expect(metrics.path).toBe("/chefs");
    expect(metrics.durationMs).toBe(150);
    expect(metrics.domContentLoadedMs).toBe(400);
    expect(metrics.loadEventEndMs).toBe(480);
    expect(metrics.firstContentfulPaintMs).toBe(180);
    expect(metrics.startedAt).toBe(100);
  });

  it("guards against negative durations", () => {
    const metrics = computeNavigationMetrics({
      path: "/dashboard",
      startTime: 300,
      endTime: 250,
    });

    expect(metrics.durationMs).toBe(0);
  });
});
