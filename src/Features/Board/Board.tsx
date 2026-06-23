// src/features/board/Board.tsx
// Passes onSetDueDate down, plus CSS for the date pill and date input.

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import type {
  Board as BoardModel,
  Column as ColumnModel,
  Card as CardModel,
} from "../../types/domain";
import { Column } from "./Column";

const BACKGROUNDS = ["#FBD9E6", "#FFE2CE", "#D8E6F7", "#E2F0D9", "#EAD9F6", "#FFF1C9", "#FAD4D4"];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
  .board * { box-sizing: border-box; }
  .board { min-height: 100vh; background: linear-gradient(150deg, #FFE9D6 0%, #FBD9E6 45%, #D8E6F7 100%); color: #5A4A42; font-family: 'Nunito', system-ui, sans-serif; padding: 28px 24px 80px; }
  .topbar { display: inline-flex; align-items: center; gap: 12px; padding: 9px 16px 9px 12px; margin-bottom: 24px; background: rgba(255,255,255,0.5); border-radius: 14px; backdrop-filter: blur(8px); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
  .board-logo { width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0; background: linear-gradient(135deg, #FF9F5A, #F49AC2); box-shadow: 0 1px 3px rgba(0,0,0,0.12); }
  .board-title { font-size: clamp(18px, 4vw, 22px); font-weight: 800; margin: 0; }
  .board-columns { display: flex; gap: 16px; align-items: flex-start; overflow-x: auto; padding-bottom: 10px; scrollbar-width: thin; scrollbar-color: rgba(90,74,66,0.28) transparent; }
  .board-columns::-webkit-scrollbar { height: 10px; }
  .board-columns::-webkit-scrollbar-track { background: transparent; }
  .board-columns::-webkit-scrollbar-thumb { background: rgba(90,74,66,0.22); border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }
  .board-columns::-webkit-scrollbar-thumb:hover { background: rgba(90,74,66,0.4); background-clip: padding-box; }
  .column { background: rgba(255,255,255,0.55); backdrop-filter: blur(10px); border-radius: 16px; padding: 12px; width: 280px; flex-shrink: 0; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
  .column-header { display: flex; justify-content: space-between; align-items: center; padding: 4px 6px 12px; }
  .column-header-right { display: flex; align-items: center; gap: 6px; }
  .column-title { font-size: 15px; font-weight: 800; margin: 0; }
  .column-count { font-size: 12px; font-weight: 700; color: #fff; background: rgba(90,74,66,0.3); border-radius: 999px; min-width: 22px; height: 20px; padding: 0 6px; display: inline-flex; align-items: center; justify-content: center; }
  .cards { display: flex; flex-direction: column; gap: 8px; min-height: 8px; }
  .card { display: flex; flex-direction: column; gap: 6px; background: #fff; border-radius: 10px; padding: 10px 12px; font-size: 14px; font-weight: 600; color: #5A4A42; box-shadow: 0 1px 2px rgba(0,0,0,0.08); }
  .card:hover { box-shadow: 0 3px 8px rgba(0,0,0,0.12); }
  .card-main { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .card-actions { display: flex; gap: 2px; flex-shrink: 0; opacity: 0; transition: opacity .15s ease; }
  .card:hover .card-actions { opacity: 1; }
  @media (hover: none) { .card-actions { opacity: .55; } }
  .icon-btn { border: none; background: transparent; cursor: pointer; font-size: 13px; color: #A38B7B; padding: 2px 4px; line-height: 1; border-radius: 6px; }
  .icon-btn:hover { color: #5A4A42; background: rgba(0,0,0,0.05); }
  .due-pill { align-self: flex-start; font-size: 11px; font-weight: 700; color: #B5651D; background: #FFEAD6; border-radius: 6px; padding: 2px 7px; }
  .due-input { align-self: flex-start; border: none; border-radius: 6px; padding: 4px 6px; font-family: inherit; font-size: 12px; font-weight: 600; color: #5A4A42; box-shadow: 0 0 0 2px #FF9F5A; outline: none; }
  .card-input { width: 100%; background: #fff; border: none; border-radius: 10px; padding: 10px 12px; font-size: 14px; font-weight: 600; font-family: inherit; color: #5A4A42; box-shadow: 0 0 0 2px #FF9F5A; outline: none; }
  .add-card-btn { margin-top: 8px; width: 100%; border: none; background: transparent; color: #7A6A60; font-weight: 700; font-size: 13px; font-family: inherit; padding: 8px; border-radius: 8px; cursor: pointer; text-align: left; }
  .add-card-btn:hover { background: rgba(255,255,255,0.6); }
  .add-column-btn { flex-shrink: 0; width: 280px; background: rgba(255,255,255,0.35); border: 1.5px dashed rgba(90,74,66,0.3); color: #5A4A42; font-weight: 700; font-size: 14px; font-family: 'Nunito', system-ui, sans-serif; padding: 14px; border-radius: 16px; cursor: pointer; text-align: left; backdrop-filter: blur(6px); }
  .add-column-btn:hover { background: rgba(255,255,255,0.65); }
  .column-input { flex-shrink: 0; width: 280px; background: rgba(255,255,255,0.9); border: none; border-radius: 16px; padding: 14px; font-size: 14px; font-weight: 700; font-family: 'Nunito', system-ui, sans-serif; color: #5A4A42; box-shadow: 0 0 0 2px #FF9F5A; outline: none; }
  .bg-picker { position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; padding: 8px 12px; background: rgba(255,255,255,0.6); backdrop-filter: blur(10px); border-radius: 999px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); z-index: 10; }
  .bg-swatch { width: 26px; height: 26px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.9); cursor: pointer; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
  .bg-swatch-active { outline: 2px solid #5A4A42; outline-offset: 2px; }
  @media (max-width: 640px) { .board { padding: 18px 14px 80px; } .board-columns { gap: 12px; } .column { width: 80vw; max-width: 300px; } .add-column-btn, .column-input { width: 80vw; max-width: 300px; } }
`;

export function Board({
  board,
  columns,
  cards,
  background,
  onAddCard,
  onAddColumn,
  onEditCard,
  onDeleteCard,
  onMoveCard,
  onDeleteColumn,
  onChangeBackground,
  onSetDueDate,
}: {
  board: BoardModel;
  columns: ColumnModel[];
  cards: CardModel[];
  background: string | null;
  onAddCard: (columnId: string, name: string) => void;
  onAddColumn: (name: string) => void;
  onEditCard: (id: string, newName: string) => void;
  onDeleteCard: (id: string) => void;
  onMoveCard: (cardId: string, targetColumnId: string) => void;
  onDeleteColumn: (id: string) => void;
  onChangeBackground: (color: string) => void;
  onSetDueDate: (id: string, date: string | null) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [addingColumn, setAddingColumn] = useState(false);
  const [columnText, setColumnText] = useState("");

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    onMoveCard(active.id as string, over.id as string);
  }

  function saveColumn() {
    const trimmed = columnText.trim();
    if (trimmed) onAddColumn(trimmed);
    setColumnText("");
    setAddingColumn(false);
  }

  return (
    <div className="board" style={{ background: background ?? undefined }}>
      <style>{styles}</style>

      <div className="topbar">
        <span className="board-logo" />
        <h1 className="board-title">{board.name}</h1>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="board-columns">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              cards={cards.filter((card) => card.columnId === column.id)}
              onAddCard={onAddCard}
              onEditCard={onEditCard}
              onDeleteCard={onDeleteCard}
              onDeleteColumn={onDeleteColumn}
              onSetDueDate={onSetDueDate}
            />
          ))}

          {addingColumn ? (
            <input
              className="column-input"
              value={columnText}
              autoFocus
              placeholder="List name…"
              onChange={(e) => setColumnText(e.target.value)}
              onBlur={saveColumn}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveColumn();
                if (e.key === "Escape") {
                  setColumnText("");
                  setAddingColumn(false);
                }
              }}
            />
          ) : (
            <button className="add-column-btn" onClick={() => setAddingColumn(true)}>
              + Add another list
            </button>
          )}
        </div>
      </DndContext>

      <div className="bg-picker">
        {BACKGROUNDS.map((color) => (
          <button
            key={color}
            className={"bg-swatch" + (color === background ? " bg-swatch-active" : "")}
            style={{ background: color }}
            onClick={() => onChangeBackground(color)}
            title="Background"
          />
        ))}
      </div>
    </div>
  );
}