"use client";

import { useEffect } from "react";
import { tokens } from "@/theme";

// Last resort when even the main layout fails. It replaces the whole page,
// so it carries its own simple styles instead of the app theme.
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error("App failed:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: "48px 16px",
          fontFamily: "system-ui, sans-serif",
          color: tokens.ink,
          background: tokens.surface,
          lineHeight: 1.5,
        }}
      >
        <title>Something went wrong | FirstStep</title>
        <main style={{ maxWidth: 600, margin: "0 auto" }}>
          <h1 style={{ color: tokens.tealDark, fontSize: "2rem", margin: "0 0 16px" }}>
            Something went wrong
          </h1>
          <p role="alert" style={{ margin: "0 0 24px" }}>
            FirstStep didn&apos;t load properly. It&apos;s not something you did.
            Please try again. Your saved answers are not affected.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              minHeight: 44,
              padding: "8px 20px",
              border: 0,
              borderRadius: 4,
              background: tokens.teal,
              color: tokens.surface,
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
