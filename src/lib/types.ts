/**
 * RE:VEAL domain model.
 *
 * Every entity here is written so it maps cleanly onto a relational schema
 * (Supabase / PostgreSQL) later: stable string ids, foreign keys held as ids
 * rather than nested objects, and enumerations kept as string unions that
 * become Postgres enums or lookup tables. Anything denormalised for the UI
 * lives in a `*View` type instead of on the entity itself.
 */

/* -------------------------------------------------------------------------- */
/* Taxonomy                                                                   */
/* -------------------------------------------------------------------------- */

export const BEAUTY_CATEGORIES = [
  "makeup",
  "skincare",
  "hair",
  "nail",
  "fashion",
  "photography",
  "video",
  "design",
  "marketing",
  "beauty-tech",
] as const;
export type BeautyCategory = (typeof BEAUTY_CATEGORIES)[number];

export const ROLES = [
  "student",
  "creator",
  "makeup-artist",
  "hair-stylist",
  "nail-artist",
  "photographer",
  "video-creator",
  "designer",
  "marketer",
  "professional",
  "founder",
  "educator",
] as const;
export type Role = (typeof ROLES)[number];

export const REGIONS = [
  "asia",
  "europe",
  "north-america",
  "south-america",
  "oceania",
  "africa",
] as const;
export type Region = (typeof REGIONS)[number];

export const LANGUAGES = ["ja", "en", "ko", "zh"] as const;
export type LanguageCode = (typeof LANGUAGES)[number];

export const OPEN_TO = [
  "collaboration",
  "projects",
  "brand-partnership",
  "freelance",
  "internship",
  "employment",
  "mentorship",
] as const;
export type OpenTo = (typeof OPEN_TO)[number];

export const AVAILABILITY = ["open-now", "next-month", "exploring", "busy"] as const;
export type Availability = (typeof AVAILABILITY)[number];

