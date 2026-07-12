import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

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
  birthDate: string; // YYYY-MM-DD format
  envelopeTitle: string;
  theme: "gold" | "rose" | "midnight";
  isMusicEnabled: boolean;
  backgroundMusicUrl?: string;
  finalVideoUrl?: string;
}

export interface DatabaseSchema {
  wishes: Wish[];
  memories: Memory[];
  config: AppConfig;
}

const DEFAULT_CONFIG: AppConfig = {
  birthdayName: "Anam",
  birthDate: "2026-07-20",
  envelopeTitle: "A Secret invitation for someone very special...",
  theme: "rose",
  isMusicEnabled: true,
};

const DEFAULT_DB: DatabaseSchema = {
  wishes: [
    {
      id: "1",
      sender: "Your Love",
      relationship: "Partner",
      text: "To the one who holds my heart, happy birthday. Every day with you is a gift, and I am so grateful to walk this beautiful journey of life by your side. Here's to forever.",
      isApproved: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      sender: "Best Friend",
      relationship: "Friend",
      text: "Happy Birthday! Seeing the love and laughter you two share is a constant inspiration. Wishing you a year ahead as wonderful and bright as you are.",
      isApproved: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      sender: "Family",
      relationship: "Sister",
      text: "Happy Birthday! Wishing you endless warmth, joy, and peace. You bring so much light into our lives, and we love you dearly.",
      isApproved: true,
      createdAt: new Date().toISOString(),
    }
  ],
  memories: [
    {
      id: "m1",
      imageUrl: "https://picsum.photos/seed/love-roadtrip/800/600",
      caption: "Our first spontaneous road trip. Driving into the sunset, singing at the top of our lungs.",
      date: "May 2024",
      order: 1,
    },
    {
      id: "m2",
      imageUrl: "https://picsum.photos/seed/love-beach/800/600",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-heart-shaped-neon-lights-flashing-on-a-wall-41804-large.mp4",
      caption: "Our favorite corner of the world, illuminated by neon glows and endless laughter.",
      date: "September 2024",
      order: 2,
    },
    {
      id: "m3",
      imageUrl: "https://picsum.photos/seed/love-cafe/800/600",
      caption: "Cozy rainy Sunday mornings spent talking for hours over hot cups of coffee.",
      date: "December 2024",
      order: 3,
    },
    {
      id: "m4",
      imageUrl: "https://picsum.photos/seed/love-stars/800/600",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-holding-hands-and-walking-in-a-field-42456-large.mp4",
      caption: "Walking hand-in-hand under the golden afternoon rays.",
      date: "March 2025",
      order: 4,
    },
    {
      id: "m5",
      imageUrl: "https://picsum.photos/seed/love-sparkle/800/600",
      caption: "Celebrating small victories. Together, we can take on the entire world.",
      date: "June 2025",
      order: 5,
    },
    {
      id: "m6",
      imageUrl: "https://picsum.photos/seed/love-picnic/800/600",
      caption: "That wonderful summer picnic where we laughed until we cried.",
      date: "August 2025",
      order: 6,
    },
    {
      id: "m7",
      imageUrl: "https://picsum.photos/seed/love-snow/800/600",
      caption: "Our first snow together. Freezing outside, but so warm in my heart.",
      date: "December 2025",
      order: 7,
    },
    {
      id: "m8",
      imageUrl: "https://picsum.photos/seed/love-future/800/600",
      caption: "Looking forward to a hundred more birthdays by your side.",
      date: "July 2026",
      order: 8,
    }
  ],

  config: DEFAULT_CONFIG,
};


function ensureDbDirectory() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function readDb(): Promise<DatabaseSchema> {
  ensureDbDirectory();
  try {
    if (!fs.existsSync(DB_PATH)) {
      await writeDb(DEFAULT_DB);
      return DEFAULT_DB;
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw);

    // Ensure all top-level keys exist to prevent undefined errors
    return {
      wishes: parsed.wishes || [],
      memories: parsed.memories || [],
      config: { ...DEFAULT_CONFIG, ...parsed.config }
    };
  } catch (error) {
    console.error("Failed to read JSON DB, returning defaults:", error);
    return DEFAULT_DB;
  }
}

export async function writeDb(data: DatabaseSchema): Promise<void> {
  ensureDbDirectory();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}
