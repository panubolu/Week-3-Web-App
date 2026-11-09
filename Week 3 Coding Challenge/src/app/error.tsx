"use client";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect } from "react";
import AppLink from "@/components/AppLink";

// Shown inside the normal header and footer when a page fails.
// The member never sees error details; those go to the logs.
export default function PageError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error("Page failed:", error);
  }, [error]);

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h1" color="primary.dark" gutterBottom>
        Something went wrong
      </Typography>
      <Typography role="alert" sx={{ mb: 3 }}>
        This page didn&apos;t load properly. It&apos;s not something you did.
        Please try again. Your saved answers are not affected.
      </Typography>
      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
        <Button variant="contained" onClick={() => retry()} sx={{ minHeight: 44 }}>
          Try again
        </Button>
        <AppLink href="/browse" color="primary.dark">
          Browse all opportunities
        </AppLink>
      </Stack>
    </Container>
  );
}
