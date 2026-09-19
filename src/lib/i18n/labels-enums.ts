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
  PortfolioItem,
  PostKind,
  ProjectStatus,
  ProjectType,
  Region,
  Role,
  ThreadKind,
} from "@/lib/types";

type CourseLevel = "beginner" | "intermediate" | "advanced";
type LessonKind = "video" | "reading" | "workshop" | "assignment";
type OpportunityType =
  | "collaboration"
  | "campaign"
  | "freelance"
  | "internship"
  | "employment"
  | "ambassador";

export interface EnumLabels {
  category: Record<BeautyCategory, string>;
  role: Record<Role, string>;
  region: Record<Region, string>;
  openTo: Record<OpenTo, string>;
  availability: Record<Availability, string>;
  experience: Record<ExperienceLevel, string>;
  brandType: Record<BrandType, string>;
  projectType: Record<ProjectType, string>;
  projectStatus: Record<ProjectStatus, string>;
  eventType: Record<EventType, string>;
  postKind: Record<PostKind, string>;
  learnTrack: Record<LearnTrack, string>;
  notification: Record<NotificationKind, string>;
  reasonKind: Record<MatchReason["kind"], string>;
  portfolioKind: Record<PortfolioItem["kind"], string>;
  courseLevel: Record<CourseLevel, string>;
  lessonKind: Record<LessonKind, string>;
  threadKind: Record<ThreadKind, string>;
  opportunityType: Record<OpportunityType, string>;
}

/** Language names always render in their own language, as is conventional. */
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

