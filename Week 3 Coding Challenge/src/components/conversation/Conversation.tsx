"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "@mui/material/Link";
import type { InfoReply } from "@/actions/answer-typed";
import type { ConversationView } from "@/actions/view";
import AppLink from "@/components/AppLink";
import { TYPED_MAX, type AnswerField, type ConversationState } from "@/domain/conversation";
import ChatBubble from "./ChatBubble";
import OpportunityCard from "./OpportunityCard";
import ProgressSteps from "./ProgressSteps";
import { QUESTIONS, labelFor, questionFor, type Question } from "./questions";

type Status = "loading" | "ready" | "failed";
type Failure = { message: string; action?: "retry" | "refresh" };
type Attempt = { field: AnswerField; value: string; label: string };

const SAVE_ERROR =
  "We couldn't save your answer just now. Your earlier answers are safe. Please try again.";
const FEEDBACK_ERROR = "We couldn't save that just now. Please try again.";
// Longer than the server's own limits, so the server can answer first.
const REQUEST_TIMEOUT_MS = 20000;
const timeLimit = () => AbortSignal.timeout(REQUEST_TIMEOUT_MS);
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
  const [error, setError] = useState<Failure | null>(null);
  const [lastAttempt, setLastAttempt] = useState<Attempt | null>(null);
  const [feedbackNote, setFeedbackNote] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [thinking, setThinking] = useState(false);
  // A question the member typed and FirstStep's reply to it (T-20).
  const [exchange, setExchange] = useState<{ question: string; reply: InfoReply } | null>(null);
  const started = useRef(false);
  const moveFocus = useRef(false);
  const firstOption = useRef<HTMLButtonElement>(null);
  const messages = useRef<HTMLDivElement>(null);
  const editButtons = useRef<Partial<Record<AnswerField, HTMLButtonElement | null>>>({});

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const response = await fetch("/api/session", { method: "POST", signal: timeLimit() });
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
    // React runs effects twice in development. The first run's timer is
    // cancelled, so only the second one loads, and only one guest is created.
    const timer = setTimeout(() => {
      if (started.current) return;
      started.current = true;
      load();
    }, 0);
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
    setLastAttempt({ field, value, label });
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "answer", field, value }),
        signal: timeLimit(),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        moveFocus.current = true;
        setLastAnswer(label);
        setExchange(null);
        setReturning(false);
        setEditing(null);
        setLastAttempt(null);
        setView(result);
      } else if (response.status === 409) {
        // Another tab saved first, or the step moved on. Show the latest.
        setEditing(null);
        await load();
        setError({ message: result.message ?? SAVE_ERROR });
      } else if (response.status === 401) {
        setError({ message: result.message ?? SAVE_ERROR, action: "refresh" });
      } else if (response.status === 400) {
        setError({ message: result.message ?? SAVE_ERROR });
      } else {
        setError({ message: result.message ?? SAVE_ERROR, action: "retry" });
      }
    } catch {
      // No answer from the server: offline, or it took too long.
      setError({ message: SAVE_ERROR, action: "retry" });
    } finally {
      setSaving(false);
    }
  }

  async function sendTyped(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    const text = typed.trim();
    // Checked here for speed, and again on the server.
    if (!text) {
      setError({ message: "Please type an answer first, or choose one of the options." });
      return;
    }
    if (text.length > TYPED_MAX) {
      setError({ message: `Please keep your answer under ${TYPED_MAX} characters.` });
      return;
    }
    setSaving(true);
    setThinking(true);
    setError(null);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", text }),
        signal: timeLimit(),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        const { reply, ...nextView } = result;
        moveFocus.current = true;
        setTyped("");
        setReturning(false);
        if (reply) {
          // A question: show the reply, and stay on the same step.
          setLastAnswer(null);
          setExchange({ question: text, reply });
        } else {
          setLastAnswer(text);
          setExchange(null);
        }
        setView(nextView);
      } else if (response.status === 409) {
        await load();
        setError({ message: result.message ?? SAVE_ERROR });
      } else if (response.status === 401) {
        setError({ message: result.message ?? SAVE_ERROR, action: "refresh" });
      } else {
        // Not understood, over the limit, or Claude is unavailable. The
        // typed text stays in the box, and the buttons still work.
        setError({ message: result.message ?? SAVE_ERROR });
      }
    } catch {
      setError({ message: SAVE_ERROR });
    } finally {
      setThinking(false);
      setSaving(false);
    }
  }

  function retryLastAnswer() {
    if (lastAttempt) answer(lastAttempt.field, lastAttempt.value, lastAttempt.label);
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
        signal: timeLimit(),
      });
      if (response.ok) {
        setView({ ...view, helpful });
        setFeedbackNote("Thanks for telling us.");
      } else {
        setFeedbackNote(FEEDBACK_ERROR);
      }
    } catch {
      setFeedbackNote(FEEDBACK_ERROR);
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
      <Box sx={{ minHeight: 360 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={load} sx={{ minHeight: 32 }}>
              Try again
            </Button>
          }
        >
          We couldn&apos;t get FirstStep ready. This is usually brief, so please
          try again in a moment.
        </Alert>
        <Typography sx={{ mt: 2 }}>
          While you wait, you can{" "}
          <AppLink href="/browse" color="primary.dark" sx={{ fontWeight: 700 }}>
            browse all opportunities
          </AppLink>{" "}
          or{" "}
          <AppLink href="/talk-to-a-person" color="primary.dark" sx={{ fontWeight: 700 }}>
            talk to a person
          </AppLink>
          . Both work even when FirstStep can&apos;t save progress.
        </Typography>
      </Box>
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
              I only use approved Tech Fleet information, and a real person is
              available at any time. Just choose &quot;Talk to a person&quot; at
              the top.
            </ChatBubble>
          </>
        )}
        {returning && question && (
          <ChatBubble from="firststep">
            Welcome back. You were on step {question.number} of {QUESTIONS.length}.
          </ChatBubble>
        )}
        {lastAnswer && <ChatBubble from="member">{lastAnswer}</ChatBubble>}
        {exchange && (
          <>
            <ChatBubble from="member">{exchange.question}</ChatBubble>
            <ChatBubble from="firststep">
              {exchange.reply.text}
              {exchange.reply.link && (
                <>
                  {" "}
                  <Link href={exchange.reply.link.url} color="primary.dark" sx={{ fontWeight: 700 }}>
                    {exchange.reply.link.label}
                  </Link>
                  .
                </>
              )}
              {exchange.reply.offerBrowse && exchange.reply.offerPerson && (
                <>
                  {" "}
                  <AppLink href="/browse" color="primary.dark" sx={{ fontWeight: 700 }}>
                    Browse all opportunities
                  </AppLink>{" "}
                  or{" "}
                  <AppLink href="/talk-to-a-person" color="primary.dark" sx={{ fontWeight: 700 }}>
                    talk to a person
                  </AppLink>
                  .
                </>
              )}
              {exchange.reply.offerPerson && !exchange.reply.offerBrowse && (
                <>
                  {" "}A person can help:{" "}
                  <AppLink href="/talk-to-a-person" color="primary.dark" sx={{ fontWeight: 700 }}>
                    Talk to a person
                  </AppLink>
                  .
                </>
              )}
            </ChatBubble>
          </>
        )}
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
        {thinking && <ChatBubble from="firststep">Reading your answer...</ChatBubble>}
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
        <Alert
          severity="warning"
          role="alert"
          sx={{ mb: 2 }}
          action={
            error.action === "retry" ? (
              <Button color="inherit" size="small" disabled={saving} onClick={retryLastAnswer} sx={{ minHeight: 32 }}>
                Try again
              </Button>
            ) : error.action === "refresh" ? (
              <Button color="inherit" size="small" onClick={() => window.location.reload()} sx={{ minHeight: 32 }}>
                Refresh
              </Button>
            ) : undefined
          }
        >
          {error.message}
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

      {(question || noMatch || state.currentStep === "results") && !editing && (
        <Box component="form" onSubmit={sendTyped} noValidate sx={{ mt: 3 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
            <TextField
              id="typed-answer"
              label={question || noMatch ? "Or type your answer" : "Change an answer or ask a question"}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              disabled={saving}
              fullWidth
              size="small"
              autoComplete="off"
              error={typed.length > TYPED_MAX}
              slotProps={{ formHelperText: { component: "div" } as object }}
              helperText={
                <Box component="span" sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <span>Please don&apos;t share personal details here.</span>
                  <span aria-live={typed.length > TYPED_MAX ? "polite" : "off"}>
                    {typed.length > TYPED_MAX
                      ? `${typed.length - TYPED_MAX} ${typed.length - TYPED_MAX === 1 ? "character" : "characters"} over the limit`
                      : `${typed.length}/${TYPED_MAX}`}
                  </span>
                </Box>
              }
            />
            <Button type="submit" variant="contained" disabled={saving} sx={{ minHeight: 40, flexShrink: 0 }}>
              Send
            </Button>
          </Stack>
        </Box>
      )}

      {noMatch && !editing && (
        <Typography sx={{ mt: 2 }}>
          Or{" "}
          <AppLink href="/browse" color="primary.dark" sx={{ fontWeight: 700 }}>
            browse all opportunities
          </AppLink>{" "}
          and choose your own way, or{" "}
          <AppLink href="/talk-to-a-person" color="primary.dark" sx={{ fontWeight: 700 }}>
            talk to a person
          </AppLink>
          .
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
