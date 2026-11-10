import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import AppLink from "@/components/AppLink";
import RecordHandoff from "@/components/RecordHandoff";
import { content } from "@/data/content";

export const metadata: Metadata = { title: "Talk to a person | FirstStep" };

// Built from the approved content file, so it works even when the database
// or Claude is down (T-22).
export default function TalkToAPersonPage() {
  const contact = content.coordinator;
  const firstName = contact?.name.split(" ")[0];

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 6 }}>
      <RecordHandoff />
      <Typography variant="h1" color="primary.dark" gutterBottom>
        Talk to a person
      </Typography>
      <Typography sx={{ mb: 3 }}>
        Stuck, have a question, or not sure what fits you? A real person can
        help.
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
            <Button
              variant="contained"
              href={`mailto:${contact.email}?subject=${encodeURIComponent("FirstStep question")}`}
              sx={{ minHeight: 44 }}
            >
              Email {firstName}
            </Button>
            <Typography variant="body2" sx={{ mt: 1.5 }}>
              Or copy the address: <Box component="span" sx={{ fontWeight: 700 }}>{contact.email}</Box>
            </Typography>
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

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Only share what you&apos;re comfortable sharing. Your FirstStep progress
        is saved.
      </Typography>
      <AppLink href="/" color="primary.dark">
        Back to FirstStep
      </AppLink>
    </Container>
  );
}
