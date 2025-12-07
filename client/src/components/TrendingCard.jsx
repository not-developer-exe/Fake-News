import { TrendingUp, ArrowUpRight } from 'lucide-react';

export default function TrendingCard({ item, onClick }) {
  return (
    <div 
      onClick={() => onClick(item._id)}
      className="group relative p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl cursor-pointer hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900/50 transition-all duration-200"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              Trending
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {item.count} searches
            </span>
          </div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {item._id}
          </p>
        </div>
        <ArrowUpRight 
          size={16} 
          className="text-gray-300 dark:text-gray-600 group-hover:text-orange-500 transition-colors" 
        />
      </div>
    </div>
  );
}