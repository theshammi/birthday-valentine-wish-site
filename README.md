# Birthday & Valentine Wish Site 🎈💖

A beautiful, interactive Next.js application designed to create personalized and memorable celebration experiences for birthdays and Valentine's Day. 

> **⚠️ Note:** This is the very first version of the project. It is currently in its early stages of development, so you might encounter some bugs or unexpected issues. 

## Features ✨

- **Personalized Envelope Entry:** A beautiful introductory animation to welcome the user.
- **Memory Timeline:** Interactive timeline to showcase favorite photos and shared memories.
- **Gifts Section:** A dedicated area to highlight special gifts, surprises, or messages.
- **Interactive WebGL Background:** Stunning and dynamic visual effects for a premium feel.
- **Admin Dashboard:** Manage your site's images and memories via an integrated dashboard.
- **ImageKit Integration:** Seamless and optimized image hosting and delivery.

## Getting Started 🚀

### Prerequisites
- Node.js 18+ installed.
- An [ImageKit](https://imagekit.io/) account for media handling.

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
   Create a `.env.local` file in the root directory and configure your ImageKit credentials:
   ```env
   NEXT_PUBLIC_PUBLIC_KEY=your_imagekit_public_key
   NEXT_PUBLIC_URL_ENDPOINT=your_imagekit_url_endpoint
   PRIVATE_KEY=your_imagekit_private_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage 🛠️

- **Main View (`/`):** The main page serves as the interactive greeting card experience.
- **Admin Dashboard (`/admin`):** Navigate to the admin route to upload and manage the images shown in the timeline and gifts section.

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
