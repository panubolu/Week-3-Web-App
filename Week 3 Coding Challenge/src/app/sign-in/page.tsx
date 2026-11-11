import { Suspense } from "react";
import type { Metadata } from "next";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AppLink from "@/components/AppLink";
import { primaryGoogleMode, type GoogleMode } from "@/domain/sign-in";

export const metadata: Metadata = { title: "Save my progress | FirstStep" };

const messages: Record<string, { severity: "info" | "error"; text: string }> = {
  canceled: {
    severity: "info",
    text: "You didn't finish signing in. Your answers are still saved in this browser.",
  },
  "already-saved": {
    severity: "info",
    text: "This Google account already has saved progress. Choose \"I already saved my progress\" to open it. The answers from this browser will be replaced.",
  },
  failed: {
    severity: "error",
    text: "We couldn't reach Google. Your answers are still saved in this browser, so please try again.",
  },
};

async function StatusMessage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const message = status ? messages[status] : undefined;
  if (!message) return null;
  return (
    <Alert severity={message.severity} role="status" sx={{ mb: 3 }}>
      {message.text}
    </Alert>
  );
}

/** The two Google buttons. Only the main one is filled in. */
function GoogleButtons({ primary }: { primary: GoogleMode }) {
  const variant = (mode: GoogleMode) =>
    mode === primary ? "contained" : "outlined";
  return (
    <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
      <form action="/auth/google" method="post">
        <input type="hidden" name="mode" value="save" />
        <Button type="submit" variant={variant("save")} color="primary">
          Continue with Google
        </Button>
      </form>
      <form action="/auth/google" method="post">
        <input type="hidden" name="mode" value="sign-in" />
        <Button type="submit" variant={variant("sign-in")} color="primary">
          I already saved my progress
        </Button>
      </form>
    </Stack>
  );
}

/** Makes signing in the main button after Google says the account is taken. */
async function ChosenGoogleButtons({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  return <GoogleButtons primary={primaryGoogleMode(status)} />;
}

export default function SignInPage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <Container component="main" maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h1" color="primary.dark" gutterBottom>
        Save my progress
      </Typography>
      <Suspense fallback={null}>
        <StatusMessage searchParams={props.searchParams} />
      </Suspense>
      <Typography sx={{ mb: 3 }}>
        We use Google to keep your progress, so you can continue on any device.
        Your answers stay the same when you connect it.
      </Typography>
      <Suspense fallback={<GoogleButtons primary="save" />}>
        <ChosenGoogleButtons searchParams={props.searchParams} />
      </Suspense>
      <Typography sx={{ mt: 4 }}>
        <AppLink href="/" color="primary.dark">
          Back to FirstStep
        </AppLink>
      </Typography>
    </Container>
  );
}
