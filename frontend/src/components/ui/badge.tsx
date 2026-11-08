import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-xs [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white shadow-xs [a&]:hover:bg-destructive/90",
        outline:
          "border-border/80 bg-background/50 text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success: "border-success-border/60 bg-success-surface text-success-strong shadow-2xs",
        warning: "border-warning-border/60 bg-warning-surface text-warning-strong shadow-2xs",
        critical: "border-critical-border/60 bg-critical-surface text-critical-strong shadow-2xs",
        info: "border-info-border/60 bg-info-surface text-info-strong shadow-2xs",
        neutral: "border-neutral-border/60 bg-neutral-surface text-neutral-strong shadow-2xs",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "border-transparent text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  pulse?: boolean;
}

function Badge({
  className,
  variant,
  asChild = false,
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {pulse && (
        <span className="relative flex size-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </Comp>
  );
}

export type StatusTone = "success" | "warning" | "critical" | "info" | "neutral";

function StatusBadge({
  tone,
  children,
  className,
  pulse,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}) {
  const shouldPulse = pulse ?? (tone === "critical" || tone === "warning");

  return (
    <Badge variant={tone} pulse={shouldPulse} className={className}>
      {children}
    </Badge>
  );
}

export { Badge, badgeVariants, StatusBadge };
