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
  const humanTakeoverMap: Record<string, boolean> = {};
  const appSettings = {
    chatBotEnabled: true,
    performanceModeDefault: false,
    maintenanceMode: false,
    liveStatus: "🟢 Open to work",
    accentColor: "#FFB59D",
    adminPassword: "becreative123",
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
    const { adminPassword, ...safeSettings } = appSettings;
    res.json(safeSettings);
  });

  app.post("/api/admin/auth", (req, res) => {
    if (req.body.password === appSettings.adminPassword) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Incorrect password" });
    }
  });

  app.post("/api/admin/password", (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (currentPassword === appSettings.adminPassword) {
      appSettings.adminPassword = newPassword;
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Incorrect current password" });
    }
  });

  app.post("/api/admin/settings", (req, res) => {
    const { settings } = req.body;
    if (settings) {
      if (settings.chatBotEnabled !== undefined) appSettings.chatBotEnabled = settings.chatBotEnabled;
      if (settings.performanceModeDefault !== undefined) appSettings.performanceModeDefault = settings.performanceModeDefault;
      if (settings.maintenanceMode !== undefined) appSettings.maintenanceMode = settings.maintenanceMode;
      if (settings.liveStatus !== undefined) appSettings.liveStatus = settings.liveStatus;
      if (settings.accentColor !== undefined) appSettings.accentColor = settings.accentColor;
      if (settings.hiddenProjects !== undefined) appSettings.hiddenProjects = settings.hiddenProjects;
      if (settings.systemPrompt !== undefined) appSettings.systemPrompt = settings.systemPrompt;
      if (settings.avatarUrl !== undefined) appSettings.avatarUrl = settings.avatarUrl;
    }
    res.json({ success: true, settings: appSettings });
  });

  app.post("/api/admin/avatar", (req, res) => {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image data is required" });
    }
    
    try {
      const match = imageBase64.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/);
      if (!match) {
         return res.status(400).json({ error: "Invalid image format" });
      }
      const ext = match[1];
      const base64Data = match[2];
      
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      const fileName = `custom-avatar.${ext}`;
      const filePath = path.join(publicDir, fileName);
      
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      
      const avatarUrl = `/${fileName}?v=${Date.now()}`;
      appSettings.avatarUrl = avatarUrl;
      
      res.json({ success: true, avatarUrl });
    } catch (err: any) {
      console.error("Failed to save avatar image", err);
      res.status(500).json({ error: "Failed to save avatar image" });
    }
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

      if (humanTakeoverMap[sid]) {
        return res.status(403).json({ error: "HUMAN_TAKEOVER" });
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

  // Admin routes API
  app.get("/api/admin/chats", (req, res) => {
    res.json({ sessions: chatSessions });
  });

  app.post("/api/admin/reply", (req, res) => {
    const { sessionId, message } = req.body;
    if (!sessionId || !message) {
      return res.status(400).json({ error: "Session ID and message required" });
    }
    if (!chatSessions[sessionId]) {
      return res.status(404).json({ error: "Session not found" });
    }
    humanTakeoverMap[sessionId] = true;
    chatSessions[sessionId].push({ role: 'admin', text: message, timestamp: Date.now() });
    res.json({ success: true });
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
