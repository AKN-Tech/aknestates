import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Send, Loader2, Bot } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/lib/settings-context';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const FALLBACK_MESSAGE = 'Filhal masla ho raha hai, WhatsApp pe rabta karein';

export function ChatWidget() {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatbotEnabled, setChatbotEnabled] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [checkedConfig, setCheckedConfig] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check if chatbot is enabled via the public RPC
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.rpc('get_ai_config_public');
        if (error) return;
        const rows = data as { chatbot_enabled: boolean; welcome_message: string }[];
        if (rows && rows.length > 0) {
          if (cancelled) return;
          setChatbotEnabled(rows[0].chatbot_enabled);
          setWelcomeMessage(rows[0].welcome_message);
        }
      } catch {
        // Silently fail — chatbot just won't show
      } finally {
        if (!cancelled) setCheckedConfig(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    // Add welcome message if first open
    if (messages.length === 0 && welcomeMessage) {
      setMessages([{ role: 'assistant', content: welcomeMessage }]);
    }
  }, [messages.length, welcomeMessage]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { messages: newMessages },
      });

      if (error) throw error;

      const reply = (data as { reply?: string; fallback?: boolean })?.reply;
      const isFallback = (data as { fallback?: boolean })?.fallback;

      if (reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      } else {
        throw new Error('No reply');
      }

      // If fallback, also show WhatsApp link
      if (isFallback) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `${FALLBACK_MESSAGE} 👉 https://wa.me/${settings.whatsapp}`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `${FALLBACK_MESSAGE} 👉 https://wa.me/${settings.whatsapp}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Don't render until we've checked config, and only if enabled
  if (!checkedConfig || !chatbotEnabled) return null;

  return (
    <>
      {/* Floating bubble button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-5 right-20 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-forest-600 text-gold-400 shadow-lg shadow-forest-600/30 transition-all hover:scale-110 hover:shadow-xl"
          aria-label="Open chat"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-gold-400" />
          </span>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-scale-in sm:w-80">
          {/* Header */}
          <div className="flex items-center justify-between bg-forest-600 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400 text-forest-700">
                <Bot className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-display text-sm font-bold leading-none text-cream-100">{settings.brand_name}</p>
                <p className="text-[10px] font-medium uppercase tracking-widest text-gold-300">AI Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-cream-100/70 transition-colors hover:bg-cream-100/10 hover:text-cream-100"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-cream-50 p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-br-md bg-forest-600 text-cream-100'
                      : 'rounded-bl-md bg-white text-forest-700 card-shadow'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white px-4 py-3 card-shadow">
                  <Loader2 className="h-4 w-4 animate-spin text-gold-500" />
                  <span className="text-sm text-forest-400">Typing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-cream-200 bg-white p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 rounded-full border border-cream-200 bg-cream-50 px-4 py-2.5 text-sm text-forest-700 placeholder:text-forest-300 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-600 text-gold-400 transition-colors hover:bg-forest-700 disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
