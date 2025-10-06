/**
 * Types for Hand Notes and Tags System
 */

export interface HandNotes {
  id: string;
  handId: string;
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TagSystem {
  predefinedTags: string[];
  customTags: string[];
}

export interface HandNotesProps {
  handId: string;
  onNotesChanged?: (notes: HandNotes) => void;
  initialNotes?: string;
  initialTags?: string[];
}

// Predefined tags categorized
export const PREDEFINED_TAGS = {
  resultado: ['boa-jogada', 'erro', 'bad-beat', 'cooler'],
  situacao: ['bluff', 'value-bet', 'semi-bluff', 'trap', 'slowplay'],
  posicao: ['btn', 'sb', 'bb', 'utg', 'mp', 'co', 'ep'],
  tipoMao: ['premium', 'drawing', 'marginal', 'trash', 'suited-connector'],
  oponente: ['vs-tight', 'vs-loose', 'vs-aggressive', 'vs-passive', 'vs-fish', 'vs-reg'],
  estudo: ['revisar', 'discutir', 'exemplo', 'conceito', 'duvida'],
  acao: ['all-in', '3bet', '4bet', 'call', 'fold', 'raise', 'check'],
} as const;

export type TagCategory = keyof typeof PREDEFINED_TAGS;
