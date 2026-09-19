import type {
  Availability,
  BeautyCategory,
  BrandType,
  EventType,
  ExperienceLevel,
  LanguageCode,
  LearnTrack,
  MatchReason,
  NotificationKind,
  OpenTo,
  PostKind,
  ProjectStatus,
  ProjectType,
  Region,
  Role,
} from "@/lib/types";

export const CATEGORY_LABELS: Record<BeautyCategory, string> = {
  makeup: "Makeup",
  skincare: "Skincare",
  hair: "Hair",
  nail: "Nail",
  fashion: "Fashion",
  photography: "Photography",
  video: "Video",
  design: "Design",
  marketing: "Marketing",
  "beauty-tech": "Beauty Tech",
};

export const ROLE_LABELS: Record<Role, string> = {
  student: "Student",
  creator: "Creator",
  "makeup-artist": "Makeup Artist",
  "hair-stylist": "Hair Stylist",
  "nail-artist": "Nail Artist",
  photographer: "Photographer",
  "video-creator": "Video Creator",
  designer: "Designer",
  marketer: "Marketer",
  professional: "Professional",
  founder: "Founder",
  educator: "Educator",
};

export const REGION_LABELS: Record<Region, string> = {
  asia: "Asia",
  europe: "Europe",
  "north-america": "North America",
  "south-america": "South America",
  oceania: "Oceania",
  africa: "Africa",
};

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  ja: "日本語",
  en: "English",
  ko: "한국어",
  zh: "中文",
};

export const LANGUAGE_SHORT: Record<LanguageCode, string> = {
  ja: "JA",
  en: "EN",
  ko: "KO",
  zh: "ZH",
};

export const OPEN_TO_LABELS: Record<OpenTo, string> = {
  collaboration: "Collaboration",
  projects: "Projects",
  "brand-partnership": "Brand Partnership",
  freelance: "Freelance",
  internship: "Internship",
  employment: "Employment",
  mentorship: "Mentorship",
};

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  "open-now": "Open now",
  "next-month": "From next month",
  exploring: "Exploring",
  busy: "Fully booked",
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  student: "Student",
  emerging: "Emerging",
  established: "Established",
  expert: "Expert",
};

export const BRAND_TYPE_LABELS: Record<BrandType, string> = {
  "new-beauty-brand": "New Beauty Brand",
  "student-brand": "Student Brand",
  d2c: "D2C Brand",
  "beauty-company": "Beauty Company",
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  campaign: "Campaign",
  photoshoot: "Photoshoot",
  "product-development": "Product Development",
  "sns-campaign": "SNS Campaign",
  event: "Event",
  "creative-project": "Creative Project",
  "brand-launch": "Brand Launch",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  recruiting: "Recruiting",
  "in-progress": "In progress",
  completed: "Completed",
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  popup: "POPUP",
  exhibition: "Exhibition",
  conference: "Conference",
  meetup: "Meetup",
  workshop: "Workshop",
  competition: "Competition",
  seminar: "Seminar",
  networking: "Networking",
};

export const POST_KIND_LABELS: Record<PostKind, string> = {
  trending: "Trending",
  "new-creators": "New Creators",
  "new-brands": "New Brands",
  projects: "Projects",
  "beauty-news": "Beauty News",
  events: "Events",
  inspiration: "Inspiration",
};

export const LEARN_TRACK_LABELS: Record<LearnTrack, string> = {
  "beauty-business": "Beauty Business",
  branding: "Branding",
  marketing: "Marketing",
  makeup: "Makeup",
  hair: "Hair",
  photography: "Photography",
  video: "Video",
  entrepreneurship: "Entrepreneurship",
  "ai-beauty": "AI × Beauty",
};

export const NOTIFICATION_LABELS: Record<NotificationKind, string> = {
  match: "Match",
  "connect-request": "Connect Request",
  "project-invitation": "Project Invitation",
  "project-application": "Project Application",
  "brand-collaboration": "Brand Collaboration",
  "event-reminder": "Event Reminder",
  message: "Message",
  follow: "Follow",
  "portfolio-reaction": "Portfolio Reaction",
};

export const MATCH_REASON_LABELS: Record<MatchReason["kind"], string> = {
  skill: "Skills",
  category: "Category",
  location: "Location",
  language: "Language",
  goal: "Goals",
  availability: "Availability",
  experience: "Experience",
  interest: "Interests",
  opportunity: "Opportunity",
};
