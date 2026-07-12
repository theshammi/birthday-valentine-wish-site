"use server";

import { readDb, Wish, Memory, AppConfig } from "../lib/db";
import { getAuthenticationParameters } from "../lib/imagekit";

// Public Reads (for Server Components like app/page.tsx)
export async function getWishes(): Promise<Wish[]> {
  const db = await readDb();
  // Only return approved wishes to the public
  return db.wishes.filter((w) => w.isApproved);
}

export async function getMemories(): Promise<Memory[]> {
  const db = await readDb();
  return db.memories.sort((a, b) => a.order - b.order);
}

export async function getConfig(): Promise<AppConfig> {
  const db = await readDb();
  return db.config;
}

// ImageKit Auth
export async function getImageKitAuth(): Promise<{ token: string; expire: number; signature: string } | null> {
  try {
    return getAuthenticationParameters();
  } catch (error) {
    console.error("Failed to generate ImageKit authentication parameters:", error);
    return null;
  }
}
