import * as users from './users';

type MethodNoBody = 'GET';
type MethodWithBody = 'PUT' | 'POST' | 'DELETE';

type HttpMethod = MethodNoBody | MethodWithBody;

export function apiClient<TResponse, TBody>(
  method: MethodWithBody,
  url: string,
  incCredentials: boolean,
  body: TBody,
): Promise<TResponse>;
export function apiClient<TResponse>(
  method: MethodNoBody,
  url: string,
  incCredentials: boolean,
): Promise<TResponse>;

export async function apiClient<TResponse, TBody = undefined>(
  method: HttpMethod,
  url: string,
  incCredentials: boolean,
  body?: TBody,
): Promise<TResponse> {
  const credentials: RequestCredentials = incCredentials ? 'include' : 'omit';

  const response = await fetch(url, {
    method,
    credentials: credentials,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    if (response.status === 401) {
    }
  }

  return response as TResponse;
}

export const api = {
  users,
};
