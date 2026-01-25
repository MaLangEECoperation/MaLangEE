/**
 * Fetch 기반 통합 API 클라이언트
 * 서버/클라이언트 공용, Bearer 토큰 자동 주입, 에러 핸들링 포함
 */

import { STORAGE_KEYS } from "@/shared/config";

import { ApiError, getApiUrl } from "./config";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface FetchClientOptions {
  params?: Record<string, string>;
  headers?: HeadersInit;
  contentType?: "json" | "form-urlencoded";
  skipAuth?: boolean;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

function buildUrl(endpoint: string, params?: Record<string, string>): string {
  const baseUrl = getApiUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  let url = `${baseUrl}${cleanEndpoint}`;

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  return url;
}

function buildHeaders(options: FetchClientOptions = {}): Headers {
  const headers = new Headers();
  const { contentType = "json", skipAuth = false } = options;

  if (contentType === "json") {
    headers.set("Content-Type", "application/json");
  } else if (contentType === "form-urlencoded") {
    headers.set("Content-Type", "application/x-www-form-urlencoded");
  }

  headers.set("Accept", "application/json");

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (options.headers) {
    const custom = new Headers(options.headers);
    custom.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

function serializeBody(
  data: unknown,
  contentType: "json" | "form-urlencoded" = "json"
): string | undefined {
  if (data === undefined || data === null) return undefined;

  if (contentType === "form-urlencoded") {
    if (data instanceof URLSearchParams) return data.toString();
    if (typeof data === "object") {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(data as Record<string, string>)) {
        params.append(key, String(value));
      }
      return params.toString();
    }
    return String(data);
  }

  return JSON.stringify(data);
}

async function request<T>(
  method: HttpMethod,
  endpoint: string,
  data?: unknown,
  options: FetchClientOptions = {}
): Promise<T> {
  const url = buildUrl(endpoint, options.params);
  const headers = buildHeaders(options);
  const body = method !== "GET" ? serializeBody(data, options.contentType) : undefined;

  const response = await fetch(url, {
    method,
    headers,
    body,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // 401: 인증 오류 - 토큰 제거 및 리다이렉트
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!window.location.pathname.startsWith("/auth/login")) {
          window.location.href = "/auth/login";
        }
      }
    }

    // 422: FastAPI 유효성 검사 오류
    if (response.status === 422 && errorData.detail && Array.isArray(errorData.detail)) {
      const validationErrors = errorData.detail.map((err: { msg: string }) => err.msg).join(", ");
      throw new ApiError(422, validationErrors || "입력 정보를 확인해주세요", errorData.detail);
    }

    const message = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
    throw new ApiError(response.status, message, errorData);
  }

  // 204 No Content 또는 빈 응답 처리
  const text = await response.text();
  if (!text) return undefined as T;

  return JSON.parse(text) as T;
}

export const fetchClient = {
  get<T>(endpoint: string, options?: FetchClientOptions): Promise<T> {
    return request<T>("GET", endpoint, undefined, options);
  },

  post<T>(endpoint: string, data?: unknown, options?: FetchClientOptions): Promise<T> {
    return request<T>("POST", endpoint, data, options);
  },

  put<T>(endpoint: string, data?: unknown, options?: FetchClientOptions): Promise<T> {
    return request<T>("PUT", endpoint, data, options);
  },

  patch<T>(endpoint: string, data?: unknown, options?: FetchClientOptions): Promise<T> {
    return request<T>("PATCH", endpoint, data, options);
  },

  del<T>(endpoint: string, options?: FetchClientOptions): Promise<T> {
    return request<T>("DELETE", endpoint, undefined, options);
  },
};
