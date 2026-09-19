"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronsUpDown, LogOut, Settings, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GoogleMark } from "@/components/auth/google-mark";
import { signOutAction } from "@/app/actions/auth";
import { useI18n } from "@/lib/i18n/context";
import type { PersonView } from "@/lib/types";

export interface AccountState {
  kind: "demo" | "member";
  email?: string;
  image?: string;
}

/**
 * The sidebar footer. In demo mode it is an invitation to sign in; with a real
 * account it is the account menu, including the only sign-out in the product.
 */
export function AccountMenu({
  viewer,
  account,
  cityId,
}: {
  viewer: PersonView;
  account: AccountState;
  cityId: string;
}) {
  const { t, L, city } = useI18n();

  if (account.kind === "demo") {
    return (
      <div className="rounded-2xl border border-ink-08 bg-white/70 p-3">
        <div className="flex items-center gap-2.5">
          <Avatar seed={viewer.avatarSeed} name={viewer.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{viewer.name}</p>
            <Badge variant="gold" size="sm" className="mt-0.5">
              {t("auth.demo.badge")}
            </Badge>
          </div>
        </div>
        <Link
          href="/signin"
          className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-full border border-ink-15 bg-white text-[13px] font-medium text-ink transition-colors hover:border-lavender/40"
        >
          <GoogleMark className="size-4" />
          {t("auth.continueWithGoogle")}
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-white/80">
        <Avatar seed={viewer.avatarSeed} name={viewer.name} size="md" src={account.image} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{viewer.name}</span>
          <span className="block truncate text-xs text-ink-50">
            {L.role[viewer.profile.role]} · {city(cityId)}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-ink-30" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          side="top"
          sideOffset={8}
          className="z-50 w-64 rounded-2xl border border-ink-08 bg-white p-1.5 shadow-float animate-rise"
        >
          <div className="px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-30">
              {t("auth.signedInAs")}
            </p>
            <p className="mt-1 truncate text-[13px] font-medium">{account.email}</p>
          </div>

          <DropdownMenu.Separator className="my-1 h-px bg-ink-08" />

          <DropdownMenu.Item asChild>
            <Link
              href="/profile"
              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm outline-none transition-colors data-[highlighted]:bg-lavender-soft"
            >
              <UserRound className="size-4 text-ink-30" />
              {t("nav.profile")}
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              href="/settings"
              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm outline-none transition-colors data-[highlighted]:bg-lavender-soft"
            >
              <Settings className="size-4 text-ink-30" />
              {t("nav.settings")}
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-ink-08" />

          <form action={signOutAction}>
            <DropdownMenu.Item asChild>
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm outline-none transition-colors data-[highlighted]:bg-blush-soft"
              >
                <LogOut className="size-4 text-ink-30" />
                {t("auth.signOut")}
              </button>
            </DropdownMenu.Item>
          </form>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
