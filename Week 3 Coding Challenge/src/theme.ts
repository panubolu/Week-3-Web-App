"use client";

import { createTheme } from "@mui/material/styles";

// Colors are matched by eye from the FirstStep Figma screens.
// Every text color here meets 4.5:1 on the background it is used on.
export const tokens = {
  teal: "#0F766E",
  tealDark: "#115E59",
  purple: "#5B3A8C",
  purpleLight: "#EDE7F6",
  yellow: "#F9C74F",
  navy: "#1E293B",
  ink: "#1F2937",
  inkMuted: "#4B5563",
  surface: "#FFFFFF",
  surfaceTint: "#E8F0F6",
  border: "#6B7280",
};

const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: { main: tokens.teal, dark: tokens.tealDark, contrastText: tokens.surface },
    secondary: { main: tokens.purple, light: tokens.purpleLight, contrastText: tokens.surface },
    warning: { main: tokens.yellow, contrastText: tokens.ink },
    text: { primary: tokens.ink, secondary: tokens.inkMuted },
    background: { default: tokens.surface, paper: tokens.surface },
    divider: tokens.border,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "var(--font-atkinson), system-ui, sans-serif",
    h1: { fontSize: "2rem", fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.3 },
    body1: { fontSize: "1rem", lineHeight: 1.5 },
    button: { fontWeight: 700, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        /* A clear focus ring for keyboard users on every element (WCAG 2.4.7, 2.4.13).
           tealDark is 7.6:1 on white and 6.6:1 on the chat bubble tint. */
        :focus-visible {
          outline: 3px solid ${tokens.tealDark};
          outline-offset: 2px;
        }
        /* Respect a request for less motion (WCAG 2.3.3). */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `,
    },
    MuiButtonBase: {
      styleOverrides: {
        // Material UI removes the browser's outline on buttons; put a visible one back.
        root: {
          "&.Mui-focusVisible": {
            outline: `3px solid ${tokens.tealDark}`,
            outlineOffset: 2,
          },
        },
      },
    },
  },
});

export default theme;
