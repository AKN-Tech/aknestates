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

const SYSTEM_PROMPT = `You are AKN AI, a helpful real estate assistant for AKN Estates in Pakistan. Answer in the same language and style the user writes in — Roman Urdu or English, matching their tone. Be friendly, concise, and helpful about pricing, locations, property types, and the installment calculator on the site. Keep responses short and conversational, like a helpful real estate agent texting a client.

You will be given a list of current property listings available on the site. When a visitor asks about properties, use ONLY these listings to answer — mention the actual title, price, location, size, and bedrooms from the listing data. Format prices in PKR (e.g. "PKR 2.5 crore" or "PKR 85 lakh"). For rent listings, mention monthly rent.

If no listings match the visitor's criteria, say so honestly and suggest they check the Buy or Rent pages for the latest updates. Never make up properties or prices that aren't in the provided listings.`;

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

    // ── Fetch current listings for context ───────────────────
    const { data: listings } = await supabase
      .from("listings")
      .select("title, price, property_type, city, area, size_marla, size_kanal, bedrooms, bathrooms, furnished, purpose, year_built, condition")
      .order("created_at", { ascending: false })
      .limit(50);

    const listingsContext = formatListingsForContext(listings ?? []);

    const fullSystemPrompt = `${SYSTEM_PROMPT}

Here are the current property listings available on AKN Estates. Use this data to answer questions about available properties:

${listingsContext}

When mentioning prices, format them in PKR (e.g. "PKR 1.5 crore" or "PKR 85 lakh"). For rent, mention monthly rent.`;

    const aiMessages = [
      { role: "system", content: fullSystemPrompt },
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

function formatListingsForContext(
  listings: Record<string, unknown>[]
): string {
  if (listings.length === 0) {
    return "No listings are currently available.";
  }

  return listings
    .map((l, i) => {
      const purpose = l.purpose === "rent" ? "For Rent" : "For Sale";
      const price = formatPKR(Number(l.price));
      const beds = l.bedrooms ? `${l.bedrooms} bed` : "Studio";
      const baths = l.bathrooms ? `${l.bathrooms} bath` : "";
      const size = l.size_marla ? `${l.size_marla} marla` : l.size_kanal ? `${l.size_kanal} kanal` : "";
      const furnished = l.furnished ? ", furnished" : "";
      return `${i + 1}. ${l.title} — ${purpose}, ${price}, ${l.property_type} in ${l.area}, ${l.city}. ${beds}${baths ? ", " + baths : ""}${size ? ", " + size : ""}${furnished}. ${l.condition ? l.condition + " condition." : ""} ${l.year_built ? "Built " + l.year_built + "." : ""}`;
    })
    .join("\n");
}

function formatPKR(amount: number): string {
  if (amount >= 10000000) {
    return `PKR ${(amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 2)} crore`;
  }
  if (amount >= 100000) {
    return `PKR ${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 2)} lakh`;
  }
  return `PKR ${amount.toLocaleString()}`;
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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
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
