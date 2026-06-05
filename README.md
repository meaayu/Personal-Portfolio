# Aayu's Personal Portfolio

A sleek, modern, and interactive personal portfolio showcasing projects, skills, and providing a dynamic way to connect through an integrated Smart Chat Widget and Admin Portal.

## 🚀 Features

- **Interactive Hero Section:** Engaging particle text effects, performance-optimized animations, and customized avatar handling.
- **Smart Chat Widget:** An integrated chat interface allowing visitors to interact. Supports user, model, and "Real Aayu" (admin) roles.
  - **Live Chat Management:** Read and reply to visitor messages in real-time.
  - **Site Settings:** Toggle "Under Construction" mode.
  - **Profile Management:** Update avatar and change administrator password (with show/hide password toggles).
- **Project Showcase:** Highlights featured projects and works.
- **Responsive Design:** Fluid layouts built desktop-first but fully mobile-responsive using Tailwind CSS.
- **Performance Mode:** Ability to toggle visual effects for smoother performance on lower-end devices.

## 🛠 Tech Stack

- **Frontend:** React 18+, Vite, TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Motion (Framer Motion)
- **Icons:** Lucide React
- **Backend/API:** Express.js (`server.ts`)

## 📦 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

1. Clone the repository / download the source code.
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server natively:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

Compile and bundle the project for production:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

## 🔒 Admin Access

The admin portal is available at the `/admin` route. By default, ensure you have the correct initial password configured directly or in your environment to access the dashboard. From there, you can configure your avatar, reply to visitor messages, and manage site maintenance modes.
