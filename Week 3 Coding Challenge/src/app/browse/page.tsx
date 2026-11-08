import type { Metadata } from "next";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import BrowseList, { type BrowseItem } from "@/components/browse/BrowseList";
import { content } from "@/data/content";

export const metadata: Metadata = { title: "Browse opportunities | FirstStep" };

// Built from the approved content file. No database and no Claude (ADR-0013).
const items: BrowseItem[] = content.opportunities.map((item) => ({
  id: item.id,
  title: item.title,
  minHours: item.minHours,
  maxHours: item.maxHours,
  noExperienceNeeded: item.noExperienceNeeded,
  expected: item.expected,
  url: item.url,
  lastVerified: item.lastVerified,
  reason: null,
  goals: item.goals,
  experienceLevels: item.experienceLevels,
}));

export default function BrowsePage() {
  return (
    <Container component="main" maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h1" color="primary.dark" gutterBottom>
        Browse opportunities
      </Typography>
      <Typography sx={{ mb: 3 }}>
        Prefer to look around yourself? Here is every opportunity FirstStep
        knows about. Use the filters to narrow the list.
      </Typography>
      {content.sample && (
        <Alert severity="info" sx={{ mb: 3 }}>
          These are sample opportunities for testing. They aren&apos;t real Tech
          Fleet listings yet.
        </Alert>
      )}
      <BrowseList items={items} sample={content.sample} />
    </Container>
  );
}
