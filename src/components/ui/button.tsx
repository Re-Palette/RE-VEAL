"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-white shadow-soft hover:bg-ink/90 hover:shadow-lift",
        accent:
          "gradient-accent text-white shadow-lift hover:shadow-float hover:brightness-[1.04]",
        outline:
          "border border-ink-15 bg-white/70 text-ink backdrop-blur hover:border-lavender/50 hover:bg-white",
        soft: "bg-lavender-soft text-[#4B3BA0] hover:bg-lavender-soft/70",
        ghost: "text-ink-70 hover:bg-ink-08/60 hover:text-ink",
        link: "text-ink underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3.5 text-[13px] [&_svg]:size-3.5",
        md: "h-10 px-5 [&_svg]:size-4",
        lg: "h-12 px-7 text-[15px] [&_svg]:size-[18px]",
        icon: "size-10 [&_svg]:size-4",
        "icon-sm": "size-8 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { buttonVariants };
