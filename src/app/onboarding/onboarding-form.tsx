"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/layout/logo";
import { useI18n } from "@/lib/i18n/context";
import { CITIES } from "@/lib/data/geo";
import { SKILLS } from "@/lib/data/taxonomy";
import { completeOnboarding } from "@/app/onboarding/actions";
import {
  BEAUTY_CATEGORIES,
  OPEN_TO,
  ROLES,
  type BeautyCategory,
  type LanguageCode,
  type OpenTo,
  type Role,
} from "@/lib/types";
import { cn } from "@/lib/utils";

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function OnboardingForm({
  name,
  defaultLanguage,
  defaultCityId,
}: {
  name: string;
  defaultLanguage: LanguageCode;
  defaultCityId: string;
}) {
  const { t, L, skill, city } = useI18n();
  const [pending, startTransition] = useTransition();

  const [headline, setHeadline] = useState("");
  const [role, setRole] = useState<Role>("creator");
  const [cityId, setCityId] = useState(defaultCityId);
  const [categories, setCategories] = useState<BeautyCategory[]>([]);
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [openTo, setOpenTo] = useState<OpenTo[]>(["collaboration"]);
  const [targetCityIds, setTargetCityIds] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  // Thirty-nine skills is too many to scan, so the list narrows to whatever
  // categories the person just picked.
  const availableSkills = useMemo(
    () => (categories.length === 0 ? SKILLS : SKILLS.filter((s) => categories.includes(s.category))),
    [categories],
  );

  const sortedCities = useMemo(
    () => [...CITIES].sort((a, b) => city(a.id).localeCompare(city(b.id))),
    [city],
  );

  const categoriesInvalid = categories.length === 0;
  const skillsInvalid = skillIds.length === 0;
  const openToInvalid = openTo.length === 0;
  const invalid = categoriesInvalid || skillsInvalid || openToInvalid;

  const submit = () => {
    if (invalid) {
      setShowErrors(true);
      return;
    }
    startTransition(async () => {
      await completeOnboarding({
        headline,
        role,
        cityId,
        categories,
        // Drop skills that no longer belong to a selected category.
        skillIds: skillIds.filter((id) => availableSkills.some((s) => s.id === id)),
        openTo,
        targetCityIds,
        languages: Array.from(new Set<LanguageCode>([defaultLanguage, "en"])),
      });
    });
  };

  return (
    <PageContainer className="max-w-3xl">
      <div className="mb-7">
        <Logo />
        <p className="mt-6 text-[13px] font-semibold uppercase tracking-[0.18em] text-ink-30">
          {t("onboarding.welcome", { name })}
        </p>
        <h1 className="mt-2 font-display text-[28px] font-semibold tracking-[-0.03em] sm:text-[34px]">
          {t("onboarding.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-70">{t("onboarding.subtitle")}</p>
      </div>

      <Card className="space-y-7 p-6 sm:p-8">
        <Section label={t("onboarding.headline")} hint={t("onboarding.optional")}>
          <Input
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
            placeholder={t("onboarding.headlinePlaceholder")}
            maxLength={120}
          />
        </Section>

        <Section label={t("onboarding.pickRole")}>
          <ChipRow>
            {ROLES.map((value) => (
              <Chip key={value} active={role === value} onClick={() => setRole(value)}>
                {L.role[value]}
              </Chip>
            ))}
          </ChipRow>
        </Section>

        <Section label={t("onboarding.pickCity")}>
          <select
            value={cityId}
            onChange={(event) => setCityId(event.target.value)}
            className="h-10 w-full max-w-sm rounded-full border border-ink-15 bg-white px-4 text-sm focus:border-lavender focus:outline-none focus:ring-4 focus:ring-lavender/12"
          >
            {sortedCities.map((option) => (
              <option key={option.id} value={option.id}>
                {city(option.id)}
              </option>
            ))}
          </select>
        </Section>

        <Section
          label={t("onboarding.pickCategories")}
          error={showErrors && categoriesInvalid ? t("onboarding.pickAtLeastOne") : undefined}
        >
          <ChipRow>
            {BEAUTY_CATEGORIES.map((value) => (
              <Chip
                key={value}
                active={categories.includes(value)}
                onClick={() => setCategories((c) => toggle(c, value))}
              >
                {L.category[value]}
              </Chip>
            ))}
          </ChipRow>
        </Section>

        <Section
          label={t("onboarding.pickSkills")}
          error={showErrors && skillsInvalid ? t("onboarding.pickAtLeastOne") : undefined}
        >
          <ChipRow>
            {availableSkills.map((option) => (
              <Chip
                key={option.id}
                active={skillIds.includes(option.id)}
                onClick={() => setSkillIds((s) => toggle(s, option.id))}
              >
                {skill(option.id)}
              </Chip>
            ))}
          </ChipRow>
        </Section>

        <Section
          label={t("onboarding.pickOpenTo")}
          error={showErrors && openToInvalid ? t("onboarding.pickAtLeastOne") : undefined}
        >
          <ChipRow>
            {OPEN_TO.map((value) => (
              <Chip key={value} active={openTo.includes(value)} onClick={() => setOpenTo((o) => toggle(o, value))}>
                {L.openTo[value]}
              </Chip>
            ))}
          </ChipRow>
        </Section>

        <Section label={t("onboarding.pickTargets")} hint={t("onboarding.optional")}>
          <ChipRow>
            {sortedCities.map((option) => (
              <Chip
                key={option.id}
                active={targetCityIds.includes(option.id)}
                onClick={() => setTargetCityIds((c) => toggle(c, option.id))}
              >
                {city(option.id)}
              </Chip>
            ))}
          </ChipRow>
        </Section>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink-08 pt-6">
          <p className="max-w-md text-[13px] leading-relaxed text-ink-50">
            <Sparkles className="mr-1.5 inline size-3.5 text-lavender" />
            {t("onboarding.matchPreview")}
          </p>
          <Button variant="accent" size="lg" onClick={submit} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Check />}
            {pending ? t("onboarding.saving") : t("onboarding.submit")}
          </Button>
        </div>

        <p className="text-[12px] text-ink-30">{t("onboarding.changeLater")}</p>
      </Card>
    </PageContainer>
  );
}

function Section({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2.5 flex items-baseline gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-30">{label}</p>
        {hint && <span className="text-[11px] text-ink-30">· {hint}</span>}
        {error && <span className="text-[11px] font-medium text-blush">· {error}</span>}
      </div>
      {children}
    </div>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
        active
          ? "border-lavender/40 bg-lavender-soft text-[#4B3BA0]"
          : "border-ink-08 bg-white text-ink-50 hover:border-ink-30 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
