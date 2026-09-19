import type { LanguageCode } from "@/lib/types";

/**
 * UI chrome dictionary. Content (bios, project briefs, posts) is handled
 * separately by the Translator abstraction, because that text is user-generated
 * and has to go through a translation service rather than a static table.
 */
export const UI_STRINGS = {
  "nav.main": { en: "Main", ja: "メイン", ko: "메인", zh: "主要" },
  "nav.connect": { en: "Connect", ja: "つながる", ko: "커넥트", zh: "连接" },
  "nav.grow": { en: "Grow", ja: "成長する", ko: "성장", zh: "成长" },
  "nav.personal": { en: "Personal", ja: "パーソナル", ko: "개인", zh: "个人" },
  "nav.home": { en: "Home", ja: "ホーム", ko: "홈", zh: "首页" },
  "nav.discover": { en: "Discover", ja: "ディスカバー", ko: "디스커버", zh: "发现" },
  "nav.map": { en: "Map", ja: "マップ", ko: "지도", zh: "地图" },
  "nav.match": { en: "Match", ja: "マッチ", ko: "매치", zh: "匹配" },
  "nav.people": { en: "People", ja: "ピープル", ko: "피플", zh: "人物" },
  "nav.brands": { en: "Brands", ja: "ブランド", ko: "브랜드", zh: "品牌" },
  "nav.projects": { en: "Projects", ja: "プロジェクト", ko: "프로젝트", zh: "项目" },
  "nav.events": { en: "Events", ja: "イベント", ko: "이벤트", zh: "活动" },
  "nav.learn": { en: "Learn", ja: "ラーン", ko: "런", zh: "学习" },
  "nav.portfolio": { en: "Portfolio", ja: "ポートフォリオ", ko: "포트폴리오", zh: "作品集" },
  "nav.messages": { en: "Messages", ja: "メッセージ", ko: "메시지", zh: "消息" },
  "nav.notifications": { en: "Notifications", ja: "通知", ko: "알림", zh: "通知" },
  "nav.profile": { en: "My Profile", ja: "マイプロフィール", ko: "내 프로필", zh: "我的主页" },
  "nav.settings": { en: "Settings", ja: "設定", ko: "설정", zh: "设置" },

  "search.placeholder": {
    en: "Search people, brands, projects, events, skills, cities…",
    ja: "人・ブランド・プロジェクト・イベント・スキル・都市を検索…",
    ko: "사람, 브랜드, 프로젝트, 이벤트, 스킬, 도시 검색…",
    zh: "搜索人物、品牌、项目、活动、技能、城市…",
  },
  "search.empty": { en: "No results yet", ja: "結果がありません", ko: "결과가 없습니다", zh: "暂无结果" },
  "search.hint": {
    en: "Try natural language: “beauty students in Seoul to build a brand with”",
    ja: "自然な言葉で検索できます：「東京で一緒にコスメブランドを作れる学生」",
    ko: "자연어로 검색해 보세요: “서울에서 함께 브랜드를 만들 학생”",
    zh: "试试自然语言：“在首尔一起做品牌的学生”",
  },

  "home.hero.title": {
    en: "Beauty Connects the World",
    ja: "美容が、世界をつなぐ",
    ko: "뷰티가 세계를 연결한다",
    zh: "美妆连接世界",
  },
  "home.hero.subtitle": {
    en: "Find the people, brands and projects worth building something with.",
    ja: "美容を通して、まだ見ぬ可能性を、共に見つける。",
    ko: "함께 만들 사람, 브랜드, 프로젝트를 찾으세요.",
    zh: "找到值得一起创造的人、品牌与项目。",
  },
  "home.yourMatch": { en: "Your Match", ja: "あなたへのマッチ", ko: "당신의 매치", zh: "为你匹配" },

  "common.people": { en: "People", ja: "ピープル", ko: "피플", zh: "人物" },
  "common.brands": { en: "Brands", ja: "ブランド", ko: "브랜드", zh: "品牌" },
  "common.projects": { en: "Projects", ja: "プロジェクト", ko: "프로젝트", zh: "项目" },
  "common.events": { en: "Events", ja: "イベント", ko: "이벤트", zh: "活动" },
  "common.match": { en: "Match", ja: "マッチ", ko: "매치", zh: "匹配" },
  "common.connect": { en: "Connect", ja: "つながる", ko: "커넥트", zh: "联系" },
  "common.connected": { en: "Connected", ja: "つながり済み", ko: "연결됨", zh: "已连接" },
  "common.pending": { en: "Requested", ja: "リクエスト済み", ko: "요청됨", zh: "已申请" },
  "common.apply": { en: "Apply", ja: "応募する", ko: "지원하기", zh: "申请" },
  "common.applied": { en: "Applied", ja: "応募済み", ko: "지원 완료", zh: "已申请" },
  "common.viewAll": { en: "View all", ja: "すべて見る", ko: "전체 보기", zh: "查看全部" },
  "common.filters": { en: "Filters", ja: "フィルター", ko: "필터", zh: "筛选" },
  "common.clear": { en: "Clear", ja: "クリア", ko: "초기화", zh: "清除" },
  "common.results": { en: "results", ja: "件", ko: "개 결과", zh: "个结果" },
  "common.whyMatch": { en: "Why this matches you", ja: "マッチした理由", ko: "매치된 이유", zh: "匹配原因" },
  "common.translated": { en: "Translated", ja: "翻訳済み", ko: "번역됨", zh: "已翻译" },
  "common.showOriginal": { en: "Show original", ja: "原文を表示", ko: "원문 보기", zh: "显示原文" },
  "common.showTranslation": { en: "Show translation", ja: "翻訳を表示", ko: "번역 보기", zh: "显示翻译" },
} as const;

export type UIKey = keyof typeof UI_STRINGS;

export function translateKey(key: UIKey, language: LanguageCode): string {
  return UI_STRINGS[key][language] ?? UI_STRINGS[key].en;
}
