import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Sparkles, TrendingUp } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import ResultCard from "../components/ResultCard";
import TrendingCard from "../components/TrendingCard";

export default function Dashboard() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [trending, setTrending] = useState([]);

  // Fetch History & Trending on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, trendRes] = await Promise.all([
          api.get("/analysis/history"),
          api.get("/analysis/trending"),
        ]);
        setHistory(histRes.data);
        setTrending(trendRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    fetchData();
  }, []);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post("/analysis", { claimText: inputText });
      setResult(data);
      setHistory((prev) => [data, ...prev]);
      // Refresh trending occasionally or just leave it until refresh
    } catch (err) {
      console.error(err);
      // toast error handled by interceptor or UI
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 font-sans">
      <Navbar />

      <main className="container mx-auto max-w-7xl p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Main Input & Results (8 columns) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <section className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-lg border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="text-blue-500" size={20} /> Verify a Claim
              </h2>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste a news headline, tweet, or article snippet here..."
                className="w-full h-32 p-4 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500/50 resize-none transition-all"
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !inputText.trim()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Search size={18} />
                  )}
                  {loading ? "Analyzing..." : "Check Facts"}
                </button>
              </div>
            </section>

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ResultCard result={result} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Trending & History (4 columns) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Trending Section (New Requirement) */}
            {/* Trending Section */}
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-lg border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <TrendingUp size={18} /> Often Asked
              </h3>
              <div className="space-y-3">
                {trending.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No trending topics yet.
                  </p>
                ) : (
                  trending.map((item, i) => (
                    <TrendingCard
                      key={i}
                      item={item}
                      onClick={(text) => setInputText(text)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Recent History */}
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-lg border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 flex-grow">
              <h3 className="font-bold text-lg mb-4">Your Recent Checks</h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {history.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setResult(item)}
                    className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <p className="text-sm font-medium line-clamp-2">
                      {item.claim}
                    </p>
                    <div className="flex justify-between mt-2 text-xs">
                      <span
                        className={`font-bold ${
                          item.verdict === "Fake"
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {item.verdict}
                      </span>
                      <span className="text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
