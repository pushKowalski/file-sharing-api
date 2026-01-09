import {
  pgTable,
  uuid,
  varchar,
  integer,
  bigint,
  timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user.model.js";

export const filesTable = pgTable("files", {
  id: uuid().primaryKey().defaultRandom(),

  originalName: varchar("original_name").notNull(),
  storedName: varchar("stored_name").unique(),
  mimeType: varchar("mime_type").notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull(),
  shareCode: varchar("share_code", { length: 10 }).notNull().unique(),

  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  downloadCount: integer("download_count").default(0),
  expiresAt: timestamp("expires_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
