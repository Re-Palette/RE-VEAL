import type {
  BeautyEvent,
  Brand,
  City,
  Connection,
  Country,
  Course,
  MatchResult,
  Message,
  MessageThread,
  Notification,
  Opportunity,
  PersonView,
  PortfolioItem,
  Post,
  Project,
  SearchResult,
} from "@/lib/types";

/**
 * The single seam between RE:VEAL's UI and its storage.
 *
 * Every method is async even though the mock implementation is synchronous, so
 * that swapping in a Supabase-backed implementation is a change to one file and
 * nothing else. Nothing in components/ imports mock data directly.
 */
export interface DataSource {
  readonly id: string;

  getCurrentUser(): Promise<PersonView>;

  listPeople(): Promise<PersonView[]>;
  getPerson(id: string): Promise<PersonView | undefined>;

  listBrands(): Promise<Brand[]>;
  getBrand(id: string): Promise<Brand | undefined>;
  listOpportunities(): Promise<Opportunity[]>;

  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;

  listEvents(): Promise<BeautyEvent[]>;
  getEvent(id: string): Promise<BeautyEvent | undefined>;

  listPosts(): Promise<Post[]>;
  listCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  listPortfolio(userId?: string): Promise<PortfolioItem[]>;

  listCities(): Promise<City[]>;
  listCountries(): Promise<Country[]>;

  listThreads(): Promise<MessageThread[]>;
  listMessages(threadId: string): Promise<Message[]>;
  listNotifications(): Promise<Notification[]>;
  listConnections(): Promise<Connection[]>;

  /** Ranked matches for the signed-in viewer, optionally narrowed by kind. */
  matchesFor(kind: MatchResult["targetKind"], limit?: number): Promise<MatchResult[]>;
  search(query: string, limit?: number): Promise<SearchResult[]>;
}
