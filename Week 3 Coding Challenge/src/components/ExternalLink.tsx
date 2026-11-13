import Box from "@mui/material/Box";
import Link, { type LinkProps } from "@mui/material/Link";
import { visuallyHidden } from "@mui/utils";

/**
 * A link that leaves FirstStep for Tech Fleet's website (T-48, UR-23).
 *
 * The first usability test found these links looked like the teal headings.
 * They now use the theme's purple (8.7:1 on white, 7.5:1 on the chat bubble
 * tint) and end with an arrow. Purple and teal are similarly dark, so the
 * arrow and underline, not the color alone, mark the difference (WCAG 1.4.1).
 * Screen readers hear where the link goes instead of the arrow.
 */
export default function ExternalLink({ children, sx, ...props }: LinkProps) {
  return (
    <Link
      underline="always"
      {...props}
      sx={[
        {
          color: "secondary.main",
          textDecorationColor: "currentColor",
          fontWeight: 700,
          "&:hover": { textDecorationThickness: "2px" },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
      <Box component="span" aria-hidden="true" sx={{ ml: 0.5 }}>
        ↗
      </Box>
      <Box component="span" sx={visuallyHidden}>
        {" "}(opens the Tech Fleet website)
      </Box>
    </Link>
  );
}
