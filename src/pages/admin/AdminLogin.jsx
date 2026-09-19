import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      if (import.meta.env.DEV) console.log("[DIAG] signIn attempt for:", email);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.session) {
        if (import.meta.env.DEV) console.error("[DIAG] signIn failure:", authError);
        throw new Error("Invalid email or password.");
      }

      // 2. Verify admin authorization with explicit token injection to prevent race condition
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role, shop_id')
        .eq('user_id', authData.session.user.id)
        .setHeader('Authorization', `Bearer ${authData.session.access_token}`)
        .maybeSingle();

      if (adminError) {
        if (import.meta.env.DEV) {
          console.error('[AUTH DEBUG]', {
            message: adminError?.message,
            code: adminError?.code,
            details: adminError?.details,
            hint: adminError?.hint,
            status: adminError?.status
          });
        }
        throw new Error("Authentication succeeded, but authorization check failed. Please try again.");
      }

      if (!adminData) {
        // User is authenticated but has no admin mapping
        await supabase.auth.signOut();
        throw new Error("You are not authorized to access the admin panel.");
      }

      const validRoles = ['admin', 'superadmin'];
      if (!validRoles.includes(adminData.role)) {
        await supabase.auth.signOut();
        throw new Error("You are not authorized to access the admin panel.");
      }

      // 3. Authorized - App.jsx handles the redirect automatically when useAuth updates,
      // but we manually navigate to ensure smooth UX
      navigate('/admin');

    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 items-center justify-center p-4">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={16} />
        Back to Website
      </Link>

      <div className="card w-full max-w-md p-8 bg-white shadow-lg">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mb-4">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Shoe Store Demo</h1>
          <p className="text-gray-500 mt-2">Sign in to manage your catalogue</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          <div className="form-group mb-0">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group mb-0 relative">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-input pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-2 py-3"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
