import { apiClient, clientLogin, refreshToken } from './client';

export async function createAccount(username: string, password: string): Promise<void> {
  const response = await apiClient('POST', '/auth/register', { username, password });

  console.log('response', response);
}

export async function login(username: string, password: string): Promise<void> {
  const response = await clientLogin(username, password);

  console.log('response', response);
}

export async function refresh(): Promise<void> {
  const response = await refreshToken();

  console.log('response', response);
}
