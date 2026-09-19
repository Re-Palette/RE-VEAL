import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-ink-15/70 bg-white/70 text-ink-70",
        lavender: "border-lavender/25 bg-lavender-soft text-[#4B3BA0]",
        sky: "border-sky/25 bg-sky-soft text-[#2F5E9E]",
        blush: "border-blush/25 bg-blush-soft text-[#A85B7C]",
        mint: "border-mint/25 bg-mint-soft text-[#37796C]",
        gold: "border-gold/25 bg-gold-soft text-[#7A6420]",
        ink: "border-transparent bg-ink text-white",
        outline: "border-ink-15 bg-transparent text-ink-70",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px] [&_svg]:size-3",
        md: "px-2.5 py-1 text-xs [&_svg]:size-3.5",
        lg: "px-3 py-1.5 text-[13px] [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { badgeVariants };
