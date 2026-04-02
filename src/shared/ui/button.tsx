import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "#shared/lib/cn";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary px-4 py-2 text-primary-foreground shadow-sm hover:bg-primary/90",
        secondary: "bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-border bg-background px-4 py-2 text-foreground hover:bg-secondary",
        destructive:
          "bg-destructive px-4 py-2 text-white shadow-sm hover:bg-destructive/90",
      },
      size: {
        default: "h-11",
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-12 rounded-xl px-5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size, variant, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ className, size, variant }))}
      {...props}
    />
  ),
);

Button.displayName = "Button";
