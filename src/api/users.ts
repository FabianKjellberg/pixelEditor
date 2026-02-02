import { apiClient, clientLogin, clientLogout, refreshToken } from './client';

type LoginResult = {
  ok: boolean;
  reason?: string;
};

type RegisterResult = {
  ok: boolean;
  reason?: string;
};

export type User = {
  userId: string;
  username: string;
  latestActivity?: Date;
  createdAt?: Date;
};

export async function createAccount(username: string, password: string): Promise<RegisterResult> {
  try {
    const response = await apiClient('POST', '/auth/register', { username, password });

    console.log(response);

    if (response.status === 409) {
      return { ok: false, reason: 'username already exists' };
    }

    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, reason: 'unknown failure' };
  }
}

export async function login(username: string, password: string): Promise<LoginResult> {
  try {
    const response = await clientLogin(username, password);

    if (response.status === 401) {
      return { ok: false, reason: 'invalid credentials' };
    }

    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, reason: 'unknown failure' };
  }
}

export async function getLoggedInUser(): Promise<User | null> {
  try {
    const response = await apiClient('GET', '/user/me');

    if (!response.ok) {
      console.error('couldnt retrieve any logged in user');
      return null;
    }

    const data = (await response.json()) as User;

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function logout(): Promise<boolean> {
  return clientLogout();
}
