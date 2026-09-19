import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The base RE:VEAL surface. `interactive` adds the lift used on anything that
 * navigates; `sheen` adds the faint gradient that keeps cards from reading as
 * flat white boxes.
 */
export function Card({
  className,
  interactive = false,
  sheen = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean; sheen?: boolean }) {
  return (
    <div
      className={cn(
        "relative rounded-card border border-ink-08 bg-white shadow-soft",
        sheen && "card-sheen",
        interactive &&
          "group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-lavender/30 hover:shadow-lift",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold leading-snug tracking-[-0.01em]", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-relaxed text-ink-50", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-2 p-5 pt-0", className)} {...props} />;
}
