import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export const metadata: Metadata = { title: "Privacy | FirstStep" };

export default function PrivacyPage() {
  return (
    <Container component="main" maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h1" color="primary.dark" gutterBottom>
        Privacy
      </Typography>
      <Typography sx={{ mb: 2 }}>
        FirstStep helps new Tech Fleet members find a first step. Here is what
        it keeps.
      </Typography>

      <Typography variant="h2" sx={{ mt: 4, mb: 1 }}>
        As a guest
      </Typography>
      <Typography sx={{ mb: 2 }}>
        You start with no account. FirstStep gives this browser a private code
        and saves your progress against it. Clearing your browser data removes
        your way back to that progress.
      </Typography>

      <Typography variant="h2" sx={{ mt: 4, mb: 1 }}>
        If you save your progress with Google
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Google shares your name and email address with FirstStep, so you can
        sign in again. We use them only for that. FirstStep does not see your
        Google password.
      </Typography>

      <Typography variant="h2" sx={{ mt: 4, mb: 1 }}>
        Who can see it
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Other members cannot see your information. The FirstStep team can read
        stored data to run and improve the service. We do not sell it.
      </Typography>
    </Container>
  );
}
