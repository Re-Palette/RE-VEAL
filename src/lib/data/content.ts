import type { Course, LearnTrack, PortfolioItem, Post, PostKind, BeautyCategory, LanguageCode } from "@/lib/types";
import { hashString } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Discover feed                                                              */
/* -------------------------------------------------------------------------- */

interface PostSeed {
  id: string;
  kind: PostKind;
  title: string;
  body: string;
  lang: LanguageCode;
  cats: BeautyCategory[];
  city: string;
  author?: string;
  brand?: string;
  tags: string[];
  days: number;
}

const POST_SEEDS: PostSeed[] = [
  { id: "post-01", kind: "trending", title: "The shade range problem nobody wants to name", body: "Forty shades means nothing if thirty-two of them are variations of beige. Amara Okafor breaks down what a genuinely inclusive range looks like when you build it from the deepest tone outward, and why the reverse order produces the results the industry keeps apologising for.", lang: "en", cats: ["makeup"], city: "lagos", author: "u-amara", tags: ["Inclusive Shades", "Foundation", "Industry"], days: 2 },
  { id: "post-02", kind: "new-brands", title: "SHU sells four products and refuses to make a fifth", body: "A Taipei label reformulating the same four products for five years, on the theory that a range is a distraction. Grace Chen explains the maths that makes restraint survivable for a two-person brand.", lang: "zh", cats: ["skincare", "design"], city: "taipei", brand: "b-shu", tags: ["Small Batch", "Founder", "Taipei"], days: 4 },
  { id: "post-03", kind: "beauty-news", title: "Seoul lab publishes its failed trials", body: "LUMINA released the twelve-week data on a serum that did not outperform its control, then discontinued it. The industry reaction was a mixture of admiration and quiet alarm.", lang: "ko", cats: ["skincare", "beauty-tech"], city: "seoul", brand: "b-lumina", tags: ["Clinical", "Transparency"], days: 1 },
  { id: "post-04", kind: "inspiration", title: "Hands as sculpture: Osaka nail work that belongs in a gallery", body: "Aiko Mori works six weeks ahead and does not repeat a design. A look at a practice that treats nails as objects rather than a service, and the exhibition taking it to Paris.", lang: "ja", cats: ["nail", "design"], city: "osaka", author: "u-aiko", tags: ["Nail Couture", "Exhibition"], days: 6 },
  { id: "post-05", kind: "new-creators", title: "The pharmacy student who reads the studies for you", body: "Chloé Nguyen has 300K followers and a citation habit. She explains why she turns down most brand deals and what she looks for in the ones she takes.", lang: "en", cats: ["skincare", "video"], city: "hochiminh", author: "u-chloe", tags: ["Creator", "Science"], days: 3 },
  { id: "post-06", kind: "projects", title: "Three cities, one crew, three weeks", body: "GLOBAL BEAUTY PROJECT #012 is assembling a crew that travels between Tokyo, Seoul and New York rather than hiring three separate teams. Eight places are still open.", lang: "en", cats: ["makeup", "photography", "video"], city: "tokyo", author: "u-jihoon", tags: ["Campaign", "Open Call"], days: 1 },
  { id: "post-07", kind: "trending", title: "Men's grooming in Japan is years ahead. Why does none of it travel?", body: "Haruto Ishida on the translation problem: content remade for export loses the thing that made it work, and content translated literally reads as instructional. A bilingual format tries a third way.", lang: "ja", cats: ["skincare", "video"], city: "tokyo", author: "u-haruto", tags: ["Men's Grooming", "Global"], days: 5 },
  { id: "post-08", kind: "beauty-news", title: "Refill programmes keep dying at the shipping stage", body: "Emma Lindqvist published the cost model behind REFIL Studio's system, including the point where it stops making sense. A Taipei pilot will test whether any of it survives a different market.", lang: "en", cats: ["design", "skincare"], city: "stockholm", author: "u-emma", tags: ["Sustainability", "Packaging"], days: 8 },
  { id: "post-09", kind: "inspiration", title: "Fifty years of a Parisian colour archive, opened", body: "Atelier Noir is showing its archive publicly for the first time: original formulations, campaign material from 1974, and six shades returning next year.", lang: "en", cats: ["makeup", "fashion"], city: "paris", brand: "b-atelier", tags: ["Archive", "Heritage"], days: 7 },
  { id: "post-10", kind: "new-creators", title: "Documenting what her grandmother taught her", body: "Fatima Diallo films West African makeup techniques alongside whatever is trending that week. The juxtaposition is the argument.", lang: "en", cats: ["makeup", "video"], city: "lagos", author: "u-fatima", tags: ["Heritage", "Creator"], days: 9 },
  { id: "post-11", kind: "events", title: "Berlin Colour Week reserves half its programme for artists outside Europe", body: "Travel covered, open call until January, and an explicit preference for work that mainstream brands would not commission.", lang: "en", cats: ["makeup", "fashion"], city: "berlin", brand: "b-nocturne", tags: ["Open Call", "Genderless"], days: 3 },
  { id: "post-12", kind: "new-brands", title: "A student brand that started because nobody stocked their shade", body: "HUE Collective sells in two campus stores and one independent retailer, and publishes what it is getting wrong as it goes.", lang: "en", cats: ["makeup", "marketing"], city: "capetown", brand: "b-hue", tags: ["Student Brand", "Inclusive Shades"], days: 11 },
  { id: "post-13", kind: "trending", title: "What a retail buyer sees in the first four seconds", body: "Oliver Grant on shelf presence, and why most independent brands fail the test before anyone reads a word of the packaging.", lang: "en", cats: ["marketing", "design"], city: "london", author: "u-oliver", tags: ["Retail", "Packaging"], days: 4 },
  { id: "post-14", kind: "beauty-news", title: "AI shade matching still fails on deep tones. This team publishes by how much.", body: "MIRAI Labs releases its error rates broken down by skin tone every quarter. Round four of artist validation opens with 2,000 new samples.", lang: "en", cats: ["beauty-tech", "makeup"], city: "sanfrancisco", brand: "b-mirai", tags: ["AI", "Inclusive Shades"], days: 6 },
  { id: "post-15", kind: "inspiration", title: "Shooting suncare where the sun actually is", body: "Leo Fernandes on producing the same campaign concept in Rio and Bangkok, and the assumptions that did not survive the flight.", lang: "en", cats: ["photography", "skincare"], city: "riodejaneiro", author: "u-leo", tags: ["Campaign", "Production"], days: 10 },
  { id: "post-16", kind: "projects", title: "Twelve students, four countries, one product that actually ships", body: "The Student Brand Lab hands every decision to the cohort and lets the mentors advise without veto. Applications close in December.", lang: "ja", cats: ["skincare", "design"], city: "tokyo", author: "u-kenji", tags: ["Students", "Product"], days: 2 },
  { id: "post-17", kind: "events", title: "A seminar where founders bring their launch plan to be taken apart", body: "Six Southeast Asian markets, four regulatory regimes, and two hours of founders discovering what they missed.", lang: "en", cats: ["marketing"], city: "singapore", author: "u-siti", tags: ["SEA", "Launch"], days: 5 },
  { id: "post-18", kind: "trending", title: "Salon education still treats textured hair as optional", body: "Priya Raman is writing a full curriculum and giving it away, because twenty years of waiting for the industry to fix this has not worked.", lang: "en", cats: ["hair"], city: "london", author: "u-priya", tags: ["Education", "Textured Hair"], days: 7 },
  { id: "post-19", kind: "inspiration", title: "Two studios swapped clients across an ocean", body: "FORM in Mexico City and a Tokyo studio redesigned each other's local brands with no local context. The retrospective is unusually honest about what broke.", lang: "en", cats: ["design"], city: "mexicocity", author: "u-tomas", tags: ["Design", "Exchange"], days: 14 },
  { id: "post-20", kind: "new-brands", title: "Oud, without the costume", body: "Maison Oud is entering Europe and looking for art direction that researches the tradition rather than decorating with it.", lang: "en", cats: ["design", "fashion"], city: "dubai", brand: "b-oud", tags: ["Fragrance", "Launch"], days: 12 },
  { id: "post-21", kind: "beauty-news", title: "Shanghai launch playbooks are not transferable. Ask first.", body: "Wei Zhang on the three mistakes overseas brands repeat on Chinese platforms, two of which will get an account suspended.", lang: "zh", cats: ["marketing", "video"], city: "shanghai", author: "u-wei", tags: ["China", "E-commerce"], days: 8 },
  { id: "post-22", kind: "new-creators", title: "A cosmetic science student explaining actives in three languages", body: "Yuna Choi studies formulation by day and makes ingredient explainers at night, in Korean, Japanese and English.", lang: "ko", cats: ["skincare", "video"], city: "busan", author: "u-yuna", tags: ["Student", "Creator"], days: 4 },
];

