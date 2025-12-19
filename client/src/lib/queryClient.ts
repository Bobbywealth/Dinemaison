import { QueryClient, QueryFunction } from "@tanstack/react-query";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export function buildApiUrl(url: string) {
  if (isAbsoluteUrl(url) || !apiBaseUrl) return url;
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Clone the response before consuming it to avoid "body already used" errors
    const clonedRes = res.clone();
    const text = (await clonedRes.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(buildApiUrl(url), {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(buildApiUrl(queryKey.join("/") as string), {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    // Clone response before checking if it's OK to avoid consuming the body
    await throwIfResNotOk(res.clone());
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      // Keep data warm for nav transitions while avoiding unbounded memory
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 15,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
