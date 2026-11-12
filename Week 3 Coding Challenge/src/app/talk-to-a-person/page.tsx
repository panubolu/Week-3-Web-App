import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import HandoffPanel from "@/components/HandoffPanel";
import { content } from "@/data/content";

// The address stays /talk-to-a-person so old links keep working (ADR-0017).
export const metadata: Metadata = { title: "Email a person | FirstStep" };

// Built from the approved content file, so the contact shows even when the
// database or Claude is down (T-22). The summary loads after (T-23).
export default function TalkToAPersonPage() {
  const contact = content.coordinator;

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h1" color="primary.dark" gutterBottom>
        Email a person
      </Typography>
      <Typography sx={{ mb: 3 }}>
        Stuck, have a question, or not sure what fits you? A real Tech Fleet
        member can help by email.
      </Typography>

      {contact ? (
        <>
          <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
            <Typography component="h2" sx={{ fontSize: "1.25rem", fontWeight: 700 }}>
              {contact.name}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {contact.role}
            </Typography>
            <HandoffPanel email={contact.email} firstName={contact.name.split(" ")[0]} />
          </Paper>
          <Typography sx={{ mb: 3 }}>
            You can also{" "}
            <Link href={contact.backup.url} color="primary.dark" sx={{ fontWeight: 700 }}>
              contact {contact.backup.label}
            </Link>
            .
          </Typography>
        </>
      ) : (
        <Typography sx={{ mb: 3 }}>
          Contact details aren&apos;t available right now. Please visit the Tech
          Fleet website.
        </Typography>
      )}

      <Typography variant="body2" color="text.secondary">
        Only share what you&apos;re comfortable sharing. Your FirstStep progress
        is saved.
      </Typography>
    </Container>
  );
}
