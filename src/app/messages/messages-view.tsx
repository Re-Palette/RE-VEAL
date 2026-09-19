"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, Building2, Search, Send, Users } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TranslatableText } from "@/components/content/translatable-text";
import { ChipGroup } from "@/components/filters/chip-group";
import { LANGUAGE_SHORT } from "@/lib/labels";
import type { Message, MessageThread, PersonView, ThreadKind } from "@/lib/types";
import { cn, relativeTime } from "@/lib/utils";

const KIND_ICON: Record<ThreadKind, React.ComponentType<{ className?: string }>> = {
  direct: Users,
  group: Users,
  project: Briefcase,
  brand: Building2,
};

/**
 * Messages already models the four thread kinds RE:VEAL needs — direct, group,
 * project and brand — because retrofitting group semantics onto a DM list is
 * the expensive kind of change.
 */
export function MessagesView({
  viewer,
  threads,
  messages,
  people,
}: {
  viewer: PersonView;
  threads: MessageThread[];
  messages: Record<string, Message[]>;
  people: PersonView[];
}) {
  const [activeId, setActiveId] = useState(threads[0]?.id);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<ThreadKind | "all">("all");
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<Record<string, Message[]>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  const personById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);

  const titleFor = (thread: MessageThread) => {
    if (thread.title) return thread.title;
    const other = thread.participantUserIds.find((id) => id !== viewer.id);
    return (other && personById.get(other)?.name) ?? "Conversation";
  };

  const seedFor = (thread: MessageThread) => {
    if (thread.kind === "direct") {
      const other = thread.participantUserIds.find((id) => id !== viewer.id);
      return personById.get(other ?? "")?.avatarSeed ?? thread.id;
    }
    return thread.projectId ?? thread.brandId ?? thread.id;
  };

  const filtered = useMemo(
    () =>
      threads.filter((thread) => {
        if (kind !== "all" && thread.kind !== kind) return false;
        if (query && !titleFor(thread).toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      }),
    // titleFor depends only on stable props
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [threads, kind, query, personById],
  );

  const active = threads.find((t) => t.id === activeId);
  const activeMessages = active ? [...(messages[active.id] ?? []), ...(sent[active.id] ?? [])] : [];

  const send = () => {
    if (!active || draft.trim().length === 0) return;
    const message: Message = {
      id: `local-${active.id}-${activeMessages.length}`,
      threadId: active.id,
      senderUserId: viewer.id,
      body: draft.trim(),
      language: "ja",
      createdAt: new Date().toISOString(),
    };
    setSent((current) => ({ ...current, [active.id]: [...(current[active.id] ?? []), message] }));
    setDraft("");
  };

  return (
    <PageContainer wide className="lg:py-8">
      <Card className="grid h-[calc(100dvh-190px)] min-h-[520px] grid-cols-[minmax(0,1fr)] overflow-hidden lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
        {/* Thread list -------------------------------------------------- */}
        <div
          className={cn(
            "flex min-h-0 flex-col border-ink-08 lg:flex lg:border-r",
            mobileOpen ? "hidden" : "flex",
          )}
        >
          <div className="space-y-3 border-b border-ink-08 p-4">
            <h1 className="font-display text-lg font-semibold tracking-[-0.02em]">Messages</h1>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-30" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search conversations…"
                className="h-9 w-full rounded-full border border-ink-15 bg-white pl-10 pr-4 text-sm placeholder:text-ink-30 focus:border-lavender focus:outline-none focus:ring-4 focus:ring-lavender/12"
              />
            </div>
            <ChipGroup
              value={kind}
              onChange={setKind}
              options={[
                { value: "all", label: "All" },
                { value: "direct", label: "Direct" },
                { value: "project", label: "Projects" },
                { value: "brand", label: "Brands" },
                { value: "group", label: "Groups" },
              ]}
            />
          </div>

          <ul className="min-h-0 flex-1 overflow-y-auto">
            {filtered.map((thread) => {
              const Icon = KIND_ICON[thread.kind];
              const last = [...(messages[thread.id] ?? []), ...(sent[thread.id] ?? [])].at(-1);
              return (
                <li key={thread.id}>
                  <button
                    onClick={() => {
                      setActiveId(thread.id);
                      setMobileOpen(true);
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 border-b border-ink-08 p-4 text-left transition-colors",
                      thread.id === activeId ? "bg-lavender-soft/45" : "hover:bg-canvas",
                    )}
                  >
                    <Avatar
                      seed={seedFor(thread)}
                      name={titleFor(thread)}
                      size="md"
                      square={thread.kind !== "direct"}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold">{titleFor(thread)}</span>
                        {thread.unread > 0 && (
                          <span className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full gradient-accent text-[10px] font-semibold text-white">
                            {thread.unread}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-30">
                        <Icon className="size-3" />
                        <span className="capitalize">{thread.kind}</span>
                        <span>· {relativeTime(thread.updatedAt)}</span>
                      </span>
                      {last && (
                        <span className="mt-1 block line-clamp-2 text-[12px] leading-relaxed text-ink-50">
                          {last.body}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Conversation -------------------------------------------------- */}
        <div className={cn("flex min-h-0 flex-col", mobileOpen ? "flex" : "hidden lg:flex")}>
          {active ? (
            <>
              <div className="flex items-center gap-3 border-b border-ink-08 p-4">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl p-1.5 text-ink-50 transition-colors hover:bg-ink-08 lg:hidden"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <Avatar
                  seed={seedFor(active)}
                  name={titleFor(active)}
                  size="md"
                  square={active.kind !== "direct"}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{titleFor(active)}</p>
                  <p className="truncate text-xs text-ink-50">
                    {active.participantUserIds.length} participants · {active.kind}
                  </p>
                </div>
                {active.projectId && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/projects/${active.projectId}`}>Open project</Link>
                  </Button>
                )}
                {active.brandId && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/brands/${active.brandId}`}>Open brand</Link>
                  </Button>
                )}
              </div>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-canvas/60 p-4 sm:p-6">
                {activeMessages.map((message) => {
                  const mine = message.senderUserId === viewer.id;
                  const sender = personById.get(message.senderUserId);
                  return (
                    <div
                      key={message.id}
                      className={cn("flex max-w-[85%] gap-3", mine ? "ml-auto flex-row-reverse" : "")}
                    >
                      {sender && <Avatar seed={sender.avatarSeed} name={sender.name} size="sm" />}
                      <div className={cn("min-w-0", mine && "text-right")}>
                        <p className="mb-1 flex items-center gap-2 text-[11px] text-ink-30">
                          <span className={cn(mine && "order-2")}>{sender?.name ?? "Unknown"}</span>
                          <Badge size="sm" variant="outline" className={cn(mine && "order-1")}>
                            {LANGUAGE_SHORT[message.language]}
                          </Badge>
                        </p>
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-left text-[14px] shadow-soft",
                            mine ? "gradient-accent text-white" : "border border-ink-08 bg-white",
                          )}
                        >
                          {mine ? (
                            <p className="leading-relaxed">{message.body}</p>
                          ) : (
                            <TranslatableText text={message.body} from={message.language} className="text-[14px]" />
                          )}
                        </div>
                        <p className="mt-1 text-[10px] text-ink-30">{relativeTime(message.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-end gap-2 border-t border-ink-08 p-3 sm:p-4">
                <textarea
                  rows={1}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Write in your own language — it is translated for them."
                  className="max-h-32 min-h-10 flex-1 resize-none rounded-2xl border border-ink-15 bg-white px-4 py-2.5 text-sm placeholder:text-ink-30 focus:border-lavender focus:outline-none focus:ring-4 focus:ring-lavender/12"
                />
                <Button variant="accent" size="icon" onClick={send} aria-label="Send message">
                  <Send />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-sm text-ink-50">
              Select a conversation.
            </div>
          )}
        </div>
      </Card>
    </PageContainer>
  );
}
