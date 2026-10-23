import React, { useState } from "react";
import { Bot, Send, BookOpen, ExternalLink, ShieldCheck, Sparkles, User as UserIcon } from "lucide-react";
import { api } from "../../services/api";
import { AITutorResponse } from "../../types";
import { TabType } from "../../components/Sidebar";

interface AITutorViewProps {
  onNavigate: (tab: TabType) => void;
}

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ source: string; reference: string }>;
  recommended_lessons?: Array<{ slug: string; title: string }>;
  timestamp: string;
}

const SAMPLE_PROMPTS = [
  "Explain T+1 settlement and Demat mechanics in India",
  "What does the SEBI study say about retail F&O losses?",
  "How do I eliminate look-ahead bias in quantitative backtesting?",
  "How are capital gains taxed in India under Finance Act 2024?",
  "What is the difference between P/E ratio and ROE?"
];

export const AITutorView: React.FC<AITutorViewProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "initial",
      role: "assistant",
      content:
        "Namaste! I am the **TradeWise AI Finance Tutor**. I provide factual explanations of Indian market structures (NSE/BSE), trading terminology, quantitative backtesting principles, and financial ratios.\n\nAll my responses are grounded in verified official publications from **SEBI, NSE, and RBI**. I never predict prices or provide investment calls.",
      citations: [
        { source: "SEBI Investor Education", reference: "SEBI Financial Literacy Handbook" }
      ],
      recommended_lessons: [
        { slug: "indian-market-structure", title: "Indian Stock Market Structure & NSE/BSE Fundamentals" }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [queryInput, setQueryInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const text = queryText || queryInput;
    if (!text.trim() || loading) return;

    const userMsg: MessageItem = {
      id: String(Date.now()),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setQueryInput("");
    setLoading(true);

    try {
      const res: AITutorResponse = await api.queryAITutor(text);
      const assistantMsg: MessageItem = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: res.answer,
        citations: res.citations,
        recommended_lessons: res.recommended_lessons,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: MessageItem = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: "I apologize, but I encountered an error retrieving that educational topic. Please try rephrasing your financial question.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          AI Finance Tutor <span className="text-xs px-2 py-0.5 rounded bg-[#2DD4BF]/15 text-[#2DD4BF] font-mono">SEBI Grounded RAG</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Ask questions about Indian capital market structure, technical indicators, quantitative backtesting pitfalls, and financial statements.
        </p>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap gap-2">
        {SAMPLE_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="text-[11px] px-3 py-1.5 rounded-full bg-[#111C2E] hover:bg-[#162235] border border-[#1E293B] text-slate-300 hover:text-white transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-[#111C2E] border border-[#1E293B] rounded-2xl p-4 lg:p-6 min-h-[440px] max-h-[580px] overflow-y-auto space-y-5">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isUser ? "bg-[#2DD4BF]/20 text-[#2DD4BF]" : "bg-[#162235] text-[#2DD4BF] border border-[#2DD4BF]/30"
              }`}>
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] rounded-2xl p-4 space-y-3 text-xs leading-relaxed ${
                isUser
                  ? "bg-[#2DD4BF] text-[#0B1220] font-medium"
                  : "bg-[#0B1220] border border-[#1E293B] text-slate-200"
              }`}>
                <div
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/### (.*)/g, '<h4 class="font-bold text-sm text-[#2DD4BF] mt-2 mb-1">$1</h4>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
                  }}
                />

                {/* Citations block for Assistant responses */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="border-t border-[#1E293B] pt-2 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Verified Citations:
                    </span>
                    {msg.citations.map((c, idx) => (
                      <div key={idx} className="text-[11px] text-[#2DD4BF] flex items-center gap-1 font-mono">
                        <span>•</span>
                        <span>{c.source} — {c.reference}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommended lesson link */}
                {!isUser && msg.recommended_lessons && msg.recommended_lessons.length > 0 && (
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => onNavigate("academy")}
                      className="px-2.5 py-1 rounded-md bg-[#111C2E] border border-[#1E293B] hover:border-[#2DD4BF] text-[11px] text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <BookOpen className="w-3 h-3 text-[#2DD4BF]" />
                      <span>Learn module: {msg.recommended_lessons[0].title}</span>
                    </button>
                  </div>
                )}

                <div className={`text-[10px] text-right ${isUser ? "text-emerald-950 font-mono" : "text-slate-500 font-mono"}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#162235] text-[#2DD4BF] border border-[#2DD4BF]/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#0B1220] border border-[#1E293B] rounded-2xl p-3 text-xs text-slate-400">
              Searching verified Indian financial knowledge base...
            </div>
          </div>
        )}
      </div>

      {/* Query Input Box */}
      <div className="relative">
        <input
          type="text"
          placeholder="Ask anything about Indian markets, Demat, T+1 settlement, F&O risk, or backtesting..."
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="w-full bg-[#111C2E] border border-[#1E293B] rounded-2xl pl-4 pr-12 py-3.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#2DD4BF] transition-all"
        />
        <button
          onClick={() => handleSend()}
          disabled={!queryInput.trim() || loading}
          className="absolute right-2.5 top-2.5 p-2 bg-[#2DD4BF] disabled:opacity-40 hover:bg-[#14B8A6] text-[#0B1220] rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Guardrail Disclaimer */}
      <div className="p-3 bg-[#111C2E] border border-amber-500/20 rounded-xl text-[11px] text-slate-400 text-center leading-relaxed">
        <strong className="text-amber-400">Educational Guardrail: </strong>
        TradeWise AI Tutor is programmed to never provide specific stock recommendations, buy/sell calls, or guaranteed return promises.
      </div>
    </div>
  );
};
