import { AiAction, AiResponse } from '@/models/AiModels';
import { apiClient } from './client';

export async function testAi(promt: string, width: number, height: number) {
  const response = await apiClient('POST', '/ai/test', { promt, width, height });

  if (!response.ok) {
    throw new Error('AI request failed');
  }

  const data = (await response.json()) as AiResponse;

  console.log('plan', data.planText);

  return data.actions;
}
