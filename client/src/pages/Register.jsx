import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';
import AuthContext from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await register(username, email, password);
    if (success) navigate('/');
    setIsLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white/30 dark:bg-zinc-900/30 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4"
            >
              <UserPlus className="text-white" size={32} />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Create Account</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Join us to start verifying claims instantly</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
              {!isLoading && <ArrowRight size={20} />}
            </motion.button>
          </form>
        </div>
        
        <div className="p-4 bg-gray-50/50 dark:bg-zinc-900/50 border-t border-white/20 dark:border-zinc-800/50 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account? <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Log in here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}