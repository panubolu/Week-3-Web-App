import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import DeleteMyData from "@/components/DeleteMyData";

export const metadata: Metadata = { title: "Privacy | FirstStep" };

const STORED = [
  "Your answers to the three questions: goal, experience and hours a week.",
  "Which step you reached, which recommendations you opened, and when you chose \"Email a person\", so we can improve FirstStep.",
  "Your answer to \"Was this helpful?\".",
  "Questions you type that FirstStep can't answer yet, with email addresses and phone numbers removed, so the team can add approved answers.",
];

export default function PrivacyPage() {
  return (
    <Container component="main" maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h1" color="primary.dark" gutterBottom>
        Privacy
      </Typography>
      <Typography sx={{ mb: 2 }}>
        FirstStep helps new Tech Fleet members find a first step. Here is what
        it keeps, for how long, and how to delete it.
      </Typography>

      <Typography variant="h2" sx={{ mt: 4, mb: 1 }}>
        What FirstStep stores
      </Typography>
      <Box component="ul" sx={{ mt: 0, mb: 2, pl: 3 }}>
        {STORED.map((item) => (
          <Typography component="li" key={item} sx={{ mb: 0.5 }}>
            {item}
          </Typography>
        ))}
      </Box>
      <Typography sx={{ mb: 2 }}>
        Apart from those questions, FirstStep does not save a copy of your
        conversation, and it does not ask for your name.
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
        sign in again. We use them only for that, and keep them in our
        sign-in system, separate from your answers. FirstStep does not see your
        Google password.
      </Typography>

      <Typography variant="h2" sx={{ mt: 4, mb: 1 }}>
        How long we keep it
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Guest progress is deleted automatically 30 days after your last saved
        answer. Questions FirstStep couldn&apos;t answer are deleted after 30
        days. If you saved your progress with Google, we keep your answers until
        you delete them.
      </Typography>

      <Typography variant="h2" sx={{ mt: 4, mb: 1 }}>
        Who can see it
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Other members cannot see your information. The FirstStep team can read
        stored data to run and improve the service. We do not sell it.
      </Typography>

      <Typography variant="h2" id="delete" sx={{ mt: 4, mb: 1 }}>
        Delete your data
      </Typography>
      <Typography sx={{ mb: 2 }}>
        You can delete everything FirstStep has saved for you at any time. This
        deletes the data for the account you are using in this browser, guest
        or Google.
      </Typography>
      <DeleteMyData />
    </Container>
  );
}
