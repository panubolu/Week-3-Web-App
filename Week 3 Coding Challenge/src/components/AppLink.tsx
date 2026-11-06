"use client";

import MuiLink, { type LinkProps } from "@mui/material/Link";
import NextLink from "next/link";

export default function AppLink({
  href,
  sx,
  ...props
}: LinkProps & { href: string }) {
  return (
    <MuiLink
      component={NextLink}
      href={href}
      // Keeps every standalone link at least 24px tall.
      sx={[
        { display: "inline-block", minHeight: 24, lineHeight: "24px" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}
