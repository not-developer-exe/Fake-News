import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info 
} from 'lucide-react';

export default function ResultCard({ result }) {
  if (!result) return null;

  const { 
    verdict = 'Uncertain', 
    score = 0, 
    explanation = 'No details provided.', 
    sources = [] 
  } = result;

  const getVerdictStyles = () => {
    switch (verdict?.toLowerCase()) {
      case 'fake': 
        return { 
          bg: 'bg-red-50 dark:bg-red-900/20', 
          border: 'border-red-500', 
          text: 'text-red-700 dark:text-red-400', 
          icon: <XCircle className="text-red-500" size={32} /> 
        };
      case 'real': 
        return { 
          bg: 'bg-green-50 dark:bg-green-900/20', 
          border: 'border-green-500', 
          text: 'text-green-700 dark:text-green-400', 
          icon: <CheckCircle2 className="text-green-500" size={32} /> 
        };
      case 'disputed': 
        return { 
          bg: 'bg-yellow-50 dark:bg-yellow-900/20', 
          border: 'border-yellow-500', 
          text: 'text-yellow-700 dark:text-yellow-400', 
          icon: <AlertTriangle className="text-yellow-500" size={32} /> 
        };
      default: 
        return { 
          bg: 'bg-gray-50 dark:bg-zinc-800', 
          border: 'border-gray-500', 
          text: 'text-gray-700 dark:text-gray-400', 
          icon: <Info className="text-gray-500" size={32} /> 
        };
    }
  };

  const styles = getVerdictStyles();

  return (
    <div className={`p-6 rounded-2xl border-l-4 shadow-sm bg-white dark:bg-zinc-900 ${styles.border}`}>
      
      {/* Header Section */}
      <div className={`flex items-center gap-4 p-4 rounded-xl mb-6 ${styles.bg}`}>
        {styles.icon}
        <div>
          <span className={`text-xs font-bold uppercase tracking-wider ${styles.text}`}>Verdict</span>
          <h3 className={`text-2xl font-extrabold ${styles.text}`}>{verdict}</h3>
        </div>
        <div className="ml-auto text-right">
          <span className={`text-xs font-bold uppercase tracking-wider ${styles.text}`}>Confidence</span>
          <div className="flex items-baseline justify-end gap-1">
            <h3 className={`text-2xl font-extrabold ${styles.text}`}>{score}%</h3>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
            <Info size={18} className="text-blue-500" /> Analysis
          </h4>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {explanation}
          </p>
        </div>

        {/* Sources */}
        {sources && sources.length > 0 && (
          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm">Sources</h4>
            <ul className="space-y-2">
              {sources.map((source, index) => (
                <li key={index} className="text-sm">
                  <a 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline truncate"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    {source.title || new URL(source.uri).hostname}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}