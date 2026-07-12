"use server";

import { cookies } from "next/headers";
import { readDb, writeDb, Wish, Memory, AppConfig } from "../lib/db";
import { getAuthenticationParameters } from "../lib/imagekit";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const SESSION_COOKIE_NAME = "birthday_admin_session";

// Helper to check if user is authenticated
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value === ADMIN_PASSWORD;
}

// Authentication
export async function loginAdmin(password: string): Promise<boolean> {
  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, ADMIN_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    return true;
  }
  return false;
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Wishes
export async function getWishes(): Promise<Wish[]> {
  const db = await readDb();
  const isAdmin = await isAdminAuthenticated();
  if (isAdmin) {
    return db.wishes;
  }
  return db.wishes.filter((w) => w.isApproved);
}

export async function submitWish(sender: string, relationship: string, text: string): Promise<{ success: boolean; message: string }> {
  if (!sender.trim() || !text.trim()) {
    return { success: false, message: "Sender name and wish text are required." };
  }

  const db = await readDb();
  const newWish: Wish = {
    id: Math.random().toString(36).substring(2, 9),
    sender: sender.trim(),
    relationship: relationship.trim() || "Friend",
    text: text.trim(),
    isApproved: false, // Moderated by default
    createdAt: new Date().toISOString(),
  };

  db.wishes.unshift(newWish);
  await writeDb(db);

  return { success: true, message: "Your wish has been submitted and is pending approval. Thank you!" };
}

export async function moderateWish(id: string, action: "approve" | "delete"): Promise<{ success: boolean }> {
  const isAuthorized = await isAdminAuthenticated();
  if (!isAuthorized) {
    throw new Error("Unauthorized");
  }

  const db = await readDb();
  if (action === "approve") {
    const wish = db.wishes.find((w) => w.id === id);
    if (wish) {
      wish.isApproved = true;
    }
  } else if (action === "delete") {
    db.wishes = db.wishes.filter((w) => w.id !== id);
  }

  await writeDb(db);
  return { success: true };
}

// Memories
export async function getMemories(): Promise<Memory[]> {
  const db = await readDb();
  return db.memories.sort((a, b) => a.order - b.order);
}

export async function addMemory(imageUrl: string, caption: string, date: string, videoUrl?: string): Promise<{ success: boolean }> {
  const isAuthorized = await isAdminAuthenticated();
  if (!isAuthorized) {
    throw new Error("Unauthorized");
  }

  if (!imageUrl && !videoUrl) {
    return { success: false };
  }

  const db = await readDb();
  const newMemory: Memory = {
    id: Math.random().toString(36).substring(2, 9),
    imageUrl: imageUrl || "https://picsum.photos/seed/placeholder/800/600",
    videoUrl,
    caption: caption.trim() || "A beautiful memory.",
    date: date.trim() || "Memory Date",
    order: db.memories.length + 1,
  };

  db.memories.push(newMemory);
  await writeDb(db);
  return { success: true };
}


export async function deleteMemory(id: string): Promise<{ success: boolean }> {
  const isAuthorized = await isAdminAuthenticated();
  if (!isAuthorized) {
    throw new Error("Unauthorized");
  }

  const db = await readDb();
  db.memories = db.memories.filter((m) => m.id !== id);
  // Re-index order
  db.memories.forEach((m, idx) => {
    m.order = idx + 1;
  });

  await writeDb(db);
  return { success: true };
}

// Config
export async function getConfig(): Promise<AppConfig> {
  const db = await readDb();
  return db.config;
}

export async function updateConfig(newConfig: Partial<AppConfig>): Promise<{ success: boolean }> {
  const isAuthorized = await isAdminAuthenticated();
  if (!isAuthorized) {
    throw new Error("Unauthorized");
  }

  const db = await readDb();
  db.config = {
    ...db.config,
    ...newConfig,
  };

  await writeDb(db);
  return { success: true };
}

// ImageKit client auth signature helper
export async function getImageKitAuth(): Promise<{ token: string; expire: number; signature: string } | null> {
  const isAuthorized = await isAdminAuthenticated();
  if (!isAuthorized) {
    return null;
  }
  try {
    return getAuthenticationParameters();
  } catch (error) {
    console.error("Failed to generate ImageKit authentication parameters:", error);
    return null;
  }
}
