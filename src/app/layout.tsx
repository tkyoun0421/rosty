import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import { AppProviders } from "#app/_providers/AppProviders";

export const metadata: Metadata = {
  title: "Rosty",
  description: "Wedding hall workforce management",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
