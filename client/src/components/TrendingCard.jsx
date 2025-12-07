import { TrendingUp, ArrowUpRight } from 'lucide-react';

export default function TrendingCard({ item, onClick }) {
  return (
    <div 
      onClick={() => onClick(item._id)}
      className="group relative p-4 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md border border-gray-200 dark:border-zinc-700/50 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-zinc-800 hover:scale-[1.02] hover:shadow-md transition-all duration-300"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          
          {/* Tag & Count Row */}
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-orange-100/80 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
              <TrendingUp size={10} /> Trending
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {item.count} searches
            </span>
          </div>

          {/* Claim Text */}
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
            {item._id}
          </p>
        </div>

        {/* Action Icon */}
        <div className="bg-gray-100 dark:bg-zinc-700/50 p-1.5 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
          <ArrowUpRight 
            size={16} 
            className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" 
          />
        </div>
      </div>
    </div>
  );
}