export const POSTS: Post[] = POST_SEEDS.map((seed) => {
  const h = hashString(seed.id);
  return {
    id: seed.id,
    authorUserId: seed.author,
    authorBrandId: seed.brand,
    kind: seed.kind,
    title: seed.title,
    body: seed.body,
    language: seed.lang,
    categories: seed.cats,
    cityId: seed.city,
    coverSeed: seed.id,
    likes: 120 + (h % 8400),
    comments: 4 + (h % 220),
    createdAt: new Date(Date.UTC(2026, 8, 19 - seed.days, 9, 0, 0)).toISOString(),
    tags: seed.tags,
  };
});

export const POST_BY_ID = new Map(POSTS.map((p) => [p.id, p]));

/* -------------------------------------------------------------------------- */
/* Portfolio                                                                  */
/* -------------------------------------------------------------------------- */

interface PortfolioSeed {
  id: string;
  user: string;
  title: string;
  description: string;
  kind: PortfolioItem["kind"];
  cats: BeautyCategory[];
  city: string;
  year: number;
  credits: string[];
  project?: string;
  brand?: string;
  featured?: boolean;
}

const PORTFOLIO_SEEDS: PortfolioSeed[] = [
  { id: "pf-01", user: "u-rina", title: "Chromatic Study — Six Looks in One Palette", description: "A self-directed editorial series built entirely from six colours, shot over three weekends in a borrowed Shibuya studio. Makeup, styling and concept mine; lighting learned the hard way.", kind: "editorial", cats: ["makeup", "photography"], city: "tokyo", year: 2026, credits: ["Makeup & concept: Rina Aoyama", "Photography: Rina Aoyama", "Models: Tokyo Beauty College"], featured: true },
  { id: "pf-02", user: "u-rina", title: "Student Brand Lab — Packaging Research", description: "Field research on refill behaviour for the Asia student cohort: 40 interviews across Tokyo and Osaka, written up into a brief the cohort actually used.", kind: "project", cats: ["design", "skincare"], city: "tokyo", year: 2026, project: "p-018", credits: ["Research: Rina Aoyama, Mei Lin"] },
  { id: "pf-03", user: "u-rina", title: "Studio Nine — First Client Campaign", description: "Assistant makeup and behind-the-scenes content for a student agency's first paid beauty client. Learned more in four days than in a year of coursework.", kind: "campaign", cats: ["makeup", "video"], city: "tokyo", year: 2025, brand: "b-studio9", credits: ["Assistant MUA: Rina Aoyama", "Lead: Studio Nine"] },
  { id: "pf-04", user: "u-rina", title: "Tokyo Student Beauty Awards — Finalist", description: "Finalist entry: a genderless colour look built around a single gradient, presented live in 25 minutes.", kind: "award", cats: ["makeup"], city: "tokyo", year: 2025, credits: ["Artist: Rina Aoyama"], featured: true },
  { id: "pf-05", user: "u-jihoon", title: "Runway Translated — Season 12", description: "Twelve runway looks rebuilt as wearable makeup, filmed in one continuous take each. The format that grew the channel past two million.", kind: "work", cats: ["makeup", "video"], city: "seoul", year: 2026, credits: ["Artist & director: Ji-hoon Park"], featured: true },
  { id: "pf-06", user: "u-amara", title: "Deep Shade Standard — Regional Swatch Set", description: "Two hundred swatches across four West African skin tone clusters, shot under controlled lighting for the open reference standard.", kind: "project", cats: ["makeup", "photography"], city: "lagos", year: 2026, project: "p-021", credits: ["Lead artist: Amara Okafor"], featured: true },
  { id: "pf-07", user: "u-yuki", title: "Skin, Unretouched — Editorial Series", description: "A six-page editorial shot with no frequency separation and no skin smoothing, as an argument rather than a constraint.", kind: "editorial", cats: ["photography", "makeup"], city: "tokyo", year: 2026, credits: ["Photography: Yuki Tanaka", "Makeup: Lucas Moreau"], featured: true },
  { id: "pf-08", user: "u-hana", title: "KASA — Full Range Identity", description: "Name, mark, bottle, box and the back-of-pack type for eight SKUs, in Japanese and English lockups.", kind: "product", cats: ["design", "skincare"], city: "osaka", year: 2025, brand: "b-kasa", credits: ["Design: Hana Kimura"], featured: true },
  { id: "pf-09", user: "u-aiko", title: "Drop 03 — Sculptural Set", description: "Six hand-sculpted sets for Plume's third drop, photographed as objects before any of it went on sale.", kind: "work", cats: ["nail", "design"], city: "osaka", year: 2026, brand: "b-plume", credits: ["Nail art: Aiko Mori"], featured: true },
  { id: "pf-10", user: "u-leo", title: "Soleil Rio — Day Shield Campaign Film", description: "Ninety seconds shot over two days on a Rio beach with a crew of five. Most of the budget went on waiting for the right light.", kind: "campaign", cats: ["video", "skincare"], city: "riodejaneiro", year: 2026, brand: "b-soleil", credits: ["Director: Leo Fernandes"], featured: true },
  { id: "pf-11", user: "u-mei", title: "Refill System — Thesis Prototype", description: "A refill mechanism designed so the customer does not have to think about it. Eleven prototypes, three of which were genuinely bad.", kind: "product", cats: ["design", "skincare"], city: "taipei", year: 2026, credits: ["Design: Mei Lin"], featured: true },
  { id: "pf-12", user: "u-fatima", title: "Inherited Techniques — Episode Series", description: "Twelve episodes documenting West African makeup techniques, each filmed with the person who taught it.", kind: "work", cats: ["makeup", "video"], city: "lagos", year: 2026, credits: ["Creator: Fatima Diallo"], featured: true },
  { id: "pf-13", user: "u-sofia", title: "Milan AW26 — Backstage Hair", description: "Four shows in five days, forty-two models, one assistant. The looks that survived contact with the schedule.", kind: "work", cats: ["hair", "fashion"], city: "milan", year: 2026, credits: ["Session hair: Sofia Marchetti"], featured: true },
  { id: "pf-14", user: "u-tomas", title: "FORM — Vessel 01", description: "The refillable cream jar FORM built its brand around. Eleven iterations, and the cost model that justified each one.", kind: "product", cats: ["design"], city: "mexicocity", year: 2025, brand: "b-form", project: "p-057", credits: ["Art direction: Tomás Ruiz"], featured: true },
  { id: "pf-15", user: "u-yuna", title: "Actives, Explained — Trilingual Series", description: "Ingredient explainers in Korean, Japanese and English, scripted bilingually rather than translated.", kind: "work", cats: ["skincare", "video"], city: "busan", year: 2026, credits: ["Creator: Yuna Choi"] },
  { id: "pf-16", user: "u-marcus", title: "Texture Studies — Product Stills", description: "A year of still life work on serums and balms, shot to make texture legible at thumbnail size.", kind: "work", cats: ["photography", "design"], city: "newyork", year: 2026, credits: ["Photography: Marcus Bell"], featured: true },
  { id: "pf-17", user: "u-ploy", title: "Maximum Colour — Personal Series", description: "Twenty looks nobody commissioned, six of which brands later asked to license.", kind: "editorial", cats: ["makeup"], city: "bangkok", year: 2026, credits: ["Artist: Ploy Suwan"], featured: true },
  { id: "pf-18", user: "u-nina", title: "Nocturne — Storefront Redesign", description: "A commerce experience for a brand whose products are deliberately hard to photograph flatteringly.", kind: "product", cats: ["design", "beauty-tech"], city: "berlin", year: 2026, brand: "b-nocturne", credits: ["Product design: Nina Petrova"] },
  { id: "pf-19", user: "u-isabella", title: "Colour in Full Sun — Editorial", description: "An editorial shot at noon in Rio to prove that colour makeup does not have to be a studio discipline.", kind: "editorial", cats: ["makeup", "photography"], city: "riodejaneiro", year: 2025, credits: ["Makeup: Isabella Costa"] },
  { id: "pf-20", user: "u-sakura", title: "Bridal Portfolio — Final Year", description: "Eight bridal looks spanning traditional Japanese and contemporary styling, shot as a graduation portfolio.", kind: "work", cats: ["makeup", "hair"], city: "fukuoka", year: 2026, credits: ["Makeup & hair: Sakura Hayashi"] },
];

