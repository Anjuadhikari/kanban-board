// src/features/board/Card.tsx
// Adds a due-date picker (a native date input) and a date pill.

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { Card as CardModel } from "../../types/domain";

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function Card({
  card,
  onEditCard,
  onDeleteCard,
  onSetDueDate,
}: {
  card: CardModel;
  onEditCard: (id: string, newName: string) => void;
  onDeleteCard: (id: string) => void;
  onSetDueDate: (id: string, date: string | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id });
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(card.name);
  const [pickingDate, setPickingDate] = useState(false);

  function save() {
    const trimmed = text.trim();
    if (trimmed) onEditCard(card.id, trimmed);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        className="card-input"
        value={text}
        autoFocus
        onChange={(e) => setText(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") {
            setText(card.name);
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      className="card"
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        opacity: isDragging ? 0.4 : 1,
        cursor: "grab",
        touchAction: "none",
      }}
    >
      <div className="card-main">
        <span>{card.name}</span>
        <span className="card-actions">
          <button
            className="icon-btn"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setPickingDate((p) => !p)}
            title="Due date"
          >
            📅
          </button>
          <button
            className="icon-btn"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              setText(card.name);
              setEditing(true);
            }}
            title="Edit"
          >
            ✎
          </button>
          <button
            className="icon-btn"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDeleteCard(card.id)}
            title="Delete"
          >
            ✕
          </button>
        </span>
      </div>

      {pickingDate && (
        <input
          type="date"
          className="due-input"
          value={card.dueDate ?? ""}
          onPointerDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            onSetDueDate(card.id, e.target.value || null);
            setPickingDate(false);
          }}
        />
      )}

      {!pickingDate && card.dueDate && (
        <span className="due-pill">📅 {formatDate(card.dueDate)}</span>
      )}
    </div>
  );
}