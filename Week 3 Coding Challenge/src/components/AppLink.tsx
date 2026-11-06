"use client";

import MuiLink, { type LinkProps } from "@mui/material/Link";
import NextLink from "next/link";

export default function AppLink({
  href,
  ...props
}: LinkProps & { href: string }) {
  return <MuiLink component={NextLink} href={href} {...props} />;
}
