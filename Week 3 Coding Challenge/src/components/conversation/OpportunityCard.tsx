import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { Card } from "@/actions/view";
import ExternalLink from "@/components/ExternalLink";
import { tokens } from "@/theme";

type Props = {
  card: Card;
  sample: boolean;
  onOpen?: (id: string) => void;
  headingLevel?: "h2" | "h3";
};

function checkedNote(card: Card, sample: boolean) {
  if (sample || !card.lastVerified) {
    return "Sample content for testing. Not verified by Tech Fleet.";
  }
  const date = new Date(`${card.lastVerified}T00:00:00`);
  const month = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return `From approved Tech Fleet content, last checked ${month}.`;
}

export default function OpportunityCard({ card, sample, onOpen, headingLevel = "h2" }: Props) {
  return (
    <Paper component="article" variant="outlined" sx={{ p: 2.5 }}>
      <Typography component={headingLevel}sx={{ fontSize: "1.125rem", fontWeight: 700, mb: 1 }}>
        {card.title}
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        <Box
          component="span"
          sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: tokens.surfaceTint, fontSize: "0.875rem", fontWeight: 700 }}
        >
          About {card.minHours}–{card.maxHours} hours a week
        </Box>
        {card.noExperienceNeeded && (
          <Box
            component="span"
            sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: tokens.yellow, color: tokens.ink, fontSize: "0.875rem", fontWeight: 700 }}
          >
            No experience needed
          </Box>
        )}
      </Box>

      {card.reason && (
        <>
          <Typography component="p" sx={{ fontWeight: 700, color: "primary.dark" }}>
            Why it fits
          </Typography>
          <Typography component="p" sx={{ mb: 1.5 }}>
            {card.reason}
          </Typography>
        </>
      )}

      <Typography component="p" sx={{ fontWeight: 700, color: "primary.dark" }}>
        What&apos;s expected
      </Typography>
      <Typography component="p" sx={{ mb: 1.5 }}>
        {card.expected}
      </Typography>

      <Typography component="p" variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {checkedNote(card, sample)}
      </Typography>

      <ExternalLink
        href={card.url}
        onClick={() => onOpen?.(card.id)}
        sx={{ display: "inline-block", minHeight: 24, lineHeight: "24px" }}
      >
        {sample ? "Visit Tech Fleet's website" : `Open the official page for ${card.title}`}
      </ExternalLink>
    </Paper>
  );
}
