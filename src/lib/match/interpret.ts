import { CITIES } from "@/lib/data/geo";
import { BEAUTY_CATEGORIES, ROLES } from "@/lib/types";
import type { BeautyCategory, MatchTargetKind, Role } from "@/lib/types";

/**
 * Natural-language intent extraction for AI Match and global search.
 *
 * This is deliberately a small multilingual keyword matcher, not a model. It
 * exists so the UI, the ranking boosts and the "we understood this as…" chip
 * row can all be built and tested now; when an LLM endpoint is wired up it
 * implements `Interpreter` and everything downstream is unchanged.
 */

export interface Intent {
  query: string;
  cityIds: string[];
  countryIds: string[];
  categories: BeautyCategory[];
  roles: Role[];
  kinds: MatchTargetKind[];
  /** Terms we could not map — surfaced so the user can see what was ignored. */
  freeTerms: string[];
}

export interface Interpreter {
  readonly id: string;
  interpret(query: string): Promise<Intent>;
}

const CATEGORY_TERMS: Record<BeautyCategory, string[]> = {
  makeup: ["makeup", "make-up", "cosmetics", "メイク", "化粧", "コスメ", "化粧品", "코스메틱", "메이크업", "彩妆", "化妝"],
  skincare: ["skincare", "skin care", "serum", "スキンケア", "美容液", "스킨케어", "护肤", "護膚"],
  hair: ["hair", "hairstyle", "salon", "ヘア", "髪", "헤어", "美发", "美髮"],
  nail: ["nail", "manicure", "ネイル", "네일", "美甲"],
  fashion: ["fashion", "styling", "runway", "ファッション", "패션", "时尚", "時尚"],
  photography: ["photo", "photographer", "photography", "shoot", "撮影", "写真", "사진", "摄影", "攝影"],
  video: ["video", "film", "youtube", "tiktok", "動画", "영상", "视频", "視頻"],
  design: ["design", "packaging", "graphic", "デザイン", "디자인", "设计", "設計"],
  marketing: ["marketing", "brand strategy", "growth", "pr", "マーケティング", "마케팅", "营销", "行銷"],
  "beauty-tech": ["beauty tech", "ai", "tech", "app", "ar", "テック", "뷰티테크", "科技"],
};

const ROLE_TERMS: Partial<Record<Role, string[]>> = {
  student: ["student", "学生", "美容学生", "학생", "学生党"],
  creator: ["creator", "influencer", "クリエイター", "크리에이터", "博主", "創作者"],
  "makeup-artist": ["makeup artist", "mua", "メイクアップアーティスト", "메이크업 아티스트", "化妆师"],
  "hair-stylist": ["hair stylist", "hairdresser", "美容師", "헤어 스타일리스트", "发型师"],
  "nail-artist": ["nail artist", "nailist", "ネイリスト", "네일 아티스트"],
  photographer: ["photographer", "フォトグラファー", "카메라", "摄影师"],
  "video-creator": ["videographer", "video creator", "editor", "動画クリエイター", "영상 제작"],
  designer: ["designer", "art director", "デザイナー", "디자이너", "设计师"],
  marketer: ["marketer", "marketing lead", "マーケター", "마케터"],
  founder: ["founder", "entrepreneur", "創業", "起業", "창업", "创始人"],
  professional: ["professional", "expert", "プロ", "전문가"],
  educator: ["educator", "teacher", "mentor", "講師", "멘토", "导师"],
};

const KIND_TERMS: Record<MatchTargetKind, string[]> = {
  person: ["people", "person", "creator", "artist", "student", "人", "사람", "作り手"],
  brand: ["brand", "label", "company", "ブランド", "브랜드", "品牌", "会社", "企業"],
  project: ["project", "campaign", "collab", "collaboration", "プロジェクト", "コラボ", "프로젝트", "项目"],
  event: ["event", "meetup", "workshop", "popup", "conference", "イベント", "이벤트", "活动", "活動"],
  city: ["city", "where", "place", "都市", "場所", "도시", "城市"],
};

const COUNTRY_TERMS: Record<string, string[]> = {
  jp: ["japan", "japanese", "日本", "일본", "日本的"],
  kr: ["korea", "korean", "韓国", "한국", "韩国", "韓國"],
  cn: ["china", "chinese", "中国", "중국", "中國"],
  tw: ["taiwan", "taiwanese", "台湾", "대만", "臺灣"],
  sg: ["singapore", "シンガポール", "싱가포르", "新加坡"],
  th: ["thailand", "thai", "タイ", "태국", "泰国"],
  us: ["usa", "america", "american", "united states", "アメリカ", "미국", "美国", "美國"],
  gb: ["uk", "britain", "british", "england", "イギリス", "영국", "英国"],
  fr: ["france", "french", "フランス", "프랑스", "法国"],
  it: ["italy", "italian", "イタリア", "이탈리아", "意大利"],
  au: ["australia", "australian", "オーストラリア", "호주", "澳大利亚"],
  br: ["brazil", "brazilian", "ブラジル", "브라질", "巴西"],
};

