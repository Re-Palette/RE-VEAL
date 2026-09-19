import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-10 w-full rounded-full border border-ink-15 bg-white/80 px-4 text-sm text-ink placeholder:text-ink-30 transition-colors",
        "hover:border-ink-30 focus:border-lavender focus:outline-none focus:ring-4 focus:ring-lavender/12",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-ink-15 bg-white/80 px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-30 transition-colors",
        "hover:border-ink-30 focus:border-lavender focus:outline-none focus:ring-4 focus:ring-lavender/12",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
