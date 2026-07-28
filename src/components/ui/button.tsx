import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90 active:opacity-80 shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:opacity-90 active:opacity-80",
        outline:
          "border-2 border-border bg-card text-foreground hover:bg-muted",
        ghost: "hover:bg-muted text-foreground",
        positive: "bg-positive text-positive-foreground hover:opacity-90",
        destructive:
          "bg-destructive text-destructive-foreground hover:opacity-90",
      },
      size: {
        default: "h-12 px-5 py-3",
        sm: "h-10 rounded-lg px-4 text-sm",
        lg: "h-16 rounded-2xl px-8 text-lg",
        xl: "h-20 rounded-2xl px-10 text-xl",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
