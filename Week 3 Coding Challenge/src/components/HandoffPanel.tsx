"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";
import AppLink from "@/components/AppLink";

type Props = { email: string; firstName: string };
type Load = "loading" | "ready" | "failed";

const SUBJECT = "FirstStep question";

/**
 * Records the "Talk to a person" visit once (T-22), then shows the member's
 * summary with Copy summary and an email that already contains it (T-23).
 * The contact works even if the summary can't load.
 */
export default function HandoffPanel({ email, firstName }: Props) {
  const [load, setLoad] = useState<Load>("loading");
  const [summary, setSummary] = useState("");
  const [copyNote, setCopyNote] = useState("");
  const sent = useRef(false);

  useEffect(() => {
    // React runs effects twice in development; record only once.
    const timer = setTimeout(async () => {
      if (sent.current) return;
      sent.current = true;
      try {
        const response = await fetch("/api/handoff", { method: "POST", signal: AbortSignal.timeout(15000) });
        const body = await response.json();
        if (!response.ok || typeof body.summary !== "string") throw new Error("no summary");
        setSummary(body.summary);
        setLoad("ready");
      } catch {
        setLoad("failed");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopyNote("Summary copied. Paste it into your message.");
    } catch {
      setCopyNote("Couldn't copy automatically. Select the summary text and copy it yourself.");
    }
  }

  const mailto =
    `mailto:${email}?subject=${encodeURIComponent(SUBJECT)}` +
    (load === "ready" ? `&body=${encodeURIComponent(summary)}` : "");

  return (
    <>
      <Button variant="contained" href={mailto} sx={{ minHeight: 44 }}>
        Email {firstName}
      </Button>
      <Typography variant="body2" sx={{ mt: 1.5, mb: 3 }}>
        Or copy the address: <Box component="span" sx={{ fontWeight: 700 }}>{email}</Box>
      </Typography>

      <Typography component="h2" id="summary-heading" sx={{ fontSize: "1.25rem", fontWeight: 700, mb: 1 }}>
        Your summary
      </Typography>
      <Typography sx={{ mb: 1.5 }}>
        So you don&apos;t have to explain everything again, this note has your
        FirstStep answers. It never includes anything you typed. The email
        button above adds it for you.
      </Typography>

      {load === "loading" && <Typography role="status">Getting your summary...</Typography>}
      {load === "failed" && (
        <Typography role="status">
          Your summary isn&apos;t available right now, but you can still email{" "}
          {firstName} using the button above.
        </Typography>
      )}
      {load === "ready" && (
        <Box
          component="pre"
          aria-labelledby="summary-heading"
          tabIndex={0}
          sx={{
            m: 0,
            p: 2,
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "background.default",
            fontFamily: "inherit",
            fontSize: "1rem",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {summary}
        </Box>
      )}

      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center", mt: 2 }}>
        <Button variant="outlined" onClick={copySummary} disabled={load !== "ready"} sx={{ minHeight: 44 }}>
          Copy summary
        </Button>
        <AppLink href="/" color="primary.dark" sx={{ fontWeight: 700 }}>
          Keep chatting
        </AppLink>
      </Stack>
      <Typography role="status" sx={{ mt: 1, minHeight: "1.5em" }}>
        {copyNote}
      </Typography>
    </>
  );
}