/** City aliases beyond the canonical English name. */
const CITY_ALIASES: Record<string, string[]> = {
  tokyo: ["東京", "도쿄", "东京", "tokyo"],
  osaka: ["大阪", "오사카"],
  fukuoka: ["福岡", "후쿠오카"],
  seoul: ["ソウル", "서울", "首尔", "首爾"],
  busan: ["釜山", "부산"],
  shanghai: ["上海", "상하이"],
  beijing: ["北京", "베이징"],
  taipei: ["台北", "타이페이", "臺北"],
  hongkong: ["香港", "hong kong", "홍콩"],
  singapore: ["シンガポール", "싱가포르", "新加坡"],
  bangkok: ["バンコク", "방콕", "曼谷"],
  newyork: ["new york", "nyc", "ニューヨーク", "뉴욕", "纽约"],
  losangeles: ["los angeles", "la", "ロサンゼルス", "로스앤젤레스"],
  sanfrancisco: ["san francisco", "sf", "サンフランシスコ"],
  london: ["ロンドン", "런던", "伦敦"],
  paris: ["パリ", "파리", "巴黎"],
  milan: ["ミラノ", "밀라노", "米兰"],
  berlin: ["ベルリン", "베를린", "柏林"],
  saopaulo: ["sao paulo", "são paulo", "サンパウロ"],
  sydney: ["シドニー", "시드니", "悉尼"],
  mexicocity: ["mexico city", "メキシコシティ"],
  dubai: ["ドバイ", "두바이", "迪拜"],
  mumbai: ["ムンバイ", "뭄바이"],
  lagos: ["ラゴス"],
  capetown: ["cape town", "ケープタウン"],
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Short aliases like "ai", "ar" and "la" are useful but dangerous: a plain
 * substring test fires "ar" inside "skincare" and "la" inside "collaborate".
 * ASCII terms are therefore matched on word boundaries; CJK terms, which are
 * written without spaces, keep substring matching.
 */
function matchTerm(haystack: string, term: string): boolean {
  const needle = term.toLowerCase();
  if (/^[\x20-\x7e]+$/.test(needle)) {
    return new RegExp(`(^|[^a-z0-9])${escapeRegExp(needle)}([^a-z0-9]|$)`).test(haystack);
  }
  return haystack.includes(needle);
}

function matchTerms(haystack: string, terms: string[]): boolean {
  return terms.some((term) => matchTerm(haystack, term));
}

export function interpretSync(query: string): Intent {
  const q = query.toLowerCase();

  const cityIds = CITIES.filter(
    (city) => matchTerm(q, city.name) || matchTerms(q, CITY_ALIASES[city.id] ?? []),
  ).map((c) => c.id);

  const countryIds = Object.entries(COUNTRY_TERMS)
    .filter(([, terms]) => matchTerms(q, terms))
    .map(([id]) => id);

  const categories = BEAUTY_CATEGORIES.filter((c) => matchTerms(q, CATEGORY_TERMS[c]));
  const roles = ROLES.filter((r) => matchTerms(q, ROLE_TERMS[r] ?? []));
  const kinds = (Object.keys(KIND_TERMS) as MatchTargetKind[]).filter((k) => matchTerms(q, KIND_TERMS[k]));

  const recognised = new Set(
    [
      ...cityIds.flatMap((id) => [...(CITY_ALIASES[id] ?? []), CITIES.find((c) => c.id === id)?.name ?? ""]),
      ...countryIds.flatMap((id) => COUNTRY_TERMS[id]),
      ...categories.flatMap((c) => CATEGORY_TERMS[c]),
      ...roles.flatMap((r) => ROLE_TERMS[r] ?? []),
    ].map((t) => t.toLowerCase()),
  );

  const freeTerms = q
    .split(/[\s、,。.!?「」"'()]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !recognised.has(t))
    .slice(0, 6);

  return { query, cityIds, countryIds, categories, roles, kinds, freeTerms };
}

/** The default interpreter. Replace with an LLM-backed one without touching callers. */
export const ruleInterpreter: Interpreter = {
  id: "rule-based",
  async interpret(query: string) {
    return interpretSync(query);
  },
};

/** Example prompts shown on the AI Match screen. */
export const AI_MATCH_EXAMPLES = [
  "韓国の美容クリエイターと作品を作りたい",
  "I want to collaborate with a Japanese skincare brand",
  "Find beauty students abroad to build a project with",
  "Photographers in Paris who shoot editorial beauty",
  "東京で一緒にコスメブランドを作れる学生",
  "Brands looking for video creators in Southeast Asia",
];
