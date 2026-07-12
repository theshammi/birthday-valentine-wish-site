# Birthday & Valentine Wish Site 🎈💖

A beautiful, highly-customizable Next.js application designed to create personalized and memorable celebration experiences for birthdays, anniversaries, and Valentine's Day.

> **⚠️ Note:** This project has been significantly upgraded to feature a fully dynamic admin dashboard with real-time database integration and client-side authentication.

## Features ✨

- **Personalized Envelope Entry:** A beautiful introductory animation to welcome the user, fully customizable (name, title, date).
- **Dynamic Hero Section:** Customize the main greeting and romantic quote directly from the dashboard.
- **Memory Timeline:** Interactive timeline to showcase favorite photos, videos, and shared memories with captions and dates.
- **Background Music:** Upload your own custom audio track (`.mp3`/`.wav`) to play when the envelope opens, or use the default track.
- **Gifts Section:** A dedicated area to highlight special surprises, with support for an unlockable final video gift!
- **Interactive WebGL Background:** Stunning and dynamic visual effects for a premium feel (floating hearts, sparkles, and reactive particles).
- **Admin Dashboard (`/admin`):** Fully integrated client-side admin panel powered by Firebase Auth. Upload media directly to ImageKit, add timeline memories, and tweak UI text instantly without touching code.
- **Firebase Realtime Database:** Instant, real-time sync for all content. The main page uses high-speed REST API fetching to stay blazingly fast and SEO-friendly.
- **ImageKit Integration:** Seamless and optimized image, video, and audio hosting and delivery.

## Getting Started 🚀

### Prerequisites
- Node.js 18+ installed.
- An [ImageKit](https://imagekit.io/) account for media handling.
- A [Firebase](https://firebase.google.com/) project with **Authentication** (Email/Password) and **Realtime Database** enabled.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/theshammi/birthday-valentine-wish-site.git
   cd birthday-valentine-wish-site
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and fill in your ImageKit and Firebase credentials:
   
   ```env
   # ImageKit Configuration (For Media Hosting)
   NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key

   # Firebase Client Configuration (For Database & Auth)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

4. **Database Rules (Crucial for Security)**
   In your Firebase Console, set your Realtime Database rules to allow public reads, but restrict writes to authenticated users:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": "auth != null"
     }
   }
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage 🛠️

- **Main View (`/`):** The main page serves as the interactive greeting card experience. Data is fetched automatically from Firebase.
- **Admin Dashboard (`/admin`):** 
  - Go to `/admin` and log in with your Firebase Auth email and password.
  - **Memories Tab:** Upload photos or videos and add captions to populate the snapshot timeline.
  - **Settings Tab:** Customize the Birthday Person's Name, Event Date, Envelope Title, Theme, Hero Quotes, Background Music, and Final Video Gift!

## Deployment 🌐

This app is fully optimized for **Vercel**. 
Because it uses Firebase's REST API for reads instead of the Admin SDK, there is no need to configure complex, multi-line `FIREBASE_SERVICE_ACCOUNT_KEY` environment variables. Just drop your standard client keys into Vercel and hit deploy!

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