export const PORTFOLIO: PortfolioItem[] = PORTFOLIO_SEEDS.map((seed) => {
  const h = hashString(seed.id);
  return {
    id: seed.id,
    userId: seed.user,
    title: seed.title,
    description: seed.description,
    kind: seed.kind,
    categories: seed.cats,
    projectId: seed.project,
    brandId: seed.brand,
    cityId: seed.city,
    year: seed.year,
    coverSeed: seed.id,
    credits: seed.credits,
    reactions: 30 + (h % 1800),
    featured: Boolean(seed.featured),
  };
});

/* -------------------------------------------------------------------------- */
/* Learn                                                                      */
/* -------------------------------------------------------------------------- */

interface CourseSeed {
  id: string;
  slug: string;
  title: string;
  track: LearnTrack;
  level: Course["level"];
  summary: string;
  description: string;
  instructor: string;
  langs: LanguageCode[];
  outcomes: string[];
  lessons: [string, number, "video" | "reading" | "workshop" | "assignment"][];
}

const COURSE_SEEDS: CourseSeed[] = [
  {
    id: "c-01", slug: "beauty-unit-economics", title: "Unit Economics for Beauty Brands", track: "beauty-business", level: "beginner",
    summary: "The numbers that decide whether your brand survives year two, taught without the inspirational parts.",
    description: "Cost of goods, landed cost, margin at each channel, and the point at which growth starts losing money. Built for founders who can make a product but have never modelled one.",
    instructor: "u-liam", langs: ["en"],
    outcomes: ["Build a full unit economic model for one SKU", "Price for three channels without losing money", "Know when growth is the wrong move"],
    lessons: [["Why most beauty brands fail at month 18", 12, "video"], ["Cost of goods, properly counted", 22, "video"], ["Landed cost and the shipping trap", 18, "video"], ["Margin by channel: D2C, wholesale, marketplace", 26, "video"], ["Build your own model", 45, "assignment"], ["Reading your model honestly", 20, "workshop"]],
  },
  {
    id: "c-02", slug: "clinical-claims", title: "Making Claims You Can Defend", track: "beauty-business", level: "intermediate",
    summary: "What you can say, what you cannot, and what testing actually costs in four regulatory regimes.",
    description: "A practical course on substantiation across the EU, Japan, Korea and the US. Includes the real costs of each test type and how to sequence them.",
    instructor: "u-mina", langs: ["ko", "en"],
    outcomes: ["Map a claim to the test that supports it", "Budget a substantiation programme", "Avoid the three claims that always get challenged"],
    lessons: [["What a claim actually is", 14, "video"], ["EU, Japan, Korea, US: four sets of rules", 30, "reading"], ["In-vitro, in-vivo, consumer perception", 24, "video"], ["Costing a testing programme", 20, "video"], ["Rewrite your own claims", 40, "assignment"]],
  },
  {
    id: "c-03", slug: "brand-identity-beauty", title: "Identity Design for Small Beauty Brands", track: "branding", level: "intermediate",
    summary: "Name, mark, bottle, box — designed as one system by someone who does all four.",
    description: "Hana Kimura walks through a complete brand identity from naming to back-of-pack type, using a real project as the spine of the course.",
    instructor: "u-hana", langs: ["ja", "en"],
    outcomes: ["Design an identity that survives contact with packaging", "Build bilingual lockups that do not look like an afterthought", "Specify a system a manufacturer can execute"],
    lessons: [["Naming, and why most of it is legal work", 18, "video"], ["The mark", 22, "video"], ["Structure: bottle, closure, secondary", 28, "video"], ["Typography at 4pt", 20, "video"], ["Bilingual lockups", 24, "video"], ["Full identity brief", 60, "assignment"]],
  },
  {
    id: "c-04", slug: "retail-readiness", title: "Getting Into Retail", track: "branding", level: "advanced",
    summary: "A buyer explains what he is looking at, and why your brand did not get the meeting.",
    description: "Oliver Grant on retail readiness from the buyer's side: margin structures, shelf presence, stock reliability and the questions that end a pitch in the first minute.",
    instructor: "u-oliver", langs: ["en"],
    outcomes: ["Assess your own retail readiness honestly", "Structure margin for a department store", "Prepare for the questions buyers actually ask"],
    lessons: [["The first four seconds", 16, "video"], ["Margin structures explained", 26, "video"], ["Stock reliability and why it kills brands", 18, "video"], ["The pitch, deconstructed", 30, "video"], ["Mock buyer meeting", 45, "workshop"]],
  },
  {
    id: "c-05", slug: "social-strategy-asia", title: "Social Strategy Across Asian Markets", track: "marketing", level: "intermediate",
    summary: "Six markets, six platform ecosystems, and why one strategy does not port.",
    description: "Wei Zhang and Siti Rahman cover China, Japan, Korea and Southeast Asia separately, including the platform rules that get accounts suspended.",
    instructor: "u-wei", langs: ["zh", "en"],
    outcomes: ["Build a per-market platform strategy", "Avoid the compliance mistakes that suspend accounts", "Brief local creators properly"],
    lessons: [["Why regional strategies fail", 15, "video"], ["China: platforms and rules", 32, "video"], ["Japan and Korea", 28, "video"], ["Southeast Asia, market by market", 30, "video"], ["Creator briefing templates", 22, "reading"], ["Build a market plan", 50, "assignment"]],
  },
  {
    id: "c-06", slug: "creator-partnerships", title: "Creator Partnerships That Are Not Ads", track: "marketing", level: "beginner",
    summary: "Structuring brand and creator relationships so both sides get something durable.",
    description: "Zoe Wright on what creators actually want from brand deals, how to structure them, and why the cheapest deal is usually the most expensive one.",
    instructor: "u-zoe", langs: ["en"],
    outcomes: ["Structure a partnership beyond a single post", "Price creator work fairly in different markets", "Write a brief a creator will not resent"],
    lessons: [["What a creator is actually selling", 14, "video"], ["Deal structures", 24, "video"], ["Pricing across markets", 20, "video"], ["Writing the brief", 18, "video"], ["Draft a partnership", 35, "assignment"]],
  },
  {
    id: "c-07", slug: "colour-theory-skin", title: "Colour Theory for Every Skin Tone", track: "makeup", level: "intermediate",
    summary: "Undertone reading, depth mapping, and the corrections that only work on some skin.",
    description: "Amara Okafor teaches colour theory as it applies across the full tonal range, including the techniques most curricula skip entirely.",
    instructor: "u-amara", langs: ["en"],
    outcomes: ["Read undertone reliably in any lighting", "Match and correct across the full depth range", "Build a kit that covers more than one tonal cluster"],
    lessons: [["Undertone, depth, and what people confuse", 20, "video"], ["Reading skin in bad light", 24, "video"], ["Correction across depth", 30, "video"], ["Building a working kit", 22, "video"], ["Swatch assignment", 50, "assignment"], ["Review session", 40, "workshop"]],
  },
  {
    id: "c-08", slug: "editorial-makeup-craft", title: "Editorial Makeup: Building a Look That Photographs", track: "makeup", level: "advanced",
    summary: "Working with a photographer rather than against one.",
    description: "Lucas Moreau and Yuki Tanaka teach makeup and photography as one process, covering what changes between the mirror and the file.",
    instructor: "u-lucas", langs: ["en"],
    outcomes: ["Build looks that hold up under studio light", "Communicate with a photographer in their terms", "Adapt a look between motion and stills"],
    lessons: [["What the camera does to makeup", 22, "video"], ["Light, and how it eats your work", 26, "video"], ["Texture that survives capture", 24, "video"], ["Working the set", 20, "video"], ["Shoot and review", 60, "workshop"]],
  },
  {
    id: "c-09", slug: "textured-hair-foundations", title: "Textured Hair: Foundations", track: "hair", level: "beginner",
    summary: "The module most salon education leaves out, taught properly.",
    description: "Priya Raman covers consultation, cutting, colouring and treatment for textured hair, built for stylists who were never trained on it.",
    instructor: "u-priya", langs: ["en"],
    outcomes: ["Consult without causing offence or damage", "Cut and shape with confidence", "Colour textured hair safely"],
    lessons: [["Curl patterns and what they mean for the cut", 22, "video"], ["Consultation", 18, "video"], ["Cutting dry", 30, "video"], ["Colour and integrity", 28, "video"], ["Treatment and aftercare", 20, "video"], ["Practical assessment", 55, "assignment"]],
  },
  {
    id: "c-10", slug: "session-styling", title: "Session Styling for Runway", track: "hair", level: "advanced",
    summary: "Forty models, five hours, one look, and no room for improvisation.",
    description: "Sofia Marchetti on backstage work: preparation, speed, team management and the difference between a look that works on one model and one that works on forty.",
    instructor: "u-sofia", langs: ["en"],
    outcomes: ["Prepare a look for repetition at scale", "Manage an assistant team backstage", "Work to a fashion week schedule"],
    lessons: [["The test, and what it is for", 20, "video"], ["Designing for repetition", 24, "video"], ["Running a team", 22, "video"], ["Backstage, hour by hour", 26, "video"], ["Speed drills", 45, "workshop"]],
  },
  {
    id: "c-11", slug: "beauty-photography-light", title: "Beauty Photography: Light on Skin", track: "photography", level: "intermediate",
    summary: "Six lighting setups, and when each one is the wrong choice.",
    description: "Yuki Tanaka teaches lighting for skin rather than for product, with an emphasis on minimal retouching as a discipline.",
    instructor: "u-yuki", langs: ["ja", "en"],
    outcomes: ["Light skin across the full tonal range", "Shoot for minimal retouching", "Build a repeatable studio setup"],
    lessons: [["What skin does with light", 20, "video"], ["Six setups", 34, "video"], ["Lighting deep skin", 26, "video"], ["Retouching less", 22, "video"], ["Shoot assignment", 60, "assignment"]],
  },
  {
    id: "c-12", slug: "product-still-life", title: "Product Photography for Beauty", track: "photography", level: "advanced",
    summary: "Making glass, cream and metal legible at thumbnail size.",
    description: "Marcus Bell on still life for e-commerce and campaign: texture, reflection control, and shooting stills and motion in one session.",
    instructor: "u-marcus", langs: ["en"],
    outcomes: ["Control reflection on glass and metal", "Make texture read at small sizes", "Shoot stills and motion together efficiently"],
    lessons: [["Reflection control", 26, "video"], ["Texture and the thumbnail problem", 22, "video"], ["Cream, gel, powder", 28, "video"], ["Stills and motion in one setup", 30, "video"], ["Portfolio assignment", 65, "assignment"]],
  },
  {
    id: "c-13", slug: "short-form-beauty-video", title: "Short-form Video That Is Not Disposable", track: "video", level: "beginner",
    summary: "Making content with a shelf life longer than a week.",
    description: "Ji-hoon Park on formats, pacing and the structural decisions that let a short video still make sense a year later.",
    instructor: "u-jihoon", langs: ["ko", "en"],
    outcomes: ["Develop a format rather than a post", "Shoot and cut efficiently", "Build a library that compounds"],
    lessons: [["Format over post", 16, "video"], ["Shooting for the cut", 22, "video"], ["Pacing", 18, "video"], ["Building a library", 20, "video"], ["Produce three pieces", 50, "assignment"]],
  },
  {
    id: "c-14", slug: "campaign-film", title: "Campaign Film on a Small Crew", track: "video", level: "intermediate",
    summary: "Big-looking films with five people and no second unit.",
    description: "Leo Fernandes on producing campaign films with small crews, including the planning that makes the difference and the shots to cut first.",
    instructor: "u-leo", langs: ["en"],
    outcomes: ["Plan a shoot a small crew can actually execute", "Direct talent and product in one day", "Know which shots to sacrifice"],
    lessons: [["Planning for five people", 22, "video"], ["Location and light", 26, "video"], ["Directing product", 20, "video"], ["The edit", 24, "video"], ["Produce a 60-second film", 70, "assignment"]],
  },
  {
    id: "c-15", slug: "founding-a-beauty-brand", title: "Founding a Beauty Brand", track: "entrepreneurship", level: "beginner",
    summary: "From idea to first hundred units, with the unglamorous middle included.",
    description: "Grace Chen and Emma Lindqvist take two very different brands from first idea to first sale, covering manufacturing, minimums, cash flow and the decisions that are hard to reverse.",
    instructor: "u-grace", langs: ["zh", "en"],
    outcomes: ["Find and brief a manufacturer", "Survive minimum order quantities", "Sequence the decisions that lock you in"],
    lessons: [["The idea is the easy part", 14, "video"], ["Finding a manufacturer", 28, "video"], ["MOQs and cash flow", 24, "video"], ["Irreversible decisions", 20, "video"], ["First hundred units", 26, "video"], ["Your launch plan", 55, "assignment"]],
  },
  {
    id: "c-16", slug: "student-to-professional", title: "From Student to Professional", track: "entrepreneurship", level: "beginner",
    summary: "Building a portfolio, finding assistant work, and pricing yourself for the first time.",
    description: "For beauty students moving into paid work: portfolio construction, approaching artists for assisting, rates, contracts, and how to be someone people book twice.",
    instructor: "u-isabella", langs: ["en"],
    outcomes: ["Build a portfolio that gets you assistant work", "Approach established artists well", "Set and hold a rate"],
    lessons: [["What a portfolio is for", 18, "video"], ["Approaching artists", 16, "video"], ["Your first rate", 20, "video"], ["Contracts, briefly", 14, "reading"], ["Being booked twice", 18, "video"], ["Portfolio review", 45, "workshop"]],
  },
  {
    id: "c-17", slug: "ai-beauty-foundations", title: "AI × Beauty: What Works and What Does Not", track: "ai-beauty", level: "intermediate",
    summary: "Shade matching, skin analysis and try-on, assessed honestly.",
    description: "James O'Shea and Arjun Mehta on where beauty AI genuinely helps, where it fails, and how to evaluate a vendor's claims about accuracy.",
    instructor: "u-james", langs: ["en"],
    outcomes: ["Evaluate an AI beauty vendor's accuracy claims", "Understand where training data fails", "Specify a pilot worth running"],
    lessons: [["What these models actually do", 20, "video"], ["Where the data fails", 26, "video"], ["Evaluating accuracy claims", 24, "video"], ["Running a pilot", 22, "video"], ["Vendor assessment", 40, "assignment"]],
  },
  {
    id: "c-18", slug: "ar-tryon-design", title: "Designing AR Try-On People Use Twice", track: "ai-beauty", level: "advanced",
    summary: "Most try-on is a novelty. This is about the small number of cases where it is not.",
    description: "Nina Petrova on the design of AR try-on experiences, covering the interaction problems that cause abandonment after a single use.",
    instructor: "u-nina", langs: ["en"],
    outcomes: ["Design a try-on flow with genuine repeat use", "Handle the lighting and accuracy problem honestly", "Integrate try-on with purchase without ruining both"],
    lessons: [["Why try-on gets abandoned", 18, "video"], ["Lighting and expectation", 22, "video"], ["Flow design", 26, "video"], ["Try-on to purchase", 20, "video"], ["Prototype assignment", 55, "assignment"]],
  },
];

export const COURSES: Course[] = COURSE_SEEDS.map((seed) => {
  const h = hashString(seed.id);
  const lessons = seed.lessons.map(([title, minutes, kind], i) => ({
    id: `${seed.id}-l${i}`,
    title,
    minutes,
    kind,
  }));
  return {
    id: seed.id,
    slug: seed.slug,
    title: seed.title,
    track: seed.track,
    level: seed.level,
    summary: seed.summary,
    description: seed.description,
    lessons,
    durationMinutes: lessons.reduce((total, l) => total + l.minutes, 0),
    instructorUserId: seed.instructor,
    languages: seed.langs,
    enrolled: 240 + (h % 14_000),
    rating: Number((4.3 + ((h % 70) / 100)).toFixed(1)),
    coverSeed: seed.id,
    outcomes: seed.outcomes,
  };
});

export const COURSE_BY_ID = new Map(COURSES.map((c) => [c.id, c]));
