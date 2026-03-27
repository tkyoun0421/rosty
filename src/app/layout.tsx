import type { Metadata } from "next";
import { AppProviders } from "./AppProviders.client";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rosty",
  description: "Wedding hall workforce management scaffold.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}