// src/features/board/Column.tsx
// Passes the new onSetDueDate handler down to each card.

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { Column as ColumnModel, Card as CardModel } from "../../types/domain";
import { Card } from "./Card";

export function Column({
  column,
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onDeleteColumn,
  onSetDueDate,
}: {
  column: ColumnModel;
  cards: CardModel[];
  onAddCard: (columnId: string, name: string) => void;
  onEditCard: (id: string, newName: string) => void;
  onDeleteCard: (id: string) => void;
  onDeleteColumn: (id: string) => void;
  onSetDueDate: (id: string, date: string | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");

  function saveCard() {
    const trimmed = text.trim();
    if (trimmed) onAddCard(column.id, trimmed);
    setText("");
    setAdding(false);
  }

  return (
    <div
      ref={setNodeRef}
      className="column"
      style={{
        outline: isOver ? "2px dashed rgba(90,74,66,0.45)" : "2px dashed transparent",
        outlineOffset: 3,
        transition: "outline-color .15s ease",
      }}
    >
      <div className="column-header">
        <h2 className="column-title">{column.name}</h2>
        <div className="column-header-right">
          <span className="column-count">{cards.length}</span>
          <button className="icon-btn" onClick={() => onDeleteColumn(column.id)} title="Delete list">
            ✕
          </button>
        </div>
      </div>

      <div className="cards">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onEditCard={onEditCard}
            onDeleteCard={onDeleteCard}
            onSetDueDate={onSetDueDate}
          />
        ))}
      </div>

      {adding ? (
        <input
          className="card-input"
          style={{ marginTop: 8 }}
          value={text}
          autoFocus
          placeholder="Card name…"
          onChange={(e) => setText(e.target.value)}
          onBlur={saveCard}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveCard();
            if (e.key === "Escape") {
              setText("");
              setAdding(false);
            }
          }}
        />
      ) : (
        <button className="add-card-btn" onClick={() => setAdding(true)}>
          + Add a card
        </button>
      )}
    </div>
  );
}