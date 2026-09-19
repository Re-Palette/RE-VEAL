import { MockDataSource } from "@/lib/data-source/mock";
import type { DataSource } from "@/lib/data-source/types";

/**
 * Swap this for `new SupabaseDataSource(client)` when the backend lands. Nothing
 * else in the application needs to change: every page and component reads
 * through this one binding.
 */
export const db: DataSource = new MockDataSource();

export type { DataSource };
