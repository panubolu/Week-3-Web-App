"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ConversationState } from "@/domain/conversation";
import ChatBubble from "./ChatBubble";
import ProgressSteps from "./ProgressSteps";
import { QUESTIONS, labelFor, questionFor } from "./questions";

type Status = "loading" | "ready" | "failed";

const SAVE_ERROR = "We couldn't save that. Please try again in a moment.";

function hasAnswers(state: ConversationState) {
  return Boolean(state.goal || state.experience || state.availability);
}

export default function Conversation() {
  const [status, setStatus] = useState<Status>("loading");
  const [state, setState] = useState<ConversationState | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [returning, setReturning] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);
  const moveFocus = useRef(false);
  const firstOption = useRef<HTMLButtonElement>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const response = await fetch("/api/session", { method: "POST" });
      if (!response.ok) {
        setStatus("failed");
        return;
      }
      const session = await response.json();
      setState(session.state);
      setIsGuest(session.isGuest);
      setReturning(hasAnswers(session.state));
      setStatus("ready");
    } catch {
      setStatus("failed");
    }
  }, []);

  useEffect(() => {
    // React runs effects twice in development. Create only one guest.
    if (started.current) return;
    started.current = true;
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    firstOption.current?.focus();
  }, [state]);

  async function answer(field: string, value: string, label: string) {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "answer", field, value }),
      });
      const result = await response.json();
      if (response.ok) {
        moveFocus.current = true;
        setLastAnswer(label);
        setReturning(false);
        setState(result);
      } else if (response.status === 409) {
        setError(result.message);
        await load();
        setError(result.message);
      } else {
        setError(result.message ?? SAVE_ERROR);
      }
    } catch {
      setError(SAVE_ERROR);
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") {
    return (
      <Box sx={{ minHeight: 360 }}>
        <Typography role="status">Getting things ready...</Typography>
      </Box>
    );
  }

  if (status === "failed" || !state) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={load}>
            Try again
          </Button>
        }
      >
        We couldn&apos;t get FirstStep ready. Please try again in a moment.
      </Alert>
    );
  }

  const question = questionFor(state.currentStep);
  const answered = QUESTIONS.filter(({ field }) => state[field]);

  return (
    <Box sx={{ minHeight: 360 }}>
      <ProgressSteps current={question?.number ?? QUESTIONS.length + 1} />

      {answered.length > 0 && (
        <Box
          component="ul"
          aria-label="Your answers"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            listStyle: "none",
            m: 0,
            mb: 3,
            p: 0,
          }}
        >
          {answered.map(({ field, summaryLabel }) => (
            <li key={field}>
              <Chip
                variant="outlined"
                label={`${summaryLabel}: ${labelFor(field, state[field])}`}
              />
            </li>
          ))}
        </Box>
      )}

      <Stack spacing={1.5} role="log" aria-live="polite" sx={{ mb: 2 }}>
        {!hasAnswers(state) && (
          <>
            <ChatBubble from="firststep">
              Hi! I&apos;m FirstStep, an AI guide. I&apos;ll ask three short
              questions and suggest a first step that fits you.
            </ChatBubble>
            <ChatBubble from="firststep">
              I only use approved Tech Fleet information.
            </ChatBubble>
          </>
        )}
        {returning && question && (
          <ChatBubble from="firststep">
            Welcome back. You were on step {question.number} of{" "}
            {QUESTIONS.length}.
          </ChatBubble>
        )}
        {lastAnswer && <ChatBubble from="member">{lastAnswer}</ChatBubble>}
        {question ? (
          <ChatBubble from="firststep">{question.prompt}</ChatBubble>
        ) : (
          <ChatBubble from="firststep">
            Thanks, that&apos;s all three questions. Your answers are saved.
            Recommendations will appear here once the approved opportunities
            are added.
          </ChatBubble>
        )}
      </Stack>

      {error && (
        <Alert severity="warning" role="alert" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {question && (
        <Stack
          role="group"
          aria-label={question.prompt}
          direction={question.options.some((o) => o.hint) ? "column" : "row"}
          useFlexGap
          spacing={1}
          sx={{ flexWrap: "wrap", alignItems: "flex-start" }}
        >
          {question.options.map((option, index) => (
            <Button
              key={option.value}
              ref={index === 0 ? firstOption : undefined}
              variant="outlined"
              disabled={saving}
              onClick={() => answer(question.field, option.value, option.label)}
              sx={{
                flexDirection: "column",
                alignItems: "flex-start",
                textAlign: "left",
                width: option.hint ? "100%" : "auto",
                minHeight: 44,
              }}
            >
              {option.label}
              {option.hint && (
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                >
                  {option.hint}
                </Typography>
              )}
            </Button>
          ))}
        </Stack>
      )}

      <Box sx={{ mt: 4 }}>
        {isGuest ? (
          <Typography variant="body2" color="text.secondary">
            Your progress stays in this browser, so clearing your browser data
            will remove it.
          </Typography>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              You&apos;re signed in. Your progress is saved to your Google
              account.
            </Typography>
            <form action="/auth/sign-out" method="post">
              <Button type="submit" variant="outlined" size="small">
                Sign out
              </Button>
            </form>
          </>
        )}
      </Box>
    </Box>
  );
}
