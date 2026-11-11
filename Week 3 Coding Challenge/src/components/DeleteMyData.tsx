"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";

type Outcome = "deleted" | "nothing" | null;

const MESSAGES = {
  deleted: "Your FirstStep data has been deleted. If you come back, you'll start fresh as a new guest.",
  nothing: "There's no FirstStep data saved for this browser, so there was nothing to delete.",
};

export default function DeleteMyData() {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const done = useRef<HTMLParagraphElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (outcome) done.current?.focus();
  }, [outcome]);

  function close() {
    if (deleting) return;
    setOpen(false);
    setFailed(false);
  }

  async function confirmDelete() {
    setDeleting(true);
    setFailed(false);
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error(`status ${response.status}`);
      const { result } = await response.json();
      setOpen(false);
      setOutcome(result === "deleted" ? "deleted" : "nothing");
    } catch {
      setFailed(true);
    } finally {
      setDeleting(false);
    }
  }

  if (outcome) {
    return (
      <Typography ref={done} tabIndex={-1} role="status" sx={{ fontWeight: 700, outline: "none" }}>
        {MESSAGES[outcome]}
      </Typography>
    );
  }

  return (
    <>
      <Button
        ref={trigger}
        variant="outlined"
        color="error"
        onClick={() => setOpen(true)}
        sx={{ minHeight: 44 }}
      >
        Delete my data
      </Button>

      <Dialog
        open={open}
        onClose={close}
        aria-labelledby="delete-title"
        aria-describedby="delete-text"
        // When the member keeps their data, put focus back on the button
        // that opened the dialog, so keyboard users don't lose their place.
        slotProps={{ transition: { onExited: () => trigger.current?.focus() } }}
      >
        <DialogTitle id="delete-title">Delete your FirstStep data?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-text" sx={{ mb: failed ? 2 : 0 }}>
            This removes your answers, your feedback, any questions you typed
            that FirstStep couldn&apos;t answer, and your FirstStep account for
            good. It can&apos;t be undone. Your Google account is not affected.
          </DialogContentText>
          {failed && (
            <Alert severity="error" role="alert">
              Something went wrong, and nothing was deleted. Please try again.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexWrap: "wrap", gap: 1 }}>
          <Button onClick={close} disabled={deleting} autoFocus sx={{ minHeight: 44 }}>
            Keep my data
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={deleting}
            sx={{ minHeight: 44 }}
          >
            {deleting ? "Deleting..." : "Yes, delete everything"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