export const ENUM_LABELS: Record<LanguageCode, EnumLabels> = {
  en: {
    category: { makeup: "Makeup", skincare: "Skincare", hair: "Hair", nail: "Nail", fashion: "Fashion", photography: "Photography", video: "Video", design: "Design", marketing: "Marketing", "beauty-tech": "Beauty Tech" },
    role: { student: "Student", creator: "Creator", "makeup-artist": "Makeup Artist", "hair-stylist": "Hair Stylist", "nail-artist": "Nail Artist", photographer: "Photographer", "video-creator": "Video Creator", designer: "Designer", marketer: "Marketer", professional: "Professional", founder: "Founder", educator: "Educator" },
    region: { asia: "Asia", europe: "Europe", "north-america": "North America", "south-america": "South America", oceania: "Oceania", africa: "Africa" },
    openTo: { collaboration: "Collaboration", projects: "Projects", "brand-partnership": "Brand Partnership", freelance: "Freelance", internship: "Internship", employment: "Employment", mentorship: "Mentorship" },
    availability: { "open-now": "Open now", "next-month": "From next month", exploring: "Exploring", busy: "Fully booked" },
    experience: { student: "Student", emerging: "Emerging", established: "Established", expert: "Expert" },
    brandType: { "new-beauty-brand": "New Beauty Brand", "student-brand": "Student Brand", d2c: "D2C Brand", "beauty-company": "Beauty Company" },
    projectType: { campaign: "Campaign", photoshoot: "Photoshoot", "product-development": "Product Development", "sns-campaign": "SNS Campaign", event: "Event", "creative-project": "Creative Project", "brand-launch": "Brand Launch" },
    projectStatus: { recruiting: "Recruiting", "in-progress": "In progress", completed: "Completed" },
    eventType: { popup: "POPUP", exhibition: "Exhibition", conference: "Conference", meetup: "Meetup", workshop: "Workshop", competition: "Competition", seminar: "Seminar", networking: "Networking" },
    postKind: { trending: "Trending", "new-creators": "New Creators", "new-brands": "New Brands", projects: "Projects", "beauty-news": "Beauty News", events: "Events", inspiration: "Inspiration" },
    learnTrack: { "beauty-business": "Beauty Business", branding: "Branding", marketing: "Marketing", makeup: "Makeup", hair: "Hair", photography: "Photography", video: "Video", entrepreneurship: "Entrepreneurship", "ai-beauty": "AI × Beauty" },
    notification: { match: "Match", "connect-request": "Connect Request", "project-invitation": "Project Invitation", "project-application": "Project Application", "brand-collaboration": "Brand Collaboration", "event-reminder": "Event Reminder", message: "Message", follow: "Follow", "portfolio-reaction": "Portfolio Reaction" },
    reasonKind: { skill: "Skills", category: "Category", location: "Location", language: "Language", goal: "Goals", availability: "Availability", experience: "Experience", interest: "Interests", opportunity: "Opportunity" },
    portfolioKind: { work: "Work", project: "Project", campaign: "Campaign", editorial: "Editorial", product: "Product", award: "Award" },
    courseLevel: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" },
    lessonKind: { video: "Video", reading: "Reading", workshop: "Workshop", assignment: "Assignment" },
    threadKind: { direct: "Direct", group: "Group", project: "Project", brand: "Brand" },
    opportunityType: { collaboration: "Collaboration", campaign: "Campaign", freelance: "Freelance", internship: "Internship", employment: "Employment", ambassador: "Ambassador" },
  },

  ja: {
    category: { makeup: "メイク", skincare: "スキンケア", hair: "ヘア", nail: "ネイル", fashion: "ファッション", photography: "フォト", video: "動画", design: "デザイン", marketing: "マーケティング", "beauty-tech": "ビューティーテック" },
    role: { student: "学生", creator: "クリエイター", "makeup-artist": "メイクアップアーティスト", "hair-stylist": "ヘアスタイリスト", "nail-artist": "ネイリスト", photographer: "フォトグラファー", "video-creator": "動画クリエイター", designer: "デザイナー", marketer: "マーケター", professional: "プロフェッショナル", founder: "ファウンダー", educator: "講師" },
    region: { asia: "アジア", europe: "ヨーロッパ", "north-america": "北米", "south-america": "南米", oceania: "オセアニア", africa: "アフリカ" },
    openTo: { collaboration: "コラボレーション", projects: "プロジェクト", "brand-partnership": "ブランド提携", freelance: "フリーランス", internship: "インターン", employment: "就職", mentorship: "メンターシップ" },
    availability: { "open-now": "今すぐ可能", "next-month": "来月から", exploring: "検討中", busy: "現在多忙" },
    experience: { student: "学生", emerging: "新進", established: "実績あり", expert: "エキスパート" },
    brandType: { "new-beauty-brand": "新興ビューティーブランド", "student-brand": "学生ブランド", d2c: "D2Cブランド", "beauty-company": "美容企業" },
    projectType: { campaign: "キャンペーン", photoshoot: "撮影", "product-development": "商品開発", "sns-campaign": "SNSキャンペーン", event: "イベント", "creative-project": "クリエイティブ", "brand-launch": "ブランドローンチ" },
    projectStatus: { recruiting: "募集中", "in-progress": "進行中", completed: "完了" },
    eventType: { popup: "POPUP", exhibition: "展示", conference: "カンファレンス", meetup: "ミートアップ", workshop: "ワークショップ", competition: "コンペティション", seminar: "セミナー", networking: "ネットワーキング" },
    postKind: { trending: "トレンド", "new-creators": "新しいクリエイター", "new-brands": "新しいブランド", projects: "プロジェクト", "beauty-news": "ビューティーニュース", events: "イベント", inspiration: "インスピレーション" },
    learnTrack: { "beauty-business": "ビューティービジネス", branding: "ブランディング", marketing: "マーケティング", makeup: "メイク", hair: "ヘア", photography: "フォト", video: "動画", entrepreneurship: "起業", "ai-beauty": "AI × ビューティー" },
    notification: { match: "マッチ", "connect-request": "つながり申請", "project-invitation": "プロジェクト招待", "project-application": "プロジェクト応募", "brand-collaboration": "ブランドコラボ", "event-reminder": "イベント通知", message: "メッセージ", follow: "フォロー", "portfolio-reaction": "ポートフォリオ反応" },
    reasonKind: { skill: "スキル", category: "カテゴリー", location: "場所", language: "言語", goal: "目標", availability: "稼働状況", experience: "経験", interest: "興味", opportunity: "機会" },
    portfolioKind: { work: "作品", project: "プロジェクト", campaign: "キャンペーン", editorial: "エディトリアル", product: "プロダクト", award: "受賞" },
    courseLevel: { beginner: "入門", intermediate: "中級", advanced: "上級" },
    lessonKind: { video: "動画", reading: "読み物", workshop: "ワークショップ", assignment: "課題" },
    threadKind: { direct: "ダイレクト", group: "グループ", project: "プロジェクト", brand: "ブランド" },
    opportunityType: { collaboration: "コラボ", campaign: "キャンペーン", freelance: "業務委託", internship: "インターン", employment: "採用", ambassador: "アンバサダー" },
  },

  ko: {
    category: { makeup: "메이크업", skincare: "스킨케어", hair: "헤어", nail: "네일", fashion: "패션", photography: "포토그래피", video: "영상", design: "디자인", marketing: "마케팅", "beauty-tech": "뷰티테크" },
    role: { student: "학생", creator: "크리에이터", "makeup-artist": "메이크업 아티스트", "hair-stylist": "헤어 스타일리스트", "nail-artist": "네일 아티스트", photographer: "포토그래퍼", "video-creator": "영상 크리에이터", designer: "디자이너", marketer: "마케터", professional: "전문가", founder: "창업자", educator: "교육자" },
    region: { asia: "아시아", europe: "유럽", "north-america": "북미", "south-america": "남미", oceania: "오세아니아", africa: "아프리카" },
    openTo: { collaboration: "협업", projects: "프로젝트", "brand-partnership": "브랜드 파트너십", freelance: "프리랜스", internship: "인턴십", employment: "취업", mentorship: "멘토십" },
    availability: { "open-now": "지금 가능", "next-month": "다음 달부터", exploring: "알아보는 중", busy: "일정 마감" },
    experience: { student: "학생", emerging: "신진", established: "중견", expert: "전문가" },
    brandType: { "new-beauty-brand": "신규 뷰티 브랜드", "student-brand": "학생 브랜드", d2c: "D2C 브랜드", "beauty-company": "뷰티 기업" },
    projectType: { campaign: "캠페인", photoshoot: "촬영", "product-development": "제품 개발", "sns-campaign": "SNS 캠페인", event: "이벤트", "creative-project": "크리에이티브", "brand-launch": "브랜드 론칭" },
    projectStatus: { recruiting: "모집 중", "in-progress": "진행 중", completed: "완료" },
    eventType: { popup: "팝업", exhibition: "전시", conference: "컨퍼런스", meetup: "밋업", workshop: "워크숍", competition: "공모전", seminar: "세미나", networking: "네트워킹" },
    postKind: { trending: "트렌딩", "new-creators": "신규 크리에이터", "new-brands": "신규 브랜드", projects: "프로젝트", "beauty-news": "뷰티 뉴스", events: "이벤트", inspiration: "인스피레이션" },
    learnTrack: { "beauty-business": "뷰티 비즈니스", branding: "브랜딩", marketing: "마케팅", makeup: "메이크업", hair: "헤어", photography: "포토그래피", video: "영상", entrepreneurship: "창업", "ai-beauty": "AI × 뷰티" },
    notification: { match: "매치", "connect-request": "커넥트 요청", "project-invitation": "프로젝트 초대", "project-application": "프로젝트 지원", "brand-collaboration": "브랜드 협업", "event-reminder": "이벤트 알림", message: "메시지", follow: "팔로우", "portfolio-reaction": "포트폴리오 반응" },
    reasonKind: { skill: "스킬", category: "카테고리", location: "위치", language: "언어", goal: "목표", availability: "가능 여부", experience: "경험", interest: "관심사", opportunity: "기회" },
    portfolioKind: { work: "작업", project: "프로젝트", campaign: "캠페인", editorial: "에디토리얼", product: "제품", award: "수상" },
    courseLevel: { beginner: "입문", intermediate: "중급", advanced: "고급" },
    lessonKind: { video: "영상", reading: "읽기", workshop: "워크숍", assignment: "과제" },
    threadKind: { direct: "다이렉트", group: "그룹", project: "프로젝트", brand: "브랜드" },
    opportunityType: { collaboration: "협업", campaign: "캠페인", freelance: "프리랜스", internship: "인턴십", employment: "채용", ambassador: "앰배서더" },
  },

  zh: {
    category: { makeup: "彩妆", skincare: "护肤", hair: "美发", nail: "美甲", fashion: "时尚", photography: "摄影", video: "视频", design: "设计", marketing: "营销", "beauty-tech": "美妆科技" },
    role: { student: "学生", creator: "创作者", "makeup-artist": "化妆师", "hair-stylist": "发型师", "nail-artist": "美甲师", photographer: "摄影师", "video-creator": "视频创作者", designer: "设计师", marketer: "营销人员", professional: "专业人士", founder: "创始人", educator: "讲师" },
    region: { asia: "亚洲", europe: "欧洲", "north-america": "北美", "south-america": "南美", oceania: "大洋洲", africa: "非洲" },
    openTo: { collaboration: "合作", projects: "项目", "brand-partnership": "品牌合作", freelance: "自由职业", internship: "实习", employment: "就业", mentorship: "导师指导" },
    availability: { "open-now": "现在可接", "next-month": "下月起", exploring: "观望中", busy: "档期已满" },
    experience: { student: "学生", emerging: "新锐", established: "资深", expert: "专家" },
    brandType: { "new-beauty-brand": "新锐美妆品牌", "student-brand": "学生品牌", d2c: "D2C 品牌", "beauty-company": "美妆企业" },
    projectType: { campaign: "营销企划", photoshoot: "拍摄", "product-development": "产品开发", "sns-campaign": "社媒企划", event: "活动", "creative-project": "创意项目", "brand-launch": "品牌上市" },
    projectStatus: { recruiting: "招募中", "in-progress": "进行中", completed: "已完成" },
    eventType: { popup: "快闪", exhibition: "展览", conference: "大会", meetup: "聚会", workshop: "工作坊", competition: "竞赛", seminar: "讲座", networking: "社交" },
    postKind: { trending: "热门", "new-creators": "新锐创作者", "new-brands": "新锐品牌", projects: "项目", "beauty-news": "美妆快讯", events: "活动", inspiration: "灵感" },
    learnTrack: { "beauty-business": "美妆商业", branding: "品牌建设", marketing: "营销", makeup: "彩妆", hair: "美发", photography: "摄影", video: "视频", entrepreneurship: "创业", "ai-beauty": "AI × 美妆" },
    notification: { match: "匹配", "connect-request": "连接请求", "project-invitation": "项目邀请", "project-application": "项目申请", "brand-collaboration": "品牌合作", "event-reminder": "活动提醒", message: "消息", follow: "关注", "portfolio-reaction": "作品反馈" },
    reasonKind: { skill: "技能", category: "类别", location: "地区", language: "语言", goal: "目标", availability: "可接状态", experience: "经验", interest: "兴趣", opportunity: "机会" },
    portfolioKind: { work: "作品", project: "项目", campaign: "企划", editorial: "大片", product: "产品", award: "奖项" },
    courseLevel: { beginner: "入门", intermediate: "中级", advanced: "高级" },
    lessonKind: { video: "视频", reading: "阅读", workshop: "工作坊", assignment: "作业" },
    threadKind: { direct: "私信", group: "群组", project: "项目", brand: "品牌" },
    opportunityType: { collaboration: "合作", campaign: "企划", freelance: "外包", internship: "实习", employment: "招聘", ambassador: "品牌大使" },
  },
};
