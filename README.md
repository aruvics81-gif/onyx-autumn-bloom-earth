# OCHRE — Ilaiyaraaja Vinyl Music Web App 🎵🎨

A responsive, interactive music streaming platform celebrating the legendary discography of Maestro **Ilaiyaraaja**. Designed with a retro vinyl aesthetic and built for seamless full-length track streaming without external preview limitations or paid hosting fees.

![OCHRE Banner](https://raw.githubusercontent.com/onyx-autumn-bloom-earth/main/public/placeholder.png) <!-- Optional: Replace with a screenshot URL of your app -->

---

## 🚀 Live Demo & Repository

- **Live Web Application:** [onyx-autumn-bloom-earth.vercel.app](https://onyx-autumn-bloom-earth.vercel.app/)
- **GitHub Repository:** [onyx-autumn-bloom-earth](https://github.com/onyx-autumn-bloom-earth)

---

## ✨ Features

- **Vinyl Experience:** Interactive vinyl player UI with rotating album art and retro playback controls.
- **Full-Length Audio Streaming:** Direct audio streaming powered by Supabase Storage, bypassing external API preview restrictions.
- **Structured Discography Catalog:** Dynamic multi-album and track browsing backed by high-quality metadata.
- **Responsive Design:** Optimized for smooth interaction across desktop, tablet, and mobile browsers.
- **Zero-Cost Production Stack:** Fully hosted and maintained using free-tier Vercel deployment and Supabase backend services.

---

## 🛠️ Tech Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite, TypeScript |
| **Styling & UI** | Tailwind CSS, Lucide Icons |
| **State Management** | Zustand (Player Store) |
| **Backend & Storage** | Supabase PostgreSQL, Supabase Storage (`music-assets`) |
| **Hosting & CI/CD** | Vercel, GitHub |

---

## 📊 Database Schema (Supabase)

The full-length audio functionality is backed by a PostgreSQL `songs` table in Supabase:

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `title` | `text` | Song title |
| `movie_name` | `text` | Album / Movie title |
| `release_year` | `integer` | Movie release year |
| `audio_url` | `text` | Direct public URL from Supabase Storage (`music-assets`) |
| `created_at` | `timestamp` | Record creation timestamp |

---

## 💻 Local Development Setup

To run this project locally on your machine:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/onyx-autumn-bloom-earth.git](https://github.com/onyx-autumn-bloom-earth.git)
   cd onyx-autumn-bloom-earth
