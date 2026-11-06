import Box from "@mui/material/Box";
import AppLink from "@/components/AppLink";

export function SiteHeader() {
  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        px: 2,
        py: 1.5,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <AppLink
        href="/"
        underline="none"
        color="primary.dark"
        sx={{ fontWeight: 700, fontSize: "1.25rem" }}
      >
        FirstStep
      </AppLink>
      <AppLink href="/sign-in" color="primary.dark">
        Save my progress
      </AppLink>
    </Box>
  );
}

export function SiteFooter() {
  return (
    <Box component="footer" sx={{ px: 2, py: 3, textAlign: "center" }}>
      <AppLink href="/privacy" color="primary.dark">
        Privacy
      </AppLink>
    </Box>
  );
}
