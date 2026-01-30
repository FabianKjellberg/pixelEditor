import { NotAuthenticatedError } from '@/models/Error';
import * as users from './users';

type MethodNoBody = 'GET';
type MethodWithBody = 'PUT' | 'POST' | 'DELETE';

type HttpMethod = MethodNoBody | MethodWithBody;

const baseUrl: string = 'http://localhost:3000';

let refreshTokenPromise: Promise<void> | null = null;

// single source of truth for the access token. Not persisted anywhere for security.
let accessToken: string | null = null;

function getAccessToken() {
  return accessToken;
}

function setAccessToken(token: string | null ) {
  accessToken = token;
}

// function overloading to allow for different signatures.
export function apiClient<TResponse, TBody>(
  method: MethodWithBody,
  url: string,
  body: TBody,
): Promise<TResponse>;
export function apiClient<TResponse>(
  method: MethodNoBody,
  url: string,
): Promise<TResponse>;

/**
 * Generic function to handle every request, 
 * handles authentication and error handling and refreshing the token if expired. 
 * also handles baseUrl and headers automatically.
 * @param method - The HTTP method to use
 * @param url - The URL to fetch
 * @param body - The body to send with the request
 * @returns The response from the API
 */
export async function apiClient<TResponse, TBody = undefined>(
  method: HttpMethod,
  url: string,
  body?: TBody,
): Promise<TResponse> {
  //fetch function that can be reused if the token is refreshed.
  const fetchResponse = async () => {
    const token = getAccessToken()
    const headers: HeadersInit = {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    return fetch(baseUrl + url, {
      method,
      credentials: 'omit',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  //initial fetch
  let response = await fetchResponse();
  
  //if unauthorized, refresh the token and fetch again.
  if (response.status === 401) {
    await refreshTokenWithLock();
    response = await fetchResponse();
  }

  //last response
  if (!response.ok) {
    throw new Error(`failed to fetch ${url}: ${response.statusText}`);
  }
  
  //parse the response body as JSON.
  const responseData = await response.json();
  return responseData as TResponse;
}

/**
 * Creates a promise to refresh the access token using the refresh token stored in cookies.
 * If the promise is already created, returns the existing promise.
 * @returns void. Throws error if refresh fails.
 */
export async function refreshTokenWithLock(): Promise<void> {
  if (!refreshTokenPromise) {
    refreshTokenPromise = (async () => {
      try {
        await refreshToken()
      } finally {
        refreshTokenPromise = null
      }
    })()
  }
  return refreshTokenPromise
}

/**
 * Refreshes the access token using the refresh token stored in cookies.
 * @returns void. Throws error if refresh fails.
 */
export async function refreshToken(): Promise<void> {
  //refresh token endpoint include cookies to allow persistent sessions.
  const response = await fetch(baseUrl + '/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });

  //if refresh fails, send unique error for UI to handle.
  if (!response.ok) {
    throw new NotAuthenticatedError('Not authenticated');
  }

  //set the new access token.
  const data = await response.json();
  setAccessToken(data.accessToken);
}

// export api functions for easier usage. Each module should export functions that use the apiClient.
export const api = {
  users,
};
