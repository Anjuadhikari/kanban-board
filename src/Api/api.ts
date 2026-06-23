import type { Board, Column, Card } from "../types/domain";

export interface Api {
  // Boards
  getBoards(): Promise<Board[]>;
  getBoard(id: string): Promise<Board>;
  createBoard(name: string): Promise<Board>;
  updateBoard(board: Board): Promise<Board>;
  deleteBoard(id: string): Promise<void>;

  // Columns
  getColumns(boardId: string): Promise<Column[]>;
  createColumn(
    boardId: string,
    data: Pick<Column, "name" | "position">
  ): Promise<Column>;
  updateColumn(column: Column): Promise<Column>;
  deleteColumn(id: string): Promise<void>;

  // Cards
  getCards(boardId: string): Promise<Card[]>;
  createCard(
    columnId: string,
    data: Pick<Card, "name" | "description" | "position">
  ): Promise<Card>;
  updateCard(card: Card): Promise<Card>;
  deleteCard(id: string): Promise<void>;

  // Drag & drop
  moveCard(
    cardId: string,
    targetColumnId: string,
    targetPosition: number
  ): Promise<void>;

  moveColumn(columnId: string, targetPosition: number): Promise<void>;
}