export const EXPERIENCE_LEVELS = ["student", "emerging", "established", "expert"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

/* -------------------------------------------------------------------------- */
/* Geography                                                                  */
/* -------------------------------------------------------------------------- */

export interface Country {
  id: string; // ISO 3166-1 alpha-2, lowercased
  name: string;
  nativeName: string;
  region: Region;
  flag: string;
}

export interface City {
  id: string;
  name: string;
  countryId: string;
  region: Region;
  lat: number;
  lng: number;
  /** Short editorial line shown when the city opens on the map. */
  tagline: string;
  /** Beauty scenes the city is known for — drives map filtering. */
  scenes: BeautyCategory[];
}

/* -------------------------------------------------------------------------- */
/* Skills & interests                                                         */
/* -------------------------------------------------------------------------- */

export interface Skill {
  id: string;
  label: string;
  category: BeautyCategory;
}

export interface Interest {
  id: string;
  label: string;
  category: BeautyCategory;
}

/* -------------------------------------------------------------------------- */
/* People                                                                     */
/* -------------------------------------------------------------------------- */

export interface User {
  id: string;
  handle: string;
  name: string;
  /** Deterministic gradient seed — avoids shipping stock photography. */
  avatarSeed: string;
  avatarUrl?: string;
  createdAt: string;
  verified: boolean;
}

export interface Profile {
  userId: string;
  headline: string;
  bio: string;
  role: Role;
  secondaryRoles: Role[];
  categories: BeautyCategory[];
  skillIds: string[];
  interestIds: string[];
  languages: LanguageCode[];
  countryId: string;
  cityId: string;
  experience: ExperienceLevel;
  yearsActive: number;
  availability: Availability;
  openTo: OpenTo[];
  /** Free-text goals — the natural-language half of the matching signal. */
  goals: string[];
  /** Where this person wants to work, by city id. Drives cross-border matching. */
  targetCityIds: string[];
  followers: number;
  following: number;
  connections: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  label: string;
  year: number;
  issuer: string;
}

export type PersonView = User & { profile: Profile };

/* -------------------------------------------------------------------------- */
/* Brands                                                                     */
/* -------------------------------------------------------------------------- */

export const BRAND_TYPES = ["new-beauty-brand", "student-brand", "d2c", "beauty-company"] as const;
export type BrandType = (typeof BRAND_TYPES)[number];

export interface Brand {
  id: string;
  slug: string;
  name: string;
  type: BrandType;
  tagline: string;
  story: string;
  categories: BeautyCategory[];
  countryId: string;
  cityId: string;
  /** Additional markets the brand operates in — used by the map. */
  marketCityIds: string[];
  founded: number;
  teamSize: string;
  avatarSeed: string;
  verified: boolean;
  followers: number;
  languages: LanguageCode[];
  lookingFor: Role[];
  openOpportunities: Opportunity[];
  products: Product[];
  values: string[];
  memberUserIds: string[];
}

export interface Product {
  id: string;
  brandId: string;
  name: string;
  category: BeautyCategory;
  description: string;
  price?: string;
}

export interface Opportunity {
  id: string;
  brandId: string;
  title: string;
  type: "collaboration" | "campaign" | "freelance" | "internship" | "employment" | "ambassador";
  roles: Role[];
  cityId: string;
  remote: boolean;
  compensation: string;
  deadline: string;
  description: string;
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

export const PROJECT_TYPES = [
  "campaign",
  "photoshoot",
  "product-development",
  "sns-campaign",
  "event",
  "creative-project",
  "brand-launch",
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export type ProjectStatus = "recruiting" | "in-progress" | "completed";

export interface RoleSlot {
  role: Role;
  count: number;
  filled: number;
  skillIds: string[];
}

export interface Project {
  id: string;
  code: string;
  title: string;
  type: ProjectType;
  status: ProjectStatus;
  summary: string;
  overview: string;
  categories: BeautyCategory[];
  /** Multi-city by design: Tokyo x Seoul x New York is the normal case here. */
  cityIds: string[];
  ownerUserId: string;
  brandIds: string[];
  startDate: string;
  endDate: string;
  timeline: TimelinePhase[];
  memberIds: string[];
  capacity: number;
  roleSlots: RoleSlot[];
  requiredSkillIds: string[];
  budget: string;
  languages: LanguageCode[];
  remoteFriendly: boolean;
  coverSeed: string;
  createdAt: string;
  applicationsCount: number;
}

export interface TimelinePhase {
  id: string;
  label: string;
  period: string;
  status: "done" | "active" | "upcoming";
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: Role;
  joinedAt: string;
  isLead: boolean;
}

export interface Application {
  id: string;
  projectId?: string;
  opportunityId?: string;
  userId: string;
  role: Role;
  message: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* Events                                                                     */
/* -------------------------------------------------------------------------- */

export const EVENT_TYPES = [
  "popup",
  "exhibition",
  "conference",
  "meetup",
  "workshop",
  "competition",
  "seminar",
  "networking",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface BeautyEvent {
  id: string;
  slug: string;
  title: string;
  type: EventType;
  summary: string;
  description: string;
  categories: BeautyCategory[];
  cityId: string;
  venue: string;
  startDate: string;
  endDate: string;
  hostName: string;
  hostBrandId?: string;
  price: string;
  capacity: number;
  attending: number;
  online: boolean;
  languages: LanguageCode[];
  coverSeed: string;
  speakerUserIds: string[];
}

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

export const POST_KINDS = [
  "trending",
  "new-creators",
  "new-brands",
  "projects",
  "beauty-news",
  "events",
  "inspiration",
] as const;
export type PostKind = (typeof POST_KINDS)[number];

export interface Post {
  id: string;
  authorUserId?: string;
  authorBrandId?: string;
  kind: PostKind;
  title: string;
  body: string;
  /** Source language — the translation layer renders into the viewer's locale. */
  language: LanguageCode;
  categories: BeautyCategory[];
  cityId: string;
  coverSeed: string;
  likes: number;
  comments: number;
  createdAt: string;
  tags: string[];
}

export interface PortfolioItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  kind: "work" | "project" | "campaign" | "editorial" | "product" | "award";
  categories: BeautyCategory[];
  projectId?: string;
  brandId?: string;
  cityId: string;
  year: number;
  coverSeed: string;
  credits: string[];
  reactions: number;
  featured: boolean;
}

/* -------------------------------------------------------------------------- */
/* Learning                                                                   */
/* -------------------------------------------------------------------------- */

export const LEARN_TRACKS = [
  "beauty-business",
  "branding",
  "marketing",
  "makeup",
  "hair",
  "photography",
  "video",
  "entrepreneurship",
  "ai-beauty",
] as const;
export type LearnTrack = (typeof LEARN_TRACKS)[number];

export interface Course {
  id: string;
  slug: string;
  title: string;
  track: LearnTrack;
  level: "beginner" | "intermediate" | "advanced";
  summary: string;
  description: string;
  lessons: Lesson[];
  durationMinutes: number;
  instructorUserId: string;
  languages: LanguageCode[];
  enrolled: number;
  rating: number;
  coverSeed: string;
  outcomes: string[];
}

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  kind: "video" | "reading" | "workshop" | "assignment";
}

/* -------------------------------------------------------------------------- */
/* Graph: matches, connections, messages, notifications                        */
/* -------------------------------------------------------------------------- */

export type MatchTargetKind = "person" | "brand" | "project" | "event" | "city";

export interface MatchReason {
  /** Machine-readable so the UI can icon/colour it consistently. */
  kind:
    | "skill"
    | "category"
    | "location"
    | "language"
    | "goal"
    | "availability"
    | "experience"
    | "interest"
    | "opportunity";
  label: string;
  weight: number;
}

export interface MatchResult {
  id: string;
  targetKind: MatchTargetKind;
  targetId: string;
  score: number;
  reasons: MatchReason[];
  /** One-sentence "why this matches you", shown on detail pages. */
  narrative: string;
}

export type ConnectionStatus = "none" | "pending" | "connected";

export interface Connection {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: ConnectionStatus;
  createdAt: string;
}

export type ThreadKind = "direct" | "group" | "project" | "brand";

export interface MessageThread {
  id: string;
  kind: ThreadKind;
  title?: string;
  participantUserIds: string[];
  projectId?: string;
  brandId?: string;
  updatedAt: string;
  unread: number;
}

export interface Message {
  id: string;
  threadId: string;
  senderUserId: string;
  body: string;
  language: LanguageCode;
  createdAt: string;
}

export const NOTIFICATION_KINDS = [
  "match",
  "connect-request",
  "project-invitation",
  "project-application",
  "brand-collaboration",
  "event-reminder",
  "message",
  "follow",
  "portfolio-reaction",
] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export interface Notification {
  id: string;
  kind: NotificationKind;
  actorUserId?: string;
  actorBrandId?: string;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  read: boolean;
}

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

export type SearchEntityKind =
  | "person"
  | "brand"
  | "project"
  | "event"
  | "post"
  | "skill"
  | "city"
  | "course";

export interface SearchResult {
  id: string;
  kind: SearchEntityKind;
  title: string;
  subtitle: string;
  href: string;
  seed: string;
  score: number;
  badge?: string;
}
