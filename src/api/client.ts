import type {
  ApiErrorBody,
  AuthResponse,
} from "../types/api";

export const API_URL =
  import.meta.env.VITE_API_URL ??
  "https://nextshift-1065882590623.asia-northeast3.run.app";

const TOKEN_KEY = "passon.accessToken";

let accessToken: string | null = sessionStorage.getItem(TOKEN_KEY);

let refreshPromise: Promise<string | null> | null =
  null;

const inflightGets = new Map<string, Promise<unknown>>();

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  setAccessToken(null);
}

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;

  constructor(error: ApiErrorBody) {
    super(error.message);

    this.name = "ApiError";
    this.status = error.status;
    this.code = error.code;
    this.fields = error.fields;
  }
}

async function getError(
  response: Response
): Promise<ApiErrorBody> {
  try {
    return await response.json();
  } catch {
    return {
      status: response.status,
      code: "HTTP_ERROR",
      message: "요청 처리 중 오류가 발생했습니다.",
    };
  }
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = loadRefreshToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function loadRefreshToken() {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      setAccessToken(null);
      return null;
    }
    const data = (await response.json()) as AuthResponse;
    if (!data.accessToken) {
      setAccessToken(null);
      return null;
    }
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

interface ApiOptions extends RequestInit {
  auth?: boolean;
  retry?: boolean;
  share?: boolean;
}

export async function api<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { share = true, ...request } = options;
  const method = (request.method ?? "GET").toUpperCase();
  if (share && method === "GET") {
    const key = `${method} ${path}`;
    const existing = inflightGets.get(key);
    if (existing) return existing as Promise<T>;
    const promise = performApi<T>(path, request);
    inflightGets.set(key, promise);
    void promise.finally(() => {
      if (inflightGets.get(key) === promise) inflightGets.delete(key);
    });
    return promise;
  }
  return performApi<T>(path, request);
}

async function performApi<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    auth = true,
    retry = true,
    headers,
    ...requestOptions
  } = options;

  const requestHeaders = new Headers(headers);

  if (
    requestOptions.body &&
    !(requestOptions.body instanceof FormData) &&
    !requestHeaders.has("Content-Type")
  ) {
    requestHeaders.set(
      "Content-Type",
      "application/json"
    );
  }

  if (auth && accessToken) {
    requestHeaders.set(
      "Authorization",
      `Bearer ${accessToken}`
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...requestOptions,
      headers: requestHeaders,
      credentials: "include",
    }
  );

  if (
    response.status === 401 &&
    auth &&
    retry
  ) {
    const newToken =
      await refreshAccessToken();

    if (newToken) {
      return api<T>(path, {
        ...options,
        retry: false,
        share: false,
      });
    }
  }

  if (!response.ok) {
    throw new ApiError(
      await getError(response)
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}