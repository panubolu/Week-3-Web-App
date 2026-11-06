import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Conversation from "@/components/conversation/Conversation";

export default function Home() {
  return (
    <Container component="main" maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h1" color="primary.dark" gutterBottom>
        Find your first step
      </Typography>
      <Conversation />
    </Container>
  );
}
