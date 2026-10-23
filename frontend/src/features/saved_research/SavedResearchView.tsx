import React, { useState } from "react";
import { Bookmark, Plus, Tag, Download, Trash2 } from "lucide-react";

interface Note {
  id: string;
  title: string;
  symbol?: string;
  content: string;
  tags: string[];
  date: string;
}

export const SavedResearchView: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "NIFTY 50 200-Day SMA Golden Cross Hypothesis",
      symbol: "NIFTY50",
      content:
        "Investigating whether a 20-day crossing above a 50-day moving average generates reliable risk-adjusted excess returns on NIFTY after accounting for standard Indian STT (0.1%) and discount brokerage. Must test on 2020-2024 sample.",
      tags: ["#Quantitative", "#NIFTY50", "#TrendFollowing"],
      date: "2024-10-15"
    },
    {
      id: "2",
      title: "Personal Trading Journal: Position Sizing Discipline Review",
      symbol: "RELIANCE",
      content:
        "Reminded myself: never commit >1.5% capital to a single trade. In high volatility regimes, reduce share count rather than widening stop loss to prevent account drawdowns.",
      tags: ["#RiskManagement", "#TradingJournal", "#Discipline"],
      date: "2024-10-20"
    }
  ]);

  const [title, setTitle] = useState("");
  const [symbol, setSymbol] = useState("NIFTY50");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newNote: Note = {
      id: String(Date.now()),
      title,
      symbol,
      content,
      tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean),
      date: new Date().toISOString().split("T")[0]
    };

    setNotes([newNote, ...notes]);
    setTitle("");
    setContent("");
    setTagsInput("");
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "tradewise_research_notes.json");
    dlAnchor.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Saved Research & Trading Journal <span className="text-xs px-2 py-0.5 rounded bg-[#2DD4BF]/15 text-[#2DD4BF] font-mono">Private</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Document strategy hypotheses, record trade rationale, and review risk discipline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-lg bg-[#111C2E] border border-[#1E293B] text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Notes
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3.5 py-1.5 rounded-lg bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#0B1220] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" /> New Hypothesis
          </button>
        </div>
      </div>

      {/* New Note Form */}
      {isAdding && (
        <form onSubmit={handleAddNote} className="bg-[#111C2E] border border-[#2DD4BF]/40 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Record Research Note</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
              <input
                type="text"
                placeholder="e.g. Mean Reversion Behavior around Budget Week"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Related Security</label>
              <input
                type="text"
                placeholder="e.g. NIFTY50, BANKNIFTY, RELIANCE"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Hypothesis & Analysis</label>
            <textarea
              rows={3}
              placeholder="Detail your systematic observation, backtest ideas, or trade psychology review..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              placeholder="#Quant, #Breakout, #Nifty"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg bg-[#0B1220] text-slate-400 text-xs hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#2DD4BF] text-[#0B1220] font-bold text-xs"
            >
              Save Note
            </button>
          </div>
        </form>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-[#111C2E] border border-[#1E293B] rounded-xl p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-[#2DD4BF] font-bold">
                  {note.symbol || "GENERAL"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{note.date}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{note.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{note.content}</p>
            </div>

            <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {note.tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] font-mono text-slate-400 bg-[#0B1220] px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleDelete(note.id)}
                className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
