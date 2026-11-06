"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useRef, useState } from "react";

type Status = "loading" | "guest" | "saved" | "error";

export default function GuestStart() {
  const [status, setStatus] = useState<Status>("loading");
  const started = useRef(false);

  const start = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/session", { method: "POST" });
      if (!response.ok) {
        setStatus("error");
        return;
      }
      const { isGuest } = await response.json();
      setStatus(isGuest ? "guest" : "saved");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // React runs effects twice in development. Create only one guest.
    if (started.current) return;
    started.current = true;
    const timer = setTimeout(start, 0);
    return () => clearTimeout(timer);
  }, [start]);

  return (
    <Box sx={{ mt: 3, minHeight: 96 }}>
      {status === "loading" && (
        <Typography role="status">Getting things ready...</Typography>
      )}
      {status === "guest" && (
        <Typography role="status">
          You&apos;re in, with no sign-up needed. Your progress stays in this
          browser, so clearing your browser data will remove it.
        </Typography>
      )}
      {status === "saved" && (
        <>
          <Typography role="status" sx={{ mb: 2 }}>
            You&apos;re signed in. Your progress is saved to your Google
            account, so you can continue on any device.
          </Typography>
          <form action="/auth/sign-out" method="post">
            <Button type="submit" variant="outlined" color="primary">
              Sign out
            </Button>
          </form>
        </>
      )}
      {status === "error" && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={start}>
              Try again
            </Button>
          }
        >
          We couldn&apos;t get FirstStep ready. Please try again in a moment.
        </Alert>
      )}
    </Box>
  );
}
