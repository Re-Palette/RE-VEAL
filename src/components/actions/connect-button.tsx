"use client";

import { useState } from "react";
import { Check, Clock, UserPlus } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import type { ConnectionStatus } from "@/lib/types";

/**
 * Connect is optimistic and local for now; when the backend lands this calls a
 * server action and the three states stay exactly as they are.
 */
export function ConnectButton({
  initialStatus,
  name,
  size = "sm",
  variant = "outline",
  className,
}: {
  initialStatus: ConnectionStatus;
  name: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  className?: string;
}) {
  const [status, setStatus] = useState<ConnectionStatus>(initialStatus);
  const { t } = useI18n();

  if (status === "connected") {
    return (
      <Button size={size} variant="soft" className={className} disabled>
        <Check />
        {t("common.connected")}
      </Button>
    );
  }

  if (status === "pending") {
    return (
      <Button size={size} variant="ghost" className={className} onClick={() => setStatus("none")}>
        <Clock />
        {t("common.pending")}
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      onClick={() => setStatus("pending")}
      aria-label={`Connect with ${name}`}
    >
      <UserPlus />
      {t("common.connect")}
    </Button>
  );
}
