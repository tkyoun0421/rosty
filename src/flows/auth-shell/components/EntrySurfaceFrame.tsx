import type { ReactNode } from "react";

import { Badge } from "#shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#shared/ui/card";
import { cn } from "#shared/lib/cn";

interface EntrySurfaceFrameProps {
  badge?: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function EntrySurfaceFrame({
  badge,
  title,
  description,
  children,
  className,
  contentClassName,
}: EntrySurfaceFrameProps) {
  return (
    <main className="min-h-screen bg-secondary/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center">
        <Card className={cn("w-full max-w-2xl border-border/80 bg-background shadow-lg", className)}>
          <CardHeader className="gap-4">
            {badge ? (
              <Badge variant="outline" className="w-fit">
                {badge}
              </Badge>
            ) : null}
            <div className="grid gap-2">
              <CardTitle className="text-[28px] leading-tight">{title}</CardTitle>
              <CardDescription className="text-base leading-7">{description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className={cn("grid gap-4", contentClassName)}>{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}
