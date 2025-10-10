"use client";
import Dexie, { Table } from "dexie";
import { MessageType } from "./types/message";
import { BlockKontakType } from "./types/block_kontak";
import { KontakType } from "./types/kontak";

export class ChatDB extends Dexie {
  messages!: Table<MessageType, number>;
  blockKontak!: Table<BlockKontakType, number>;
  kontak!: Table<KontakType, string>;
  lastRead!: Table<{ contact_id: string, last_read_at: string }, string>

  constructor() {
    super("ChatDatabase");
    this.version(1).stores({
      messages: "id, from, to, delete, created_at",
      blockKontak: "id, user, to_user, created_at",
      kontak: "id, list_kontak, created_at",
      lastRead: "contact_id, last_read_at",
    });
  }
}
let db: ChatDB | null = null;

if (typeof window !== "undefined") {
  db = new ChatDB();
}

export { db };

export const allMessages = await db?.messages.toArray();
