import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Toast Configuration 
          Uses CSS variables defined in index.css for theme-aware colors 
        */}
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--toast-bg)', 
              color: 'var(--toast-text)',
              border: '1px solid var(--toast-border)',
            },
          }} 
        />

        {/* Visual Enhancement: Global Aurora Background Wrapper 
          This applies the animated background to every page in the app.
        */}
        <div className="aurora-bg min-h-screen text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes: Only accessible when logged in */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Dashboard />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;