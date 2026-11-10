import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import Conversation from "@/components/conversation/Conversation";

export default function Home() {
  return (
    <Container component="main" maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h1" color="primary.dark" gutterBottom>
        Find your first step
      </Typography>
      {/* Present from the first paint, so screen readers announce what the
          conversation writes here once saved progress loads (T-25). */}
      <Box id="conversation-announcer" role="status" sx={visuallyHidden} />
      <Conversation />
    </Container>
  );
}
