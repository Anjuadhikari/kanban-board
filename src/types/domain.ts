export interface Board {
  readonly id: string;
  name: string;
}

export interface Column {
  readonly id: string;
  name: string;
  boardId: string;   // which board this column belongs to
  position: number;  // order within the board
}

export interface Card {
  readonly id: string;
  name: string;
  description?: string;
  columnId: string;  // which column this card belongs to
  position: number;  // order within its column
}

// src/types/domain.ts

export interface Board {
  readonly id: string;
  name: string;
}

export interface Column {
  readonly id: string;
  name: string;
  boardId: string;
  position: number;
}

export interface Card {
  readonly id: string;
  name: string;
  description?: string;
  columnId: string;
  position: number;
  dueDate?: string | null; // ISO date like "2026-06-25", or null
}