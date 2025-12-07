import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, FileText } from 'lucide-react';
import AuthContext from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <FileText size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white">FactCheck AI</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                Welcome, {user.username}
              </span>
              <button 
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2">
               <Link to="/login" className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg">Login</Link>
               <Link to="/register" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}