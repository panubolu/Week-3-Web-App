import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { QUESTIONS } from "./questions";

type Props = {
  /** The question in progress, or 4 when all three are answered. */
  current: number;
};

export default function ProgressSteps({ current }: Props) {
  const heading =
    current > QUESTIONS.length
      ? "All 3 questions answered"
      : `Step ${current} of ${QUESTIONS.length}: ${QUESTIONS[current - 1].stepLabel}`;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontWeight: 700, mb: 1 }}>{heading}</Typography>
      <Box
        component="ol"
        aria-hidden="true"
        sx={{ display: "flex", gap: 1, listStyle: "none", m: 0, p: 0 }}
      >
        {QUESTIONS.map(({ number, stepLabel }) => {
          const reached = number <= current;
          return (
            <Box
              component="li"
              key={number}
              sx={{ flex: 1, textAlign: "center", minWidth: 0 }}
            >
              <Box
                sx={{
                  height: 8,
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor: reached ? "primary.main" : "divider",
                }}
              />
              <Typography
                variant="body2"
                sx={{ fontWeight: number === current ? 700 : 400 }}
              >
                {stepLabel}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
