import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Search,
  Loader2,
  History,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  FileText,
  X, // Modal close button
  Info,
  Eye, // View details icon
  Trash2, // Delete icon
} from "lucide-react";

// --- Main App Component ---
export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme;
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading for analysis
  const [isHistoryLoading, setIsHistoryLoading] = useState(true); // <-- NEW: Loading for initial history fetch
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null); // <-- NEW: Specific error for delete actions
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  // --- Effects ---
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsHistoryLoading(true); // <-- Start loading history
      setError(null); // Clear general errors
      setDeleteError(null); // Clear delete errors
      try {
        const API_BASE_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5001";
        const response = await fetch(`${API_BASE_URL}/api/history`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch history");
        }
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        console.error("History fetch error:", err);
        // Don't set error state here if history is just empty, only for actual fetch errors
        if (
          err.message !== "Failed to fetch history" &&
          err.message !== "No analysis history yet."
        ) {
          setError(
            "Could not load analysis history. Is the backend server running?"
          );
        }
      } finally {
        setIsHistoryLoading(false); 
      }
    };
    fetchHistory();
  }, []);

  // --- Handlers ---
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const handleAnalyzeClick = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    setDeleteError(null); // Clear delete errors on new analysis
    try {
      const response = await fetch(
        "https://fake-news-u7gy.onrender.com/api/check-claim",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ claimText: inputText }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.message || `Error ${response.status}: ${response.statusText}`
        );
      const newSavedAnalysis = data;
      setResult(newSavedAnalysis);
      setHistory((prevHistory) => [newSavedAnalysis, ...prevHistory]);
      setInputText("");
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err.message ||
          "Failed to analyze claim. Please check the backend server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (idToDelete) => {
    setDeleteError(null); // Clear previous delete errors
    // Optimistic UI update (remove immediately)
    const originalHistory = [...history];
    setHistory((prevHistory) =>
      prevHistory.filter((item) => item._id !== idToDelete)
    );
    // Also clear result if it's the one being deleted
    if (result && result._id === idToDelete) {
      setResult(null);
    }
    // Close modal if the deleted item was selected
    if (selectedHistoryItem && selectedHistoryItem._id === idToDelete) {
      setSelectedHistoryItem(null);
    }

    try {
      const response = await fetch(
        `https://fake-news-u7gy.onrender.com/api/history/${idToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to delete item from server"
        );
      }
      // If successful, UI is already updated optimistically
      console.log("Deleted item with id:", idToDelete);
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError(`Failed to delete history item: ${err.message}`);
      // Rollback UI update on error
      setHistory(originalHistory);
      // Re-select item if modal was closed due to optimistic update
      const deletedItem = originalHistory.find(
        (item) => item._id === idToDelete
      );
      if (
        deletedItem &&
        selectedHistoryItem &&
        selectedHistoryItem._id === idToDelete
      ) {
        setSelectedHistoryItem(deletedItem);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
      <Header title="Fact Check AI" theme={theme} onToggleTheme={toggleTheme} />

      <main className="container mx-auto max-w-7xl p-4 md:p-8">
        {/* General Error Display Area */}
        <AnimatePresence>
          {error && (
            <motion.div
              /* ... */ className="mb-6 p-4 bg-red-100 dark:bg-red-900/50 border border-red-500 text-red-700 dark:text-red-300 rounded-lg shadow-md flex items-center gap-3"
            >
              <AlertTriangle className="text-red-500 flex-shrink-0" />
              <div>
                <strong>Error:</strong> {error}
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Delete Error Display Area */}
        <AnimatePresence>
          {deleteError && (
            <motion.div
              /* ... */ className="mb-6 p-4 bg-orange-100 dark:bg-orange-900/50 border border-orange-500 text-orange-700 dark:text-orange-300 rounded-lg shadow-md flex items-center gap-3"
            >
              <AlertTriangle className="text-orange-500 flex-shrink-0" />
              <div>
                <strong>Warning:</strong> {deleteError} (UI might be temporarily
                inconsistent)
              </div>
              <button
                onClick={() => setDeleteError(null)}
                className="ml-auto p-1 rounded-full hover:bg-orange-200 dark:hover:bg-orange-800/50 transition-colors"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <InputSection
              inputText={inputText}
              onInputChange={(e) => setInputText(e.target.value)}
              onAnalyze={handleAnalyzeClick}
              isLoading={isLoading}
            />
            <AnimatePresence>
              {result && <ResultCard result={result} />}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <HistorySection
              history={history}
              isLoading={isHistoryLoading} // <-- Pass loading state
              onItemClick={(item) => setSelectedHistoryItem(item)}
              onDeleteItem={handleDeleteItem} // <-- Pass delete handler
            />
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedHistoryItem && (
          <HistoryModal
            item={selectedHistoryItem}
            onClose={() => setSelectedHistoryItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-Components ---

// Header (No changes needed)
function Header({ title, theme, onToggleTheme }) {
  /* ... */
  return (
    <motion.nav
      /* ... */ className="sticky top-0 z-50 w-full bg-white/70 dark:bg-zinc-800/70 backdrop-blur-lg border-b border-gray-200 dark:border-zinc-700"
    >
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <FileText size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>
          <motion.button
            /* ... */ onClick={onToggleTheme}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              {theme === "light" ? (
                <motion.div key="moon" /* ... */>
                  <Moon size={20} />
                </motion.div>
              ) : (
                <motion.div key="sun" /* ... */>
                  <Sun size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

// InputSection (No changes needed)
function InputSection({ inputText, onInputChange, onAnalyze, isLoading }) {
  /* ... */
  return (
    <motion.div
      /* ... */ className="p-6 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-lg border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg"
    >
      <h2 className="text-lg font-semibold mb-4">Analyze a News Claim</h2>
      <textarea
        /* ... */ value={inputText}
        onChange={onInputChange}
        placeholder="Paste or type the news article, claim, or text here..."
        className="w-full h-48 p-4 bg-gray-100 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        disabled={isLoading}
      />
      <motion.button
        /* ... */ onClick={onAnalyze}
        disabled={isLoading || !inputText.trim()}
        className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-zinc-600 disabled:cursor-not-allowed transition-all duration-300"
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Loader2 size={20} />
            </motion.div>
            Analyzing...
          </>
        ) : (
          <>
            <Search size={20} />
            Analyze Claim
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

// ResultCard (No changes needed)
function ResultCard({ result }) {
  /* ... */
  // Safely access properties, providing defaults if needed
  const {
    verdict = "N/A",
    score = 0,
    explanation = "No explanation provided.",
    fullClaim = "Claim not available.",
    sources = [],
  } = result || {};

  const getVerdictStyles = () => {
    switch (verdict) {
      case "Fake":
        return {
          bg: "bg-red-100 dark:bg-red-900/40",
          border: "border-red-500",
          text: "text-red-700 dark:text-red-300",
          icon: <XCircle className="text-red-500" size={32} />,
        };
      case "Real":
        return {
          bg: "bg-green-100 dark:bg-green-900/40",
          border: "border-green-500",
          text: "text-green-700 dark:text-green-300",
          icon: <CheckCircle2 className="text-green-500" size={32} />,
        };
      case "Disputed":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900/40",
          border: "border-yellow-500",
          text: "text-yellow-700 dark:text-yellow-300",
          icon: <AlertTriangle className="text-yellow-500" size={32} />,
        };
      case "Uncertain": // Style for Uncertain
        return {
          bg: "bg-gray-100 dark:bg-zinc-700/40",
          border: "border-gray-500 dark:border-zinc-600",
          text: "text-gray-700 dark:text-gray-300",
          icon: <Info className="text-gray-500 dark:text-gray-400" size={32} />,
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-zinc-700",
          border: "border-gray-500",
          text: "text-gray-700 dark:text-gray-300",
          icon: <AlertTriangle size={32} />,
        };
    }
  };
  const styles = getVerdictStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`p-6 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-lg border-l-4 rounded-xl shadow-lg ${styles.border}`}
    >
      <h2 className="text-lg font-semibold mb-4">Analysis Result</h2>
      {/* Verdict Header */}
      <div className={`flex items-center gap-4 p-4 rounded-lg ${styles.bg}`}>
        {styles.icon}
        <div>
          <span className={`text-sm font-medium ${styles.text}`}>Verdict</span>
          <h3 className={`text-2xl font-bold ${styles.text}`}>{verdict}</h3>
        </div>
        <div className="ml-auto text-right">
          <span className={`text-sm font-medium ${styles.text}`}>
            Confidence
          </span>
          <h3 className={`text-2xl font-bold ${styles.text}`}>{score}%</h3>
        </div>
      </div>

      {/* Details */}
      <div className="mt-6 space-y-4">
        {/* Explanation */}
        <div>
          <h4 className="font-semibold mb-1 flex items-center gap-1">
            <Info size={16} /> Explanation
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {explanation}
          </p>
        </div>

        {/* Original Claim */}
        {fullClaim && (
          <div>
            <h4 className="font-semibold mb-1">Original Claim</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic border-l-2 border-gray-300 dark:border-zinc-600 pl-3">
              {fullClaim}
            </p>
          </div>
        )}

        {/* Sources */}
        {sources && sources.length > 0 && (
          <div>
            <h4 className="font-semibold mb-1">Sources</h4>
            <ul className="list-disc list-inside space-y-1">
              {sources.map((source, index) => (
                <li key={index} className="text-sm">
                  {/* Ensure source.uri exists before creating link */}
                  {source.uri ? (
                    <a
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {source.title || new URL(source.uri).hostname}{" "}
                      {/* Show title or hostname */}
                    </a>
                  ) : (
                    <span>
                      {source.title || "Source information unavailable"}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// History Section (Updated to handle loading state and pass delete handler)
function HistorySection({ history, isLoading, onItemClick, onDeleteItem }) {
  return (
    <motion.div
      /* ... */ className="p-6 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-lg border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg h-full flex flex-col"
    >
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <History size={20} />
        <h2 className="text-lg font-semibold">Analysis History</h2>
      </div>
      <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {isLoading ? ( // <-- Show loading indicator
          <div className="flex justify-center items-center h-full">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        ) : history.length === 0 ? ( // <-- Show empty message
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
            No recorded history. <br /> Analyze a claim to start building your
            history.
          </p>
        ) : (
          // <-- Show history items
          history.map((item, index) => (
            <HistoryItem
              key={item._id}
              item={item}
              index={index}
              onClick={() => onItemClick(item)} // Renamed prop for clarity
              onDelete={() => onDeleteItem(item._id)} // <-- Pass delete handler with ID
            />
          ))
        )}
      </div>
    </motion.div>
  );
}

// History Item (Updated with Details and Delete buttons)
function HistoryItem({ item, index, onClick, onDelete }) {
  const getVerdictColor = () => {
    /* ... */ switch (item.verdict) {
      case "Fake":
        return "text-red-500 dark:text-red-400";
      case "Real":
        return "text-green-500 dark:text-green-400";
      case "Disputed":
        return "text-yellow-500 dark:text-yellow-400";
      case "Uncertain":
        return "text-gray-500 dark:text-gray-400";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // <-- Prevent modal from opening when delete is clicked
    onDelete(); // Call the delete handler passed from App
  };

  const handleDetailsClick = (e) => {
    e.stopPropagation(); // Optional: good practice if the parent div also has a click handler
    onClick(); // Call the original onClick to open the modal
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      // onClick={onClick} // Remove direct click on the div if buttons handle actions
      className="p-3 bg-gray-100 dark:bg-zinc-700 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors shadow-sm flex items-center gap-2" // Added flex
    >
      {/* Info Section (Takes up most space) */}
      <div className="flex-grow cursor-pointer" onClick={handleDetailsClick}>
        {" "}
        {/* Make info section clickable */}
        <p className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">
          {item.claim}
        </p>
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs font-bold ${getVerdictColor()}`}>
            {item.verdict?.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {item.score}% Conf.
          </span>
        </div>
      </div>

      {/* Buttons Section (Fixed width) */}
      <div className="flex-shrink-0 flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleDetailsClick} // Open modal
          className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
          aria-label="View Details"
          title="View Details"
        >
          <Eye size={16} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleDeleteClick} // Call delete handler
          className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-300 transition-colors"
          aria-label="Delete Item"
          title="Delete Item"
        >
          <Trash2 size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// HistoryModal (No changes needed)
function HistoryModal({ item, onClose }) {
  /* ... */
  if (!item) return null;

  return (
    // Backdrop
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose} // Close modal when clicking backdrop
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      {/* Modal Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" // Constrain height and make flex column
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
          <h2 className="text-lg font-semibold">Analysis Details</h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700"
            aria-label="Close modal"
          >
            <X size={20} />
          </motion.button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
          {/* Reuse ResultCard to display the history item details */}
          <ResultCard result={item} />
        </div>
      </motion.div>
    </motion.div>
  );
}
