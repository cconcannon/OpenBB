import {
  QueryClient,
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { FetchOptions } from "openapi-fetch";
import type { FilterKeys, PathsWithMethod } from "openapi-typescript-helpers";
import { api, type ApiPaths } from "./client";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

type GetPath = PathsWithMethod<ApiPaths, "get">;
type GetInit<P extends GetPath> = FetchOptions<FilterKeys<ApiPaths[P], "get">>;
type QueryParams<P extends GetPath> = NonNullable<NonNullable<GetInit<P>["params"]>["query"]>;

export function useOpenBBQuery<P extends GetPath>(
  path: P,
  init: GetInit<P>,
  options?: Omit<UseQueryOptions<unknown, Error>, "queryKey" | "queryFn">,
): UseQueryResult<unknown, Error> {
  return useQuery({
    queryKey: [path, init?.params],
    queryFn: async () => {
      const { data, error } = await api.GET(path, init);
      if (error) throw new Error(JSON.stringify(error));
      return data;
    },
    ...options,
  });
}

export function useEquitySearch(query: string, extra: Partial<QueryParams<"/api/v1/equity/search">> = {}) {
  return useOpenBBQuery(
    "/api/v1/equity/search",
    { params: { query: { query, ...extra } } },
    { enabled: query.length > 0 },
  );
}

export function useEquityQuote(symbol: string, extra: Partial<QueryParams<"/api/v1/equity/price/quote">> = {}) {
  return useOpenBBQuery(
    "/api/v1/equity/price/quote",
    { params: { query: { provider: "yfinance", symbol, ...extra } } },
    { enabled: symbol.length > 0 },
  );
}

export function useEquityHistorical(
  symbol: string,
  extra: Partial<QueryParams<"/api/v1/equity/price/historical">> = {},
) {
  return useOpenBBQuery(
    "/api/v1/equity/price/historical",
    { params: { query: { provider: "yfinance", symbol, ...extra } } },
    { enabled: symbol.length > 0 },
  );
}
