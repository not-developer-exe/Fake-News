import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Sparkles, TrendingUp, History, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import ResultCard from '../components/ResultCard';
import TrendingCard from '../components/TrendingCard';
import { HistorySkeleton } from '../components/Skeleton';

export default function Dashboard() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false); // For the analysis action
  const [historyLoading, setHistoryLoading] = useState(true); // For the initial data fetch
  const [history, setHistory] = useState([]);
  const [trending, setTrending] = useState([]);

  // Fetch History & Trending on Load
  useEffect(() => {
    const fetchData = async () => {
      setHistoryLoading(true);
      try {
        const [histRes, trendRes] = await Promise.all([
          api.get('/analysis/history'),
          api.get('/analysis/trending')
        ]);
        setHistory(histRes.data);
        setTrending(trendRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        toast.error("Could not load history. Is the server running?");
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult(null);
    
    try {
      const { data } = await api.post('/analysis', { claimText: inputText });
      setResult(data);
      // Add new result to the top of the history list immediately
      setHistory(prev => [data, ...prev]);
      toast.success("Analysis complete!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to analyze claim.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get color for history items
  const getVerdictColor = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'fake': return 'text-red-600 dark:text-red-400';
      case 'real': return 'text-green-600 dark:text-green-400';
      case 'disputed': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 dark:text-gray-100">
      <Navbar />

      <main className="container mx-auto max-w-7xl p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Input & Results (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Input Section */}
            <section className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-lg border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 transition-all hover:shadow-md">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="text-blue-600 dark:text-blue-400" size={20} /> 
                Verify a Claim
              </h2>
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste a news headline, tweet, or article snippet here..."
                className="w-full h-32 p-4 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600"
              />
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={handleAnalyze} 
                  disabled={loading || !inputText.trim()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                  {loading ? 'Analyzing...' : 'Check Facts'}
                </button>
              </div>
            </section>

            {/* Results Section */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.98 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResultCard result={result} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: Trending & History (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Trending Section */}
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-lg border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <TrendingUp size={18} /> Often Asked
              </h3>
              <div className="space-y-3">
                {trending.length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-4">No trending topics yet.</p>
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

            {/* Recent History Section */}
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-lg border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 flex flex-col h-[500px]">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                 <History size={18} /> Your Recent Checks
               </h3>
               
               <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-3">
                  {historyLoading ? (
                    <HistorySkeleton />
                  ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                      <Clock size={40} className="mb-2 opacity-50" />
                      <p className="text-sm">No history yet.</p>
                      <p className="text-xs">Analyze a claim to see it here.</p>
                    </div>
                  ) : (
                    history.map((item) => (
                      <div 
                        key={item._id} 
                        onClick={() => setResult(item)} 
                        className="group p-3 bg-white/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800/30 transition-all duration-200"
                      >
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                          {item.claim}
                        </p>
                        <div className="flex justify-between items-center text-xs">
                          <span className={`font-bold ${getVerdictColor(item.verdict)}`}>
                            {item.verdict?.toUpperCase()}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}