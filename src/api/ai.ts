import { AiAction, AiResponse, MessageItem } from '@/models/AiModels';
import { apiClient } from './client';

export async function testAi(promts: MessageItem[], width: number, height: number) {
  const response = await apiClient('POST', '/ai/test', { promts, width, height });

  if (!response.ok) {
    throw new Error('AI request failed');
  }

  const data = (await response.json()) as AiResponse;

  return data.actions;
}
