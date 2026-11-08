"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ConversationView } from "@/actions/view";
import type { ConversationState } from "@/domain/conversation";
import ChatBubble from "./ChatBubble";
import OpportunityCard from "./OpportunityCard";
import ProgressSteps from "./ProgressSteps";
import { QUESTIONS, labelFor, questionFor } from "./questions";

type Status = "loading" | "ready" | "failed";

const SAVE_ERROR = "We couldn't save that. Please try again in a moment.";
const HOURS_QUESTION = QUESTIONS.find((q) => q.field === "availability")!;

function hasAnswers(state: ConversationState) {
  return Boolean(state.goal || state.experience || state.availability);
}

export default function Conversation() {
  const [status, setStatus] = useState<Status>("loading");
  const [view, setView] = useState<ConversationView | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [returning, setReturning] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);
  const moveFocus = useRef(false);
  const firstOption = useRef<HTMLButtonElement>(null);
  const messages = useRef<HTMLDivElement>(null);

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
      setView(session.view);
      setIsGuest(session.isGuest);
      setReturning(hasAnswers(session.view.state));
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
    // With no options left, focus the messages so it isn't lost.
    (firstOption.current ?? messages.current)?.focus();
  }, [view]);

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
        setView(result);
      } else if (response.status === 409) {
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

  if (status === "failed" || !view) {
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

  const { state, recommendations, noMatch, sample } = view;
  const question = questionFor(state.currentStep);
  const options = question ?? (noMatch ? HOURS_QUESTION : undefined);
  const answered = QUESTIONS.filter(({ field }) => state[field]);
  const count = recommendations.length;

  return (
    <Box sx={{ minHeight: 360 }}>
      <ProgressSteps current={question?.number ?? QUESTIONS.length + 1} />

      {answered.length > 0 && (
        <Box
          component="ul"
          aria-label="Your answers"
          sx={{ display: "flex", flexWrap: "wrap", gap: 1, listStyle: "none", m: 0, mb: 3, p: 0 }}
        >
          {answered.map(({ field, summaryLabel }) => (
            <li key={field}>
              <Chip variant="outlined" label={`${summaryLabel}: ${labelFor(field, state[field])}`} />
            </li>
          ))}
        </Box>
      )}

      <Stack
        ref={messages}
        tabIndex={-1}
        spacing={1.5}
        role="log"
        aria-live="polite"
        sx={{ mb: 2, outline: "none" }}
      >
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
            Welcome back. You were on step {question.number} of {QUESTIONS.length}.
          </ChatBubble>
        )}
        {lastAnswer && <ChatBubble from="member">{lastAnswer}</ChatBubble>}
        {question && (
          <ChatBubble from="firststep">
            <Box component="span" sx={visuallyHidden}>
              Step {question.number} of {QUESTIONS.length}.{" "}
            </Box>
            {question.prompt}
          </ChatBubble>
        )}
        {state.currentStep === "results" && (
          <ChatBubble from="firststep">
            {count === 1
              ? "Here is 1 option that fits you:"
              : `Here are ${count} options that fit you:`}
          </ChatBubble>
        )}
        {noMatch && <ChatBubble from="firststep">{noMatch.reason}</ChatBubble>}
        {noMatch?.alternative && (
          <ChatBubble from="firststep">Here&apos;s a way to start with less commitment:</ChatBubble>
        )}
      </Stack>

      {sample && (count > 0 || noMatch?.alternative) && (
        <Alert severity="info" sx={{ mb: 2 }}>
          These are sample opportunities for testing. They aren&apos;t real Tech
          Fleet listings yet.
        </Alert>
      )}

      {count > 0 && (
        <Stack spacing={2} sx={{ mb: 3 }}>
          {recommendations.map((card) => (
            <OpportunityCard key={card.id} card={card} sample={sample} />
          ))}
        </Stack>
      )}

      {noMatch?.alternative && (
        <Box sx={{ mb: 3 }}>
          <OpportunityCard card={noMatch.alternative} sample={sample} />
        </Box>
      )}

      {error && (
        <Alert severity="warning" role="alert" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {options && (
        <>
          {noMatch && (
            <Typography id="change-hours" sx={{ fontWeight: 700, mb: 1 }}>
              You can change your hours:
            </Typography>
          )}
          <Stack
            role="group"
            aria-label={noMatch ? "Change your hours" : options.prompt}
            direction={options.options.some((o) => o.hint) ? "column" : "row"}
            useFlexGap
            spacing={1}
            sx={{ flexWrap: "wrap", alignItems: "flex-start" }}
          >
            {options.options
              .filter((option) => !noMatch || option.value !== state.availability)
              .map((option, index) => (
                <Button
                  key={option.value}
                  ref={index === 0 ? firstOption : undefined}
                  variant="outlined"
                  disabled={saving}
                  onClick={() => answer(options.field, option.value, option.label)}
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
                    <Typography component="span" variant="body2" color="text.secondary">
                      {option.hint}
                    </Typography>
                  )}
                </Button>
              ))}
          </Stack>
        </>
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
              You&apos;re signed in. Your progress is saved to your Google account.
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
