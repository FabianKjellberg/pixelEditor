import { apiClient } from './client';

export async function createAccount(username: string, password: string): Promise<void> {
  const response = await apiClient('POST', '/api/users', { username, password });

  console.log('response', response);
}
