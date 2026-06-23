// src/Login.tsx
// The screen shown when nobody is logged in. One button: sign in with Google.

import { supabase } from "./Lib/supabase";

export function Login() {
  async function signInWithGoogle() {
    // this redirects to Google, then back to your app, logged in
    await supabase.auth.signInWithOAuth({ provider: "google" });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(150deg, #FFE9D6 0%, #FBD9E6 45%, #D8E6F7 100%)",
        fontFamily: "'Nunito', system-ui, sans-serif",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(10px)",
          padding: "40px 36px",
          borderRadius: 20,
          textAlign: "center",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          maxWidth: 340,
          width: "100%",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            margin: "0 auto 16px",
            background: "linear-gradient(135deg, #FF9F5A, #F49AC2)",
          }}
        />
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#5A4A42", margin: "0 0 6px" }}>
          My first board
        </h1>
        <p style={{ color: "#A38B7B", fontWeight: 600, margin: "0 0 24px", fontSize: 14 }}>
          Sign in to see your boards
        </p>
        <button
          onClick={signInWithGoogle}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "none",
            borderRadius: 12,
            background: "#FF9F5A",
            color: "#fff",
            fontWeight: 800,
            fontSize: 15,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}