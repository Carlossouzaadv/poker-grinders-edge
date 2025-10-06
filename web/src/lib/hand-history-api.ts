import { apiClient } from './api-client';
import type { HandHistory } from '@/types/poker';

/**
 * API service for Hand History Sessions
 */

export interface HandHistorySession {
  id: string;
  name: string;
  siteFormat: string;
  totalHands: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddHandsResponse {
  id: string;
  name: string;
  totalHands: number;
  handsAdded: number;
  isNew: boolean;
}

/**
 * Adiciona mãos a uma sessão existente ou cria nova sessão
 * Agrupa automaticamente por torneio + data
 */
export async function addHandsToSession(
  tournamentName: string,
  date: string,
  parsedHands: HandHistory[]
): Promise<AddHandsResponse> {
  const response = await apiClient.post('/hand-history-sessions/add-hands', {
    tournamentName,
    date,
    parsedHands,
  });

  return response.data;
}

/**
 * Lista todas as sessões do usuário
 */
export async function listHandHistorySessions(): Promise<HandHistorySession[]> {
  const response = await apiClient.get('/hand-history-sessions');
  return response.data;
}

/**
 * Busca uma mão específica de uma sessão
 */
export async function getHandByIndex(
  sessionId: string,
  handIndex: number
): Promise<{ parsedData: HandHistory }> {
  const response = await apiClient.get(
    `/hand-history-sessions/${sessionId}/hands/${handIndex}`
  );
  return response.data;
}

/**
 * Deleta uma sessão
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await apiClient.delete(`/hand-history-sessions/${sessionId}`);
}
