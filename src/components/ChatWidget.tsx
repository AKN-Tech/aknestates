import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Send, Loader2, Bot } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/lib/settings-context';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Brand colors for the chatbot — fixed, not affected by theme customizer
const BRAND = {
  darkGreen: '#0B0F0E',
  amber: '#FAC775',
  teal: '#1D9E75',
};

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

  // Check if chatbot is enabled via the public RPC — fail silently if off or no key
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
    if (messages.length === 0 && welcomeMessage) {
      setMessages([{ role: 'assistant', content: welcomeMessage }]);
    }
  }, [messages.length, welcomeMessage]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Phase B1: simulate a typing delay, then show a placeholder response.
    // This will be replaced with the real AI edge function call in the next phase.
    setTimeout(() => {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'AI responses are coming soon! This is a placeholder reply while we wire up the AI connection.',
        },
      ]);
    }, 1500);
  };

  // Don't render until we've checked config, and only if enabled
  if (!checkedConfig || !chatbotEnabled) return null;

  return (
    <>
      {/* Floating bubble button — positioned above the WhatsApp button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-28 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl"
          style={{ backgroundColor: BRAND.darkGreen, color: BRAND.amber }}
          aria-label="Ask AKN AI"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: BRAND.amber }} />
            <span className="relative inline-flex h-4 w-4 rounded-full" style={{ backgroundColor: BRAND.amber }} />
          </span>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-12 right-5 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-scale-in sm:w-80">
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ backgroundColor: BRAND.darkGreen }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: BRAND.amber, color: BRAND.darkGreen }}
              >
                <Bot className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-display text-sm font-bold leading-none" style={{ color: BRAND.amber }}>
                  Ask AKN AI
                </p>
                <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: BRAND.teal }}>
                  AI Assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
              style={{ color: BRAND.amber }}
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
                      ? 'rounded-br-md text-white'
                      : 'rounded-bl-md bg-white text-forest-700 card-shadow'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: BRAND.darkGreen } : undefined}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white px-4 py-3 card-shadow">
                  <Loader2 className="h-4 w-4 animate-spin" style={{ color: BRAND.teal }} />
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
              className="flex-1 rounded-full border border-cream-200 bg-cream-50 px-4 py-2.5 text-sm text-forest-700 placeholder:text-forest-300 focus:outline-none focus:ring-1"
              style={{ caretColor: BRAND.teal }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all disabled:opacity-50"
              style={{ backgroundColor: BRAND.darkGreen, color: BRAND.amber }}
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
