import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { askAiQuestion } from "../../services/ai";

const STORAGE_KEY = "dpres_ai_insights_chat_history";
const suggestions = ["Flood Safety", "Earthquake Tips", "Fire Escape Plan"];
const predictions = [
  { title: "Flood Preparedness", confidence: 92, summary: "Resource allocation is above benchmark in lowlands." },
  { title: "Earthquake Readiness", confidence: 78, summary: "Shelter communication drills need increased cadence." },
  { title: "Fire Response", confidence: 85, summary: "Evacuation route retention improved 11% this quarter." },
];

const defaultMessages = [
  {
    from: "ai",
    text: "Hello! I can answer questions about safety, disaster preparedness, and current hazard alerts. Ask me about weather, earthquakes, fire safety, drills, or evacuation planning.",
  },
];

const AIInsightsPage = () => {
  const [messages, setMessages] = useState(defaultMessages);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed);
        }
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const appendMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = async () => {
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;

    setErrorMessage("");
    appendMessage({ id: `user-${Date.now()}`, from: "user", text: trimmed });
    appendMessage({ id: `bot-loading-${Date.now()}`, from: "ai", text: "AI is typing..." });
    setQuery("");
    setIsLoading(true);

    try {
      const answer = await askAiQuestion(trimmed);
      setMessages((prev) => {
        const next = [...prev];
        const lastIndex = next.findLastIndex((item) => item.from === "ai" && item.text === "AI is typing...");
        if (lastIndex >= 0) {
          next[lastIndex] = { id: `bot-${Date.now()}`, from: "ai", text: answer };
        }
        return next;
      });
    } catch (error) {
      setErrorMessage("Unable to reach the AI service. Please try again.");
      setMessages((prev) => {
        const next = [...prev];
        const lastIndex = next.findLastIndex((item) => item.from === "ai" && item.text === "AI is typing...");
        if (lastIndex >= 0) {
          next[lastIndex] = {
            id: `bot-error-${Date.now()}`,
            from: "ai",
            text: "Sorry, I couldn't get an answer right now. Please try again.",
          };
        }
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (value) => {
    setQuery(value);
    setErrorMessage("");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.7fr_1.3fr]">
      <section className="space-y-5">
        {predictions.map((item) => (
          <article key={item.title} className="glass-card p-5 md:p-6">
            <div className="mb-2 flex items-center justify-between gap-4">
              <h2 className="section-title">{item.title}</h2>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                {item.confidence}% confidence
              </span>
            </div>
            <p className="text-sm text-slate-300">{item.summary}</p>
          </article>
        ))}

        <article className="glass-card p-5 md:p-6">
          <h2 className="section-kicker mb-3">How this AI assistant works</h2>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>• Uses live hazard feeds when you ask about weather, floods, winds, or earthquakes.</li>
            <li>• Answers student safety questions about drills, evacuation, and preparedness.</li>
            <li>• Pulls information from current alert data and DPRES disaster readiness guidance.</li>
            <li>• Supports real-time safety queries so students get actionable guidance quickly.</li>
          </ul>
        </article>
      </section>

      <aside className="glass-card flex min-h-[700px] flex-col p-5 md:p-6 lg:sticky lg:top-5 lg:self-start">
        <div className="mb-4 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-4 shadow-inner shadow-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">AI Assistant</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-100">Disaster safety chat</h2>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-3.5 w-3.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/20" />
            <span className="text-sm">Online</span>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="mb-4 flex-1 space-y-4 overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-sm shadow-inner shadow-slate-950/30"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`group flex max-w-[88%] items-end gap-3 rounded-3xl border px-4 py-3 shadow-lg transition-all ${
                    msg.from === "user"
                      ? "ml-auto rounded-br-sm border-blue-500/30 bg-blue-600 text-white"
                      : "rounded-bl-sm border-slate-700 bg-slate-800 text-slate-100"
                  }`}
                >
                  {msg.from === "ai" && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-slate-200">
                      🤖
                    </div>
                  )}
                  <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                  {msg.from === "user" && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white">
                      👤
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {suggestions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSuggestion(option)}
              className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <textarea
            aria-label="Type your safety question"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="Ask about flood safety, earthquake tips, fire escape plans..."
            className="min-h-[92px] resize-none rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            disabled={isLoading}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading}
              className="inline-flex h-12 items-center justify-center rounded-3xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isLoading ? "Sending..." : "Send Message"}
            </button>
            {errorMessage && <p className="text-sm text-rose-400">{errorMessage}</p>}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AIInsightsPage;
