import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, ShoppingBasket, Mail, Lock, CreditCard, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Language, t } from '@/lib/i18n';

interface LoginProps {
  lang: Language;
}

const translations: Record<string, Record<Language, string>> = {
  'login.title': { en: 'Welcome to FarmChain', hi: 'FarmChain में आपका स्वागत है', kn: 'FarmChain ಗೆ ಸ್ವಾಗತ' },
  'login.subtitle': { en: 'Choose your role to get started', hi: 'शुरू करने के लिए अपनी भूमिका चुनें', kn: 'ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆರಿಸಿ' },
  'login.farmer': { en: 'Farmer', hi: 'किसान', kn: 'ರೈತ' },
  'login.consumer': { en: 'Consumer', hi: 'उपभोक्ता', kn: 'ಗ್ರಾಹಕ' },
  'login.email': { en: 'Email', hi: 'ईमेल', kn: 'ಇಮೇಲ್' },
  'login.password': { en: 'Password', hi: 'पासवर्ड', kn: 'ಪಾಸ್ವರ್ಡ್' },
  'login.aadhaar': { en: 'Aadhaar / KCC Number (optional)', hi: 'आधार / KCC नंबर (वैकल्पिक)', kn: 'ಆಧಾರ್ / KCC ಸಂಖ್ಯೆ (ಐಚ್ಛಿಕ)' },
  'login.signin': { en: 'Sign In', hi: 'साइन इन', kn: 'ಸೈನ್ ಇನ್' },
  'login.signup': { en: 'Create Account', hi: 'खाता बनाएं', kn: 'ಖಾತೆ ರಚಿಸಿ' },
  'login.toggle_signup': { en: "Don't have an account? Sign up", hi: 'खाता नहीं है? साइन अप करें', kn: 'ಖಾತೆ ಇಲ್ಲವೇ? ಸೈನ್ ಅಪ್ ಮಾಡಿ' },
  'login.toggle_signin': { en: 'Already have an account? Sign in', hi: 'पहले से खाता है? साइन इन करें', kn: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಸೈನ್ ಇನ್ ಮಾಡಿ' },
  'login.error': { en: 'Invalid credentials', hi: 'अमान्य क्रेडेंशियल', kn: 'ಅಮಾನ್ಯ ರುಜುವಾತುಗಳು' },
  'login.check_email': { en: 'Check your email to confirm!', hi: 'पुष्टि करने के लिए अपना ईमेल जांचें!', kn: 'ದೃಢೀಕರಿಸಲು ನಿಮ್ಮ ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ!' },
};

function lt(key: string, lang: Language): string {
  return translations[key]?.[lang] || translations[key]?.['en'] || key;
}

export default function Login({ lang }: LoginProps) {
  const navigate = useNavigate();
  const [role, setRole] = useState<'farmer' | 'consumer'>('farmer');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [aadhaar, setAadhaar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              display_name: email.split('@')[0],
              role,
              aadhaar_kcc: role === 'farmer' ? aadhaar : null,
            },
          },
        });
        if (error) throw error;
        setMessage(lt('login.check_email', lang));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Profile trigger sets role; redirect based on selected role
        navigate(role === 'farmer' ? '/' : '/marketplace');
      }
    } catch (err: any) {
      setError(err.message || lt('login.error', lang));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full harvest-gradient flex items-center justify-center mx-auto mb-4">
            <Sprout className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground">{lt('login.title', lang)}</h1>
          <p className="text-muted-foreground text-sm mt-1">{lt('login.subtitle', lang)}</p>
        </div>

        {/* Role Toggle */}
        <div className="glass-card rounded-2xl p-1.5 flex mb-6">
          {(['farmer', 'consumer'] as const).map((r) => (
            <button key={r} onClick={() => setRole(r)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${role === r ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {r === 'farmer' ? <Sprout className="w-4 h-4" /> : <ShoppingBasket className="w-4 h-4" />}
              {lt(`login.${r}`, lang)}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> {lt('login.email', lang)}
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> {lt('login.password', lang)}
            </label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {role === 'farmer' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> {lt('login.aadhaar', lang)}
              </label>
              <input type="text" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="XXXX-XXXX-XXXX" />
            </motion.div>
          )}

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-sm text-center">{error}</motion.p>
          )}
          {message && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-primary text-sm text-center">{message}</motion.p>
          )}

          <button type="submit" disabled={loading}
            className="river-stone-btn w-full bg-primary text-primary-foreground flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSignUp ? lt('login.signup', lang) : lt('login.signin', lang)}
          </button>

          <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
            className="text-xs text-muted-foreground hover:text-foreground w-full text-center transition-colors">
            {isSignUp ? lt('login.toggle_signin', lang) : lt('login.toggle_signup', lang)}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
