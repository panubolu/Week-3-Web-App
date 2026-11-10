"use client";

import { useEffect, useRef } from "react";

/** Records the "Talk to a person" visit once. Never blocks or changes the page. */
export default function RecordHandoff() {
  const sent = useRef(false);

  useEffect(() => {
    // React runs effects twice in development; record only once.
    const timer = setTimeout(() => {
      if (sent.current) return;
      sent.current = true;
      fetch("/api/handoff", { method: "POST", keepalive: true }).catch(() => {});
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
