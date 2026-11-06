import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { tokens } from "@/theme";

type Props = {
  from: "firststep" | "member";
  children: ReactNode;
};

export default function ChatBubble({ from, children }: Props) {
  const member = from === "member";
  return (
    <Box
      sx={{
        alignSelf: member ? "flex-end" : "flex-start",
        maxWidth: "85%",
        px: 2,
        py: 1.25,
        borderRadius: 3,
        bgcolor: member ? tokens.navy : tokens.surfaceTint,
        color: member ? tokens.surface : tokens.ink,
      }}
    >
      <Typography component="p" variant="body1">
        {children}
      </Typography>
    </Box>
  );
}
