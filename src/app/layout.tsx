import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import { AppProviders } from "#app/_providers/AppProviders";
import "#app/globals.css";
import { Noto_Sans } from "next/font/google";
import { cn } from "#app/lib/utils";

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Rosty",
  description: "Wedding hall workforce management",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ko" className={cn("font-sans", notoSans.variable)}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}