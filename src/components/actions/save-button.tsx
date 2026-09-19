"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function SaveButton({
  label,
  savedLabel,
  size = "sm",
  className,
}: {
  label?: string;
  savedLabel?: string;
  size?: ButtonProps["size"];
  className?: string;
}) {
  const { t } = useI18n();
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
      {saved ? (savedLabel ?? t("common.saved")) : (label ?? t("common.save"))}
    </Button>
  );
}
