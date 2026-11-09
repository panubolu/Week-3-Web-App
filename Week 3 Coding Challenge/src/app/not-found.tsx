import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AppLink from "@/components/AppLink";

export const metadata: Metadata = { title: "Page not found | FirstStep" };

export default function NotFound() {
  return (
    <Container component="main" maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h1" color="primary.dark" gutterBottom>
        We can&apos;t find that page
      </Typography>
      <Typography sx={{ mb: 3 }}>
        The link may be old or mistyped. Here are two ways to keep going.
      </Typography>
      <Stack spacing={1}>
        <AppLink href="/" color="primary.dark" sx={{ fontWeight: 700 }}>
          Find your first step
        </AppLink>
        <AppLink href="/browse" color="primary.dark" sx={{ fontWeight: 700 }}>
          Browse all opportunities
        </AppLink>
      </Stack>
    </Container>
  );
}
