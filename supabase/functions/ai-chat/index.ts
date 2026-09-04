import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

const SYSTEM_PROMPT = `You are AKN AI, a helpful real estate assistant for AKN Estates in Pakistan. Answer in the same language and style the user writes in — Roman Urdu or English, matching their tone. Be friendly, concise, and helpful about pricing, locations, property types, and the installment calculator on the site. Keep responses short and conversational, like a helpful real estate agent texting a client. (Note: real property listings context will be added in a future update — for now, answer generally and don't claim specific property details.)`;

const FALLBACK_MESSAGE =
  "Sorry, I'm having trouble connecting right now. Please try again in a moment.";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ── Read AI config (bypasses RLS with service role) ──────
    const { data: configData, error: configError } = await supabase
      .from("ai_config")
      .select("*")
      .eq("id", 1)
      .single();

    if (configError || !configData) {
      return jsonResponse(500, {
        reply: FALLBACK_MESSAGE,
        fallback: true,
      });
    }

    const config = configData as {
      provider: string;
      custom_provider_name: string;
      custom_endpoint: string;
      api_key: string;
      chatbot_enabled: boolean;
      welcome_message: string;
    };

    if (!config.chatbot_enabled) {
      return jsonResponse(403, { error: "Chatbot is disabled" });
    }

    if (!config.api_key) {
      return jsonResponse(500, {
        reply: FALLBACK_MESSAGE,
        fallback: true,
      });
    }

    // ── Parse request body ──────────────────────────────────
    const body = (await req.json()) as ChatRequest;
    if (!body.messages || !Array.isArray(body.messages)) {
      return jsonResponse(400, { error: "Invalid request body" });
    }

    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...body.messages,
    ];

    // ── Call the AI provider ─────────────────────────────────
    let reply: string;
    try {
      reply = await callAIProvider(config, aiMessages);
    } catch {
      return jsonResponse(500, {
        reply: FALLBACK_MESSAGE,
        fallback: true,
      });
    }

    if (!reply) {
      return jsonResponse(500, {
        reply: FALLBACK_MESSAGE,
        fallback: true,
      });
    }

    // ── Check for phone numbers in latest user message ────────
    const lastUserMsg = [...body.messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      const phoneMatch = extractPhone(lastUserMsg.content);
      if (phoneMatch) {
        await saveLead(supabase, phoneMatch, lastUserMsg.content);
      }
    }

    return jsonResponse(200, { reply, fallback: false });
  } catch {
    return jsonResponse(500, {
      reply: FALLBACK_MESSAGE,
      fallback: true,
    });
  }
});

function jsonResponse(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractPhone(text: string): string | null {
  const patterns = [
    /(?:\+?92|0)?3\d{2}[-\s]?\d{7}/,
    /(?:\+?92|0)3\d{9}/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[0].replace(/[-\s]/g, "");
  }
  const intl = text.match(/\+\d{7,15}/);
  if (intl) return intl[0];
  return null;
}

async function saveLead(
  supabase: ReturnType<typeof createClient>,
  phone: string,
  message: string
): Promise<void> {
  try {
    await supabase.from("leads").insert({
      name: "Chat Lead",
      phone,
      message: `From chat: ${message.slice(0, 500)}`,
    });
  } catch {
    // Silently fail — don't disrupt the chat
  }
}

async function callAIProvider(
  config: {
    provider: string;
    custom_provider_name: string;
    custom_endpoint: string;
    api_key: string;
  },
  messages: { role: string; content: string }[]
): Promise<string> {
  if (config.provider === "gemini") {
    return callGemini(config.api_key, messages);
  }
  if (config.provider === "anthropic") {
    return callAnthropic(config.api_key, messages);
  }
  if (config.provider === "custom") {
    return callOpenAICompatible(config.api_key, messages, config.custom_endpoint);
  }
  // openai
  return callOpenAICompatible(config.api_key, messages, "https://api.openai.com/v1/chat/completions");
}

async function callGemini(
  apiKey: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const systemMsg = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const contents = chatMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || "";
}

async function callOpenAICompatible(
  apiKey: string,
  messages: { role: string; content: string }[],
  endpoint: string
): Promise<string> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}

async function callAnthropic(
  apiKey: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const systemMsg = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemMsg?.content || "",
      messages: chatMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error: ${res.status}`);
  }

  const data = await res.json();
  return data?.content?.[0]?.text || "";
}
