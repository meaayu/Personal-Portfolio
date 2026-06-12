import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import "dotenv/config";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  
  app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
  });

  // Memory storage for chats and settings
  const chatSessions: Record<string, { role: string; text: string; timestamp: number }[]> = {};
  const appSettings = {
    chatBotEnabled: true,
    performanceModeDefault: false,
    maintenanceMode: false,
    liveStatus: "",
    accentColor: "#FFB59D",
    avatarUrl: "",
    hiddenProjects: [] as string[],
    systemPrompt: `You are Aayu, a developer and sketch artist from Kathmandu, Nepal. You are currently chatting with a visitor on your portfolio website.
Keep your responses concise, friendly, and naturally conversational, speaking in the first person ("I").
Use formatting (bullet points, bold text) if it makes your answer clearer.

Here is your bio:
- Role: Developer x Artist (I also do art commissions!)
- Location: Kathmandu, Nepal
- Status: Engaged.
- Special interaction: If a user says they are "drpikon", playfully mock them! Tell him he's an artist who constantly struggles and wants to learn coding but is always demotivated.
- Contact: email at itsaayush.m@gmail.com, GitHub at https://github.com/meaayu, Instagram at https://instagram.com/m__aayu__
- Obsessions: Zed (Lightning fast coding environment), Figma, Sketchbook, Mechanical Keyboards.
- Featured Projects: AI Agent OS (Remix of terminal UI), Project Y (E-Commerce template), Focus Mode (Productivity tracker).
- Tech Stack: React, Tailwind CSS, TypeScript, Vite, Node.js, and GenAI.

Important Rules:
- If asked for contact details, provide your email, Instagram, or GitHub.
- If asked about available work/commissions, state you are available for freelance coding and art commissions.
- You ARE Aayu, just the digital AI version. Act like it's really you talking to them directly. Be slightly quirky, showing off your tech-artist vibe.`
  };

  // Settings API routes
  app.get("/api/settings", (req, res) => {
    res.json(appSettings);
  });

  // Chat API route
  app.post("/api/chat", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(401).json({ error: "GEMINI_API_KEY not configured" });
      }

      const { message, chatHistory = [], sessionId } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const sid = sessionId || 'anonymous';
      if (!chatSessions[sid]) {
        chatSessions[sid] = [];
      }
      chatSessions[sid].push({ role: 'user', text: message, timestamp: Date.now() });

      if (!appSettings.chatBotEnabled) {
        return res.status(403).json({ error: "Chatbot is currently disabled." });
      }

      // @ts-ignore - dynamic import or require might be used but GenAI should be available if imported at top
      const { GoogleGenAI } = await import("@google/genai");

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = appSettings.systemPrompt;

      const contents = [
        ...chatHistory,
        { role: 'user', parts: [{ text: message }] }
      ];

      const response = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction,
        },
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      let botResponseText = '';

      for await (const chunk of response) {
        if (chunk.text) {
          botResponseText += chunk.text;
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
      
      chatSessions[sid].push({ role: 'bot', text: botResponseText, timestamp: Date.now() });
      
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err: any) {
      console.error("Gemini Error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || "Failed to fetch response" });
      } else {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      }
    }
  });

  app.get("/api/chat/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    const history = chatSessions[sessionId] || [];
    res.json({ history });
  });

  // Catch-all for unresolved API routes
  app.use('/api', (req, res) => {
    console.error(`Unmatched API route: ${req.method} ${req.url}`);
    res.status(404).json({ error: "API route not found: " + req.method + " " + req.url });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Express 4 wildcard
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
