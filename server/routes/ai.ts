import { Router, type Express, type Request, type Response } from "express";
import { z } from "zod";
import { getChatCompletion, isAiEnabled } from "../lib/ai";
import { logger } from "../lib/logger";
import {
  AI_CONCIERGE_SETTING_KEY,
  AI_SUPPORT_SETTING_KEY,
  type AiConversationKind,
} from "@shared/ai";
import { storage } from "../storage";

const aiMessageSchema = z.object({
  message: z.string().min(1).max(800),
  conversationId: z.string().uuid().optional(),
});

const conciergeSystemPrompt = `
You are Dine Maison's concise concierge. Your job: gather booking details (event date/time, location, guest count, cuisine/style, dietary needs, budget/price comfort, special requests) and guide the customer to a clear next step. Keep answers under 120 words. Always be transparent about availability and never confirm a specific chef; say you'll suggest good options based on preferences. Ask for missing details one at a time and summarize briefly when enough info is gathered. Avoid emojis and marketing fluff.
`.trim();

const supportSystemPrompt = `
You are Dine Maison's helpful support assistant. Provide short, factual answers about bookings, payments, cancellations, chefs, and safety. If unsure, say you'll hand off to a human. Keep answers under 120 words. Avoid policy guarantees you cannot verify. No emojis.
`.trim();

const AI_RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const AI_RATE_LIMIT_MAX = 12;
const aiRateLimitStore: Record<string, { count: number; resetTime: number }> = {};

function getUserId(req: Request): string | undefined {
  const user = req.user as any;
  return user?.id || user?.claims?.sub || undefined;
}

async function isFeatureEnabled(kind: AiConversationKind) {
  const key = kind === "concierge" ? AI_CONCIERGE_SETTING_KEY : AI_SUPPORT_SETTING_KEY;
  const setting = await storage.getPlatformSetting(key);
  return setting?.value === true;
}

async function getChefSuggestions() {
  const chefs = await storage.getChefs({ isActive: true });
  return chefs.slice(0, 3).map((chef) => ({
    id: chef.id,
    name: chef.displayName,
    cuisines: chef.cuisines || [],
    averageRating: chef.averageRating,
    hourlyRate: chef.hourlyRate,
    minimumSpend: chef.minimumSpend,
    yearsExperience: chef.yearsExperience,
    servicesOffered: chef.servicesOffered,
  }));
}

export function registerAiRoutes(app: Express) {
  const router = Router();

  router.post("/:kind", async (req: Request, res: Response) => {
    const kind = req.params.kind as AiConversationKind;

    const rateKey = getUserId(req) || req.ip || "unknown";
    const now = Date.now();
    const existing = aiRateLimitStore[rateKey];
    if (!existing || existing.resetTime < now) {
      aiRateLimitStore[rateKey] = { count: 0, resetTime: now + AI_RATE_LIMIT_WINDOW_MS };
    }

    const rate = aiRateLimitStore[rateKey];
    rate.count += 1;
    if (rate.count > AI_RATE_LIMIT_MAX) {
      return res.status(429).json({
        message: "Too many AI requests. Please try again later.",
        retryAfter: Math.ceil((rate.resetTime - now) / 1000),
      });
    }

    if (!["concierge", "support"].includes(kind)) {
      return res.status(400).json({ message: "Invalid AI assistant type" });
    }

    if (!isAiEnabled()) {
      return res.status(503).json({ message: "AI is not configured" });
    }

    if (!(await isFeatureEnabled(kind))) {
      return res.status(403).json({ message: "This AI feature is disabled" });
    }

    const parsed = aiMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid message", errors: parsed.error.flatten() });
    }

    const { message, conversationId } = parsed.data;
    const userId = getUserId(req);

    try {
      let conversation =
        conversationId && (await storage.getAiConversation(conversationId));

      if (conversationId && (!conversation || conversation.kind !== kind)) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (conversation?.userId && userId && conversation.userId !== userId) {
        return res.status(403).json({ message: "Conversation does not belong to this user" });
      }

      if (!conversation) {
        conversation = await storage.createAiConversation({
          kind,
          userId,
          status: "open",
        });
      }

      await storage.addAiMessage({
        conversationId: conversation.id,
        role: "user",
        content: message,
      });

      const history = await storage.getAiMessages(conversation.id, 20);

      const systemPrompt = kind === "concierge" ? conciergeSystemPrompt : supportSystemPrompt;
      const messages = [
        { role: "system", content: systemPrompt },
        ...history.map((m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content })),
      ];

      const completion = await getChatCompletion({
        messages,
        maxTokens: kind === "concierge" ? 320 : 220,
        temperature: kind === "concierge" ? 0.5 : 0.3,
      });

      const aiReply =
        completion.content ||
        "I need a moment to check that. Can you try again in a bit?";

      await storage.addAiMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: aiReply,
      });

      const response: Record<string, any> = {
        conversationId: conversation.id,
        reply: aiReply,
      };

      if (kind === "concierge") {
        response.suggestions = await getChefSuggestions();
      }

      return res.json(response);
    } catch (error) {
      logger.error("AI route failed", error, { kind });
      return res.status(500).json({ message: "Unable to process request right now" });
    }
  });

  app.use("/api/ai", router);
}
