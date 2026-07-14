export interface Wish {
  id: string;
  sender: string;
  relationship: string;
  text: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Memory {
  id: string;
  imageUrl: string;
  videoUrl?: string;
  caption: string;
  date: string;
  order: number;
}

export interface AppConfig {
  birthdayName: string;
  envelopeTitle: string;
  birthDate: string;
  finalVideoUrl?: string;
  finalVideoFileId?: string;
  muteBgmDuringVideo?: "auto" | "yes" | "no";
  endScreenTitle?: string;
  endScreenBody?: string;
  theme?: "gold" | "rose" | "midnight";
  isMusicEnabled?: boolean;
  heroGreeting?: string;
  heroQuote?: string;
  memoriesTitle?: string;
  memoriesDescription?: string;
  backgroundMusicUrl?: string;
  backgroundMusicFileId?: string;
  enableTextReveal?: boolean;
  textRevealSpeed?: number;
  afterVideoPhrases?: string;
}

export interface DatabaseSchema {
  wishes: Wish[];
  memories: Memory[];
  config: AppConfig;
}

export const DEFAULT_CONFIG: AppConfig = {
  birthdayName: "Anam",
  birthDate: "2006-08-02",
  envelopeTitle: "A Secret invitation for someone very special...",
  theme: "rose",
  isMusicEnabled: true,
  heroGreeting: "Love of my life,",
  heroQuote: "In all the world, there is no heart for me like yours.\nIn all the world, there is no love for you like mine.",
  memoriesTitle: "Our Memories",
  memoriesDescription: "A timeline of our favorite moments. Each polaroid is a beautiful memory, a quiet smile, and a story we shared together.",
  enableTextReveal: true,
  textRevealSpeed: 0.03,
  afterVideoPhrases: "I didn't just build this to say Happy Birthday...\nI built this to remind you...\nThat in a universe of infinite possibilities...\nYou are my absolute favorite one.\nI love you, forever."
};

export const DEFAULT_DB: DatabaseSchema = {
  wishes: [
    {
      id: "1",
      sender: "Admin",
      relationship: "Friend",
      text: "Happy Birthday! Wishing you all the best.",
      isApproved: true,
      createdAt: new Date().toISOString(),
    }
  ],
  memories: [],
  config: DEFAULT_CONFIG,
};

export async function readDb(): Promise<DatabaseSchema> {
  try {
    const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
    if (!dbUrl) {
      console.warn("NEXT_PUBLIC_FIREBASE_DATABASE_URL is missing. Returning default DB.");
      return DEFAULT_DB;
    }

    // Using REST API for fast, edge-compatible public data fetching without Admin SDK
    const res = await fetch(`${dbUrl}/greetings/main.json`, {
      next: { revalidate: 10 } // Revalidate every 10 seconds
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch from Firebase REST API: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data) return DEFAULT_DB;

    // Convert object maps to arrays if Firebase returns them as objects
    const wishes = Array.isArray(data.wishes) ? data.wishes : (data.wishes ? Object.values(data.wishes) : []);
    const memories = Array.isArray(data.memories) ? data.memories : (data.memories ? Object.values(data.memories) : []);

    return {
      wishes: wishes as Wish[],
      memories: memories as Memory[],
      config: { ...DEFAULT_CONFIG, ...data.config }
    };
  } catch (error) {
    console.error("Failed to read Firebase RTDB, returning defaults:", error);
    return DEFAULT_DB;
  }
}
