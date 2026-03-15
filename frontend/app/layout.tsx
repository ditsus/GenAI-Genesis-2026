import type { Metadata } from "next";
import "./globals.css";
import { CursorGlow } from "./components/CursorGlow";
import { STRINGS } from "@/lib/strings";

export const metadata: Metadata = {
  title: STRINGS.app.name,
  description: STRINGS.app.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          fontFamily: "'Inter', sans-serif",
          background: "#0B0E14",
          color: "#ffffff",
          margin: 0,
        }}
      >
        <CursorGlow />
        {children}
      </body>
    </html>
  );
}
