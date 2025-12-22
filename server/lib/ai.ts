import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { config } from "../config";
import { logger } from "./logger";

export type AiMessage = ChatCompletionMessageParam;

const MAX_INPUT_CHARS = 4000;

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!config.ai.apiKey) {
    logger.warn("AI requested but OPENAI_API_KEY is not configured");
    throw new Error("AI is not configured");
  }

  if (!client) {
    client = new OpenAI({
      apiKey: config.ai.apiKey,
      baseURL: config.ai.baseUrl,
    });
  }

  return client;
}

export function isAiEnabled(): boolean {
  return Boolean(config.ai.apiKey);
}

export async function getChatCompletion(options: {
  messages: AiMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<{ content: string; finishReason?: string }> {
  const aiClient = getClient();

  const sanitizedMessages = options.messages.map((m) => ({
    ...m,
    content: typeof m.content === "string" ? m.content.slice(0, MAX_INPUT_CHARS) : m.content,
  }));

  try {
    const response = await aiClient.chat.completions.create({
      model: options.model || config.ai.model,
      messages: sanitizedMessages,
      temperature: options.temperature ?? config.ai.temperature,
      max_tokens: options.maxTokens ?? config.ai.maxTokens,
    });

    const choice = response.choices?.[0];
    return {
      content: choice?.message?.content?.trim() || "",
      finishReason: choice?.finish_reason || undefined,
    };
  } catch (error) {
    logger.error("OpenAI completion failed", error);
    throw new Error("Unable to generate AI response at this time");
  }
}


