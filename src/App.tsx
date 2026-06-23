// src/App.tsx
// Server data now flows through React Query: useQuery to read, useMutation to write.

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Board } from "./Features/Board/Board";
import { Login } from "./Login";
import { supabase } from "./Lib/supabase";
import type { Session } from "@supabase/supabase-js";
import type { Board as BoardModel, Column, Card } from "./types/domain";

type DbColumn = { id: string; board_id: string; name: string; position: number };
type DbCard = { id: string; column_id: string; name: string; position: number; due_date: string | null };

const toColumn = (r: DbColumn): Column => ({ id: r.id, name: r.name, boardId: r.board_id, position: r.position });
const toCard = (r: DbCard): Card => ({
  id: r.id,
  name: r.name,
  columnId: r.column_id,
  position: r.position,
  dueDate: r.due_date ?? null,
});

const centered: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'Nunito', system-ui, sans-serif",
  color: "#6B5648",
  background: "linear-gradient(150deg, #FFE9D6 0%, #FBD9E6 45%, #D8E6F7 100%)",
};

// the fetch function for our one query: get/create the board, then its columns + cards
async function fetchBoardData(userId: string) {
  const { data: boards } = await supabase.from("boards").select("*").limit(1);
  let dbBoard = boards && boards[0];

  if (!dbBoard) {
    const { data: created } = await supabase
      .from("boards")
      .insert({ name: "My first board", user_id: userId })
      .select()
      .single();
    dbBoard = created;
    await supabase.from("columns").insert([
      { board_id: dbBoard.id, name: "To do", position: 1 },
      { board_id: dbBoard.id, name: "In progress", position: 2 },
      { board_id: dbBoard.id, name: "Done", position: 3 },
    ]);
  }

  const { data: cols } = await supabase.from("columns").select("*").eq("board_id", dbBoard.id).order("position");
  const columns = (cols ?? []).map(toColumn);

  const colIds = columns.map((c) => c.id);
  let cards: Card[] = [];
  if (colIds.length > 0) {
    const { data: crds } = await supabase.from("cards").select("*").in("column_id", colIds).order("position");
    cards = (crds ?? []).map(toCard);
  }

  return {
    board: { id: dbBoard.id, name: dbBoard.name } as BoardModel,
    background: (dbBoard.background ?? null) as string | null,
    columns,
    cards,
  };
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingAuth(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // READ: one query holds all the board's data
  const { data, isLoading } = useQuery({
    queryKey: ["board", session?.user.id],
    queryFn: () => fetchBoardData(session!.user.id),
    enabled: !!session, // don't run until logged in
  });

  const board = data?.board ?? null;
  const columns = data?.columns ?? [];
  const cards = data?.cards ?? [];
  const background = data?.background ?? null;

  // after any change, refetch the board data
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["board"] });

  // WRITE: one mutation per action. Each saves, then invalidates so the query refetches.
  const addCardM = useMutation({
    mutationFn: async (v: { columnId: string; name: string }) => {
      const { error } = await supabase.from("cards").insert({ column_id: v.columnId, name: v.name, position: cards.length + 1 });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const addColumnM = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("columns").insert({ board_id: board!.id, name, position: columns.length + 1 });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteCardM = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const editCardM = useMutation({
    mutationFn: async (v: { id: string; name: string }) => {
      const { error } = await supabase.from("cards").update({ name: v.name }).eq("id", v.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteColumnM = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("columns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const moveCardM = useMutation({
    mutationFn: async (v: { cardId: string; targetColumnId: string }) => {
      const { error } = await supabase.from("cards").update({ column_id: v.targetColumnId }).eq("id", v.cardId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const changeBackgroundM = useMutation({
    mutationFn: async (color: string) => {
      const { error } = await supabase.from("boards").update({ background: color }).eq("id", board!.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const setDueDateM = useMutation({
    mutationFn: async (v: { id: string; date: string | null }) => {
      const { error } = await supabase.from("cards").update({ due_date: v.date }).eq("id", v.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  if (loadingAuth) return <div style={centered}>Loading…</div>;
  if (!session) return <Login />;
  if (isLoading || !board) return <div style={centered}>Loading your board…</div>;

  return (
    <>
      <Board
        board={board}
        columns={columns}
        cards={cards}
        background={background}
        onAddCard={(columnId, name) => addCardM.mutate({ columnId, name })}
        onAddColumn={(name) => addColumnM.mutate(name)}
        onEditCard={(id, name) => editCardM.mutate({ id, name })}
        onDeleteCard={(id) => deleteCardM.mutate(id)}
        onMoveCard={(cardId, targetColumnId) => moveCardM.mutate({ cardId, targetColumnId })}
        onDeleteColumn={(id) => deleteColumnM.mutate(id)}
        onChangeBackground={(color) => changeBackgroundM.mutate(color)}
        onSetDueDate={(id, date) => setDueDateM.mutate({ id, date })}
      />
      <button
        onClick={() => supabase.auth.signOut()}
        style={{
          position: "fixed",
          top: 18,
          right: 20,
          padding: "8px 14px",
          border: "none",
          borderRadius: 10,
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(6px)",
          color: "#5A4A42",
          fontWeight: 700,
          fontSize: 13,
          fontFamily: "'Nunito', system-ui, sans-serif",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        Sign out
      </button>
    </>
  );
}