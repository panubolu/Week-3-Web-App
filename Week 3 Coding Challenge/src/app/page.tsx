import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export default function Home() {
  return (
    <Container component="main" maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h1" color="primary.dark" gutterBottom>
        FirstStep
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, bgcolor: "secondary.light" }}>
        <Typography component="p" variant="body1">
          FirstStep will help new Tech Fleet members find a first step that
          fits their goals, experience and time, with a real person one click
          away.
        </Typography>
      </Paper>
    </Container>
  );
}
