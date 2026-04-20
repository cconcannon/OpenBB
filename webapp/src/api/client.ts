import createClient from "openapi-fetch";
import type { paths } from "./schema";

const STORAGE_KEY = "openbb.apiBaseUrl";
const DEFAULT_BASE_URL = "http://127.0.0.1:6900";

export function getApiBaseUrl(): string {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_BASE_URL;
}

export function setApiBaseUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY, url);
}

export const api = createClient<paths>({
  get baseUrl() {
    return getApiBaseUrl();
  },
});

export type ApiPaths = paths;
export type ApiPath = keyof paths;
