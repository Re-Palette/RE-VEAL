"use client";

import { useFormStatus } from "react-dom";
import { MessageCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { startConversationAction } from "@/app/messages/actions";
import { useI18n } from "@/lib/i18n/context";

function Submit({ variant, size }: { variant?: ButtonProps["variant"]; size?: ButtonProps["size"] }) {
  const { pending } = useFormStatus();
  const { t } = useI18n();
  return (
    <Button type="submit" variant={variant} size={size} disabled={pending}>
      <MessageCircle />
      {t("common.message")}
    </Button>
  );
}

/**
 * Opens the conversation with this person, creating it on first use.
 *
 * A form rather than an onClick so the action runs on the server, where the
 * sender is read from the session: the person id is the only thing the client
 * gets to choose.
 */
export function MessageButton({
  personId,
  variant = "outline",
  size,
}: {
  personId: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) {
  return (
    <form action={startConversationAction.bind(null, personId)}>
      <Submit variant={variant} size={size} />
    </form>
  );
}
