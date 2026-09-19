"use client";

import { useState } from "react";
import { Globe2, Languages, MapPin, Shield, Sparkles, UserRound } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Separator, Switch } from "@/components/ui/misc";
import { useI18n } from "@/lib/i18n/context";
import { LANGUAGE_LABELS } from "@/lib/i18n";
import { CITIES } from "@/lib/data/geo";
import { AVAILABILITY, LANGUAGES, OPEN_TO, type Availability, type LanguageCode, type OpenTo, type PersonView } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SettingsView({ viewer }: { viewer: PersonView }) {
  const { language, setLanguage, t, L, city: cityName } = useI18n();
  const p = viewer.profile;

  const [name, setName] = useState(viewer.name);
  const [headline, setHeadline] = useState(p.headline);
  const [bio, setBio] = useState(p.bio);
  const [cityId, setCityId] = useState(p.cityId);
  const [availability, setAvailability] = useState<Availability>(p.availability);
  const [openTo, setOpenTo] = useState<OpenTo[]>(p.openTo);
  const [contentLanguages, setContentLanguages] = useState<LanguageCode[]>(p.languages);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [discoverable, setDiscoverable] = useState(true);
  const [aiMatch, setAiMatch] = useState(true);
  const [saved, setSaved] = useState(false);

  const toggle = <T,>(list: T[], value: T, set: (next: T[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t("nav.personal")}
        title={t("settings.title")}
        description={t("settings.description")}
        action={
          <Button
            variant="accent"
            size="md"
            onClick={() => {
              setSaved(true);
              window.setTimeout(() => setSaved(false), 2200);
            }}
          >
            {saved ? t("common.saved") : t("settings.saveChanges")}
          </Button>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
        <div className="min-w-0 space-y-6">
          <Card className="p-6 sm:p-8">
            <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-[-0.02em]">
              <UserRound className="size-5 text-lavender" />
              {t("settings.profile")}
            </h2>

            <div className="flex flex-wrap items-center gap-5">
              <Avatar seed={viewer.avatarSeed} name={viewer.name} size="xl" />
              <div>
                <Button variant="outline" size="sm">
                  {t("settings.changeImage")}
                </Button>
                <p className="mt-2 text-xs text-ink-30">
                  {t("settings.imageNote")}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("settings.field.name")}>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </Field>
              <Field label={t("settings.field.handle")}>
                <Input value={`@${viewer.handle}`} readOnly className="text-ink-50" />
              </Field>
            </div>

            <Field label={t("settings.field.headline")} className="mt-5">
              <Input value={headline} onChange={(event) => setHeadline(event.target.value)} />
            </Field>

            <Field label={t("settings.field.bio")} className="mt-5">
              <Textarea rows={5} value={bio} onChange={(event) => setBio(event.target.value)} />
            </Field>

            <Field label={t("common.role")} className="mt-5">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="lavender" size="lg">
                  {L.role[p.role]}
                </Badge>
                {p.secondaryRoles.map((role) => (
                  <Badge key={role} size="lg">
                    {L.role[role]}
                  </Badge>
                ))}
              </div>
            </Field>
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-[-0.02em]">
              <MapPin className="size-5 text-sky" />
              {t("settings.locationSection")}
            </h2>

            <Field label={t("settings.basedIn")}>
              <select
                value={cityId}
                onChange={(event) => setCityId(event.target.value)}
                className="h-10 w-full rounded-full border border-ink-15 bg-white px-4 text-sm focus:border-lavender focus:outline-none focus:ring-4 focus:ring-lavender/12"
              >
                {CITIES.map((city) => (
                  <option key={city.id} value={city.id}>
                    {cityName(city.id)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t("common.availability")} className="mt-5">
              <div className="flex flex-wrap gap-1.5">
                {AVAILABILITY.map((value) => (
                  <button
                    key={value}
                    onClick={() => setAvailability(value)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                      availability === value
                        ? "border-mint/40 bg-mint-soft text-[#37796C]"
                        : "border-ink-08 bg-white text-ink-50 hover:border-ink-30",
                    )}
                  >
                    {L.availability[value]}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={t("common.openTo")} className="mt-5">
              <div className="flex flex-wrap gap-1.5">
                {OPEN_TO.map((value) => (
                  <button
                    key={value}
                    onClick={() => toggle(openTo, value, setOpenTo)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                      openTo.includes(value)
                        ? "border-lavender/40 bg-lavender-soft text-[#4B3BA0]"
                        : "border-ink-08 bg-white text-ink-50 hover:border-ink-30",
                    )}
                  >
                    {L.openTo[value]}
                  </button>
                ))}
              </div>
            </Field>
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-[-0.02em]">
              <Languages className="size-5 text-blush" />
              {t("settings.languageSection")}
            </h2>

            <Field label={t("settings.interfaceLanguage")}>
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGES.map((code) => (
                  <button
                    key={code}
                    onClick={() => setLanguage(code)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                      language === code
                        ? "border-sky/40 bg-sky-soft text-[#2F5E9E]"
                        : "border-ink-08 bg-white text-ink-50 hover:border-ink-30",
                    )}
                  >
                    {LANGUAGE_LABELS[code]}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={t("settings.workLanguages")} className="mt-5">
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGES.map((code) => (
                  <button
                    key={code}
                    onClick={() => toggle(contentLanguages, code, setContentLanguages)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                      contentLanguages.includes(code)
                        ? "border-mint/40 bg-mint-soft text-[#37796C]"
                        : "border-ink-08 bg-white text-ink-50 hover:border-ink-30",
                    )}
                  >
                    {LANGUAGE_LABELS[code]}
                  </button>
                ))}
              </div>
            </Field>

            <ToggleRow
              className="mt-6"
              title="Translate content automatically"
              description="Posts, project briefs and messages written in another language are shown translated, with the original one tap away."
              checked={autoTranslate}
              onCheckedChange={setAutoTranslate}
            />
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-[-0.02em]">
              <Shield className="size-5 text-mint" />
              {t("settings.privacySection")}
            </h2>

            <ToggleRow
              title="Appear in Discover and the Global Map"
              description="Turn this off and you can still browse, but nobody will find you by searching."
              checked={discoverable}
              onCheckedChange={setDiscoverable}
            />
            <Separator className="my-5" />
            <ToggleRow
              title="Include me in AI Match results"
              description="Your public profile fields are used to score matches. Bio, messages and private notes are not."
              checked={aiMatch}
              onCheckedChange={setAiMatch}
            />
          </Card>
        </div>

        <aside className="space-y-5">
          <Card sheen className="p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.14em]">
              <Sparkles className="size-4 text-lavender" />
              {t("settings.matchStrength")}
            </h2>
            <p className="text-[13px] leading-relaxed text-ink-70">
              {t("settings.matchStrengthBody")}
            </p>
            <ul className="mt-4 space-y-2 text-[13px]">
              {[
                [t("common.skills"), p.skillIds.length >= 4],
                [t("common.interests"), p.interestIds.length >= 3],
                [t("settings.checklist.goals"), p.goals.length >= 3],
                [t("settings.checklist.targetCities"), p.targetCityIds.length >= 3],
                [t("common.openTo"), openTo.length >= 3],
              ].map(([label, done]) => (
                <li key={label as string} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      done ? "gradient-accent" : "bg-ink-15",
                    )}
                  />
                  <span className={done ? "text-ink-70" : "text-ink-30"}>{label as string}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.14em]">
              <Globe2 className="size-4 text-sky" />
              {t("settings.currently")}
            </h2>
            <dl className="space-y-2.5 text-[13px]">
              <Row label={t("settings.currently.city")} value={cityName(cityId)} />
              <Row label={t("common.availability")} value={L.availability[availability]} />
              <Row label={t("common.categories")} value={p.categories.map((c) => L.category[c]).join(", ")} />
              <Row label={t("settings.currently.interface")} value={LANGUAGE_LABELS[language]} />
            </dl>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-30">{label}</p>
      {children}
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
  className,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-5", className)}>
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-50">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={title} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-ink-30">{label}</dt>
      <dd className="text-right font-medium text-ink-70">{value}</dd>
    </div>
  );
}
