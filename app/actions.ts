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

export async function deleteImageKitFile(fileId: string): Promise<boolean> {
  try {
    const ik = (await import("../lib/imagekit")).getImageKitInstance();
    await ik.deleteFile(fileId);
    console.log("Successfully deleted file from ImageKit:", fileId);
    return true;
  } catch (error) {
    console.error("Failed to delete file from ImageKit:", error);
    return false;
  }
}
