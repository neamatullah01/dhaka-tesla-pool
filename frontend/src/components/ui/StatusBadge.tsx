import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "error" | "muted";

interface StatusBadgeProps {
  tone: Tone;
  children: ReactNode;
  className?: string;
}

export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  const toneClasses = {
    info: "bg-primary-container/15 text-primary-container",
    success: "bg-secondary-container/15 text-secondary-fixed",
    warning: "bg-tertiary-fixed-dim/15 text-tertiary-fixed-dim",
    error: "bg-error-container/40 text-on-error-container",
    muted: "bg-surface-variant text-on-surface-variant",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-sm font-label uppercase tracking-wide",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
