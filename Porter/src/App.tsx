import { useState, useMemo } from "react";
import { PorterStemmer } from "./porterStemmer";
import { Search, FileText, List, Play, Copy, Check, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const stemmer = new PorterStemmer();

export default function App() {
  const [input, setInput] = useState("running happiness relational adjustment connections");
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const words = input.split(/[\s,]+/).filter(w => w.length > 0);
    return words.map(word => ({
      original: word,
      stemmed: stemmer.stem(word)
    }));
  }, [input]);

  const handleCopy = () => {
    const text = results.map(r => `${r.original} → ${r.stemmed}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] font-sans selection:bg-[#F27D26] selection:text-white">
      {/* Header */}
      <header className="border-b border-[#262626] bg-[#0F0F0F]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#F27D26] rounded-lg flex items-center justify-center">
              <Terminal className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase italic font-serif">
              Porter Stemmer <span className="text-[#F27D26]">Pro</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-[#888]">
            <span className="hidden sm:inline uppercase tracking-widest">v1.0.0 // Production Ready</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Input */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-[#F27D26]" />
                <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#888]">Input Text</h2>
              </div>
              <div className="relative group">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter words or sentences to stem..."
                  className="w-full h-64 bg-[#141414] border border-[#262626] rounded-xl p-6 font-mono text-sm focus:outline-none focus:border-[#F27D26] transition-all resize-none placeholder:text-[#444]"
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button 
                    onClick={() => setInput("")}
                    className="px-3 py-1.5 bg-[#262626] hover:bg-[#333] text-[10px] uppercase font-bold tracking-wider rounded-md transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </section>

            <section className="p-6 bg-[#141414] border border-[#262626] rounded-xl space-y-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#F27D26]" />
                <h3 className="text-sm font-bold text-white">Algorithm Details</h3>
              </div>
              <p className="text-xs text-[#888] leading-relaxed">
                The Porter stemming algorithm is a process for removing the commoner morphological and inflexional endings from words in English. Its main use is as part of a term normalization process that is usually done when setting up Information Retrieval systems.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-[#555] font-bold">Steps</span>
                  <p className="text-xs font-mono">1a to 5</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-[#555] font-bold">Language</span>
                  <p className="text-xs font-mono">English</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Output */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-[#F27D26]" />
                  <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#888]">Stemmed Output</h2>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#141414] border border-[#262626] hover:border-[#F27D26] rounded-md transition-all group"
                >
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-[#888] group-hover:text-[#F27D26]" />}
                  <span className="text-[10px] uppercase font-bold tracking-wider">{copied ? "Copied" : "Copy All"}</span>
                </button>
              </div>

              <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden">
                <div className="grid grid-cols-2 border-b border-[#262626] bg-[#1A1A1A] px-6 py-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#555]">Original</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#555]">Stemmed</span>
                </div>
                <div className="h-[480px] overflow-y-auto custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {results.length > 0 ? (
                      results.map((res, idx) => (
                        <motion.div
                          key={`${res.original}-${idx}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.5) }}
                          className="grid grid-cols-2 px-6 py-4 border-b border-[#262626]/50 hover:bg-[#1A1A1A] transition-colors group"
                        >
                          <span className="font-mono text-sm text-[#888] group-hover:text-[#AAA] transition-colors">{res.original}</span>
                          <div className="flex items-center gap-3">
                            <Play className="w-2 h-2 text-[#F27D26] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="font-mono text-sm text-[#F27D26] font-bold">{res.stemmed}</span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-[#444] space-y-4">
                        <Terminal className="w-12 h-12 opacity-20" />
                        <p className="text-sm font-mono italic">Waiting for input...</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #262626;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
}
