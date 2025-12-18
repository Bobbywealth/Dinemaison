import { queryClient } from "@/lib/queryClient";

type Prefetcher = () => Promise<void>;

const defaultChefFilters = {
  search: "",
  cuisine: "",
  priceRange: [0, 500] as [number, number],
  minRating: 0,
  dietary: [] as string[],
  market: "",
};

async function prefetchChefs() {
  await Promise.all([
    import("@/pages/chefs"),
    queryClient.prefetchQuery({
      queryKey: ["/api/chefs", defaultChefFilters],
      queryFn: async () => {
        const res = await fetch("/api/chefs", { credentials: "include" });
        if (!res.ok) {
          throw new Error("Failed to prefetch chefs");
        }
        return res.json();
      },
      staleTime: 1000 * 60 * 5,
    }),
  ]);
}

const routePrefetchers: Record<string, Prefetcher> = {
  "/dashboard": () => import("@/pages/dashboard").then(() => {}),
  "/tasks": () => Promise.all([import("@/pages/tasks")]).then(() => {}),
  "/login": () => import("@/pages/login").then(() => {}),
  "/signup": () => import("@/pages/signup").then(() => {}),
  "/chefs": prefetchChefs,
  "/become-chef": () => import("@/pages/become-chef").then(() => {}),
  "/contact": () => import("@/pages/contact").then(() => {}),
};

/**
 * Prefetch route assets (and key data where available) to smooth navigation.
 */
export async function prefetchRoute(path: string) {
  const cleanPath = path.split("?")[0];
  const action = routePrefetchers[cleanPath];
  if (!action) return;

  try {
    await action();
  } catch (error) {
    console.warn("Prefetch failed", cleanPath, error);
  }
}
