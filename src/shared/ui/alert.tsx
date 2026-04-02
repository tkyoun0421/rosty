import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "#shared/lib/cn";

const alertVariants = cva("relative w-full rounded-2xl border px-4 py-3 text-sm", {
  variants: {
    variant: {
      default: "border-border bg-secondary/60 text-foreground",
      destructive: "border-destructive/30 bg-destructive/5 text-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div role="alert" className={cn(alertVariants({ className, variant }))} {...props} />;
}

export const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);

AlertTitle.displayName = "AlertTitle";

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("mt-1 text-sm leading-6", className)} {...props} />
));

AlertDescription.displayName = "AlertDescription";
