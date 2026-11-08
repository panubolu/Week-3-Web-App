"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ConversationView } from "@/actions/view";
import AppLink from "@/components/AppLink";
import type { AnswerField, ConversationState } from "@/domain/conversation";
import ChatBubble from "./ChatBubble";
import OpportunityCard from "./OpportunityCard";
import ProgressSteps from "./ProgressSteps";
import { QUESTIONS, labelFor, questionFor, type Question } from "./questions";

type Status = "loading" | "ready" | "failed";

const SAVE_ERROR = "We couldn't save that. Please try again in a moment.";
const HOURS_QUESTION = QUESTIONS.find((q) => q.field === "availability")!;

function hasAnswers(state: ConversationState) {
  return Boolean(state.goal || state.experience || state.availability);
}

function recordOpen(opportunityId: string) {
  // Never delays the link. keepalive lets it finish as the page changes.
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ opportunityId }),
    keepalive: true,
  }).catch(() => {});
}

export default function Conversation() {
  const [status, setStatus] = useState<Status>("loading");
  const [view, setView] = useState<ConversationView | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [returning, setReturning] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [editing, setEditing] = useState<AnswerField | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackNote, setFeedbackNote] = useState<string | null>(null);
  const started = useRef(false);
  const moveFocus = useRef(false);
  const firstOption = useRef<HTMLButtonElement>(null);
  const messages = useRef<HTMLDivElement>(null);
  const editButtons = useRef<Partial<Record<AnswerField, HTMLButtonElement | null>>>({});

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
  }, [view, editing]);

  function startEditing(field: AnswerField) {
    setError(null);
    moveFocus.current = true;
    setEditing(field);
  }

  function stopEditing() {
    const field = editing;
    setEditing(null);
    if (field) setTimeout(() => editButtons.current[field]?.focus(), 0);
  }

  async function answer(field: AnswerField, value: string, label: string) {
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
        setEditing(null);
        setView(result);
      } else if (response.status === 409) {
        setEditing(null);
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

  async function giveFeedback(helpful: boolean) {
    if (saving || !view) return;
    setSaving(true);
    setFeedbackNote(null);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpful }),
      });
      if (response.ok) {
        setView({ ...view, helpful });
        setFeedbackNote("Thanks for telling us.");
      } else {
        setFeedbackNote(SAVE_ERROR);
      }
    } catch {
      setFeedbackNote(SAVE_ERROR);
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

  const { state, recommendations, noMatch, sample, helpful } = view;
  const question = questionFor(state.currentStep);
  const editQuestion = editing ? QUESTIONS.find((q) => q.field === editing) : undefined;
  const options: Question | undefined =
    editQuestion ?? question ?? (noMatch ? HOURS_QUESTION : undefined);
  const answered = QUESTIONS.filter(({ field }) => state[field]);
  const count = recommendations.length;
  const canEdit = state.currentStep !== "feedback";
  const groupLabel = editQuestion
    ? `Change your ${editQuestion.summaryLabel.toLowerCase()}`
    : noMatch
      ? "Change your hours"
      : options?.prompt;

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
            <Box
              component="li"
              key={field}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                pl: 1.5,
                pr: 0.5,
                border: 1,
                borderColor: "divider",
                borderRadius: 4,
              }}
            >
              <Typography variant="body2">
                {summaryLabel}: {labelFor(field, state[field])}
              </Typography>
              {canEdit && (
                <Button
                  size="small"
                  ref={(element) => {
                    editButtons.current[field] = element;
                  }}
                  aria-label={`Edit ${summaryLabel.toLowerCase()}`}
                  aria-expanded={editing === field}
                  disabled={saving}
                  onClick={() => (editing === field ? stopEditing() : startEditing(field))}
                  sx={{ minWidth: 44, minHeight: 32 }}
                >
                  Edit
                </Button>
              )}
            </Box>
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
        {question && !editing && (
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
            <OpportunityCard key={card.id} card={card} sample={sample} onOpen={recordOpen} />
          ))}
        </Stack>
      )}

      {noMatch?.alternative && (
        <Box sx={{ mb: 3 }}>
          <OpportunityCard card={noMatch.alternative} sample={sample} onOpen={recordOpen} />
        </Box>
      )}

      {error && (
        <Alert severity="warning" role="alert" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {options && (
        <Box
          onKeyDown={(event) => {
            if (editing && event.key === "Escape") stopEditing();
          }}
        >
          {(noMatch || editQuestion) && (
            <Typography sx={{ fontWeight: 700, mb: 1 }}>{groupLabel}:</Typography>
          )}
          <Stack
            role="group"
            aria-label={groupLabel}
            direction={options.options.some((o) => o.hint) ? "column" : "row"}
            useFlexGap
            spacing={1}
            sx={{ flexWrap: "wrap", alignItems: "flex-start" }}
          >
            {options.options
              .filter((option) => option.value !== state[options.field] || !state[options.field])
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
          {editQuestion && (
            <Button onClick={stopEditing} sx={{ mt: 1, minHeight: 44 }}>
              Cancel
            </Button>
          )}
        </Box>
      )}

      {noMatch && !editing && (
        <Typography sx={{ mt: 2 }}>
          Or{" "}
          <AppLink href="/browse" color="primary.dark" sx={{ fontWeight: 700 }}>
            browse all opportunities
          </AppLink>{" "}
          and choose your own way.
        </Typography>
      )}

      {state.currentStep === "results" && !editing && (
        <Box sx={{ mt: 3 }}>
          {helpful === null ? (
            <>
              <Typography id="helpful-question" sx={{ fontWeight: 700, mb: 1 }}>
                Was this helpful?
              </Typography>
              <Stack direction="row" spacing={1} role="group" aria-labelledby="helpful-question">
                <Button variant="outlined" disabled={saving} onClick={() => giveFeedback(true)} sx={{ minHeight: 44 }}>
                  Yes
                </Button>
                <Button variant="outlined" disabled={saving} onClick={() => giveFeedback(false)} sx={{ minHeight: 44 }}>
                  Not really
                </Button>
              </Stack>
            </>
          ) : (
            <Typography>
              You told us this was {helpful ? "helpful" : "not helpful"}.
            </Typography>
          )}
          <Typography role="status" sx={{ mt: 1 }}>
            {feedbackNote}
          </Typography>
        </Box>
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
