"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SaveButton({
  label = "Save",
  savedLabel = "Saved",
  size = "sm",
  className,
}: {
  label?: string;
  savedLabel?: string;
  size?: ButtonProps["size"];
  className?: string;
}) {
  const [saved, setSaved] = useState(false);
  return (
    <Button
      size={size}
      variant={saved ? "soft" : "outline"}
      className={className}
      onClick={() => setSaved((s) => !s)}
      aria-pressed={saved}
    >
      <Bookmark className={cn(saved && "fill-current")} />
      {saved ? savedLabel : label}
    </Button>
  );
}
