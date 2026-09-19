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
import { ROLE_LABELS } from "@/lib/labels";
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
  const { t } = useI18n();
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
            <DialogTitle>Apply to {target}</DialogTitle>
            <DialogDescription>
              Your profile, portfolio and match reasons are attached automatically. Say what you want to
              work on — that is what people actually read.
            </DialogDescription>
          </DialogHeader>

          {roles.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-30">Applying as</p>
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
                    {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-30">Message</p>
            <Textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What do you want to bring to this, and what do you want out of it?"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={() => {
                setApplied(true);
                setOpen(false);
              }}
            >
              <Send />
              Send application
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
