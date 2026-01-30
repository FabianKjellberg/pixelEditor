import { apiClient } from './client';

export async function createAccount(username: string, password: string): Promise<void> {
  const response = await apiClient('POST', '/auth/register', { username, password });

  console.log('response', response);
}
