"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/context";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ApplyButton({
  target,
  roles,
  label,
  size = "md",
  variant = "accent",
  className,
}: {
  target: string;
  roles: Role[];
  label?: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  className?: string;
}) {
  const { t, L } = useI18n();
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [role, setRole] = useState<Role | undefined>(roles[0]);
  const [message, setMessage] = useState("");

  if (applied) {
    return (
      <Button size={size} variant="soft" className={className} disabled>
        <Check />
        {t("common.applied")}
      </Button>
    );
  }

  return (
    <>
      <Button size={size} variant={variant} className={className} onClick={() => setOpen(true)}>
        <Send />
        {label ?? t("common.apply")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("apply.title", { target })}</DialogTitle>
            <DialogDescription>
              {t("apply.description")}
            </DialogDescription>
          </DialogHeader>

          {roles.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-30">{t("apply.applyingAs")}</p>
              <div className="flex flex-wrap gap-2">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      role === r
                        ? "border-lavender bg-lavender-soft text-[#4B3BA0]"
                        : "border-ink-15 text-ink-50 hover:border-ink-30",
                    )}
                  >
                    {L.role[r]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-30">{t("apply.message")}</p>
            <Textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("apply.messagePlaceholder")}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="accent"
              onClick={() => {
                setApplied(true);
                setOpen(false);
              }}
            >
              <Send />
              {t("apply.send")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
