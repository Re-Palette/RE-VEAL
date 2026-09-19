import type { Interest, Skill } from "@/lib/types";

export const SKILLS: Skill[] = [
  { id: "editorial-makeup", label: "Editorial Makeup", category: "makeup" },
  { id: "bridal-makeup", label: "Bridal Makeup", category: "makeup" },
  { id: "sfx-makeup", label: "SFX Makeup", category: "makeup" },
  { id: "colour-theory", label: "Colour Theory", category: "makeup" },
  { id: "runway-makeup", label: "Runway Makeup", category: "makeup" },
  { id: "formulation", label: "Formulation", category: "skincare" },
  { id: "ingredient-science", label: "Ingredient Science", category: "skincare" },
  { id: "clinical-testing", label: "Clinical Testing", category: "skincare" },
  { id: "skin-analysis", label: "Skin Analysis", category: "skincare" },
  { id: "cutting", label: "Precision Cutting", category: "hair" },
  { id: "colouring", label: "Hair Colouring", category: "hair" },
  { id: "styling", label: "Session Styling", category: "hair" },
  { id: "textured-hair", label: "Textured Hair", category: "hair" },
  { id: "nail-art", label: "Nail Art", category: "nail" },
  { id: "gel-extension", label: "Gel & Extension", category: "nail" },
  { id: "styling-fashion", label: "Fashion Styling", category: "fashion" },
  { id: "art-direction", label: "Art Direction", category: "fashion" },
  { id: "casting", label: "Casting", category: "fashion" },
  { id: "beauty-photography", label: "Beauty Photography", category: "photography" },
  { id: "product-photography", label: "Product Photography", category: "photography" },
  { id: "retouching", label: "Retouching", category: "photography" },
  { id: "lighting", label: "Studio Lighting", category: "photography" },
  { id: "short-form-video", label: "Short-form Video", category: "video" },
  { id: "video-editing", label: "Video Editing", category: "video" },
  { id: "motion-graphics", label: "Motion Graphics", category: "video" },
  { id: "campaign-film", label: "Campaign Film", category: "video" },
  { id: "packaging-design", label: "Packaging Design", category: "design" },
  { id: "brand-identity", label: "Brand Identity", category: "design" },
  { id: "ui-design", label: "UI Design", category: "design" },
  { id: "3d-render", label: "3D & CGI", category: "design" },
  { id: "social-strategy", label: "Social Strategy", category: "marketing" },
  { id: "influencer-relations", label: "Influencer Relations", category: "marketing" },
  { id: "ecommerce", label: "E-commerce", category: "marketing" },
  { id: "copywriting", label: "Copywriting", category: "marketing" },
  { id: "retail-buying", label: "Retail & Buying", category: "marketing" },
  { id: "ai-diagnostics", label: "AI Skin Diagnostics", category: "beauty-tech" },
  { id: "ar-tryon", label: "AR Try-on", category: "beauty-tech" },
  { id: "data-analysis", label: "Data Analysis", category: "beauty-tech" },
  { id: "product-management", label: "Product Management", category: "beauty-tech" },
];

export const SKILL_BY_ID = new Map(SKILLS.map((s) => [s.id, s]));

export function skillLabel(id: string): string {
  return SKILL_BY_ID.get(id)?.label ?? id;
}

export function skillLabels(ids: string[]): string[] {
  return ids.map(skillLabel);
}

export const INTERESTS: Interest[] = [
  { id: "clean-beauty", label: "Clean Beauty", category: "skincare" },
  { id: "k-beauty", label: "K-Beauty", category: "skincare" },
  { id: "j-beauty", label: "J-Beauty", category: "skincare" },
  { id: "genderless-beauty", label: "Genderless Beauty", category: "makeup" },
  { id: "avant-garde", label: "Avant-garde", category: "makeup" },
  { id: "minimalism", label: "Minimalism", category: "design" },
  { id: "sustainability", label: "Sustainability", category: "skincare" },
  { id: "inclusive-shades", label: "Inclusive Shade Ranges", category: "makeup" },
  { id: "street-style", label: "Street Style", category: "fashion" },
  { id: "editorial", label: "Editorial", category: "photography" },
  { id: "creator-economy", label: "Creator Economy", category: "marketing" },
  { id: "global-launch", label: "Global Launch", category: "marketing" },
  { id: "ai-beauty", label: "AI x Beauty", category: "beauty-tech" },
  { id: "fragrance", label: "Fragrance", category: "skincare" },
  { id: "haircare-science", label: "Haircare Science", category: "hair" },
  { id: "nail-couture", label: "Nail Couture", category: "nail" },
  { id: "film-photography", label: "Film Photography", category: "photography" },
  { id: "documentary", label: "Documentary", category: "video" },
  { id: "retail-experience", label: "Retail Experience", category: "marketing" },
  { id: "community-building", label: "Community Building", category: "marketing" },
];

export const INTEREST_BY_ID = new Map(INTERESTS.map((i) => [i.id, i]));

export function interestLabel(id: string): string {
  return INTEREST_BY_ID.get(id)?.label ?? id;
}
