import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, ShoppingBasket, Lock, CreditCard, Loader2, Eye, EyeOff, Mic, MicOff, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Language, speechLangCode } from '@/lib/i18n';

interface LoginProps {
  lang: Language;
}

const translations: Record<string, Record<Language, string>> = {
  'login.title': { en: 'Welcome to FarmChain', hi: 'FarmChain में आपका स्वागत है', kn: 'FarmChain ಗೆ ಸ್ವಾಗತ' },
  'login.subtitle': { en: 'Choose your role to get started', hi: 'शुरू करने के लिए अपनी भूमिका चुनें', kn: 'ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆರಿಸಿ' },
  'login.farmer': { en: 'Farmer', hi: 'किसान', kn: 'ರೈತ' },
  'login.consumer': { en: 'Consumer', hi: 'उपभोक्ता', kn: 'ಗ್ರಾಹಕ' },
  'login.name': { en: 'Your Name', hi: 'आपका नाम', kn: 'ನಿಮ್ಮ ಹೆಸರು' },
  'login.password': { en: 'Password / PIN', hi: 'पासवर्ड / पिन', kn: 'ಪಾಸ್ವರ್ಡ್ / ಪಿನ್' },
  'login.aadhaar': { en: 'Aadhaar / KCC Number', hi: 'आधार / KCC नंबर', kn: 'ಆಧಾರ್ / KCC ಸಂಖ್ಯೆ' },
  'login.signin': { en: 'Sign In', hi: 'साइन इन', kn: 'ಸೈನ್ ಇನ್' },
  'login.signup': { en: 'Create Account', hi: 'खाता बनाएं', kn: 'ಖಾತೆ ರಚಿಸಿ' },
  'login.toggle_signup': { en: "Don't have an account? Sign up", hi: 'खाता नहीं है? साइन अप करें', kn: 'ಖಾತೆ ಇಲ್ಲವೇ? ಸೈನ್ ಅಪ್ ಮಾಡಿ' },
  'login.toggle_signin': { en: 'Already have an account? Sign in', hi: 'पहले से खाता है? साइन इन करें', kn: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಸೈನ್ ಇನ್ ಮಾಡಿ' },
  'login.error': { en: 'Invalid credentials', hi: 'अमान्य क्रेडेंशियल', kn: 'ಅಮಾನ್ಯ ರುಜುವಾತುಗಳು' },
  'login.check_email': { en: 'Account created! You can now sign in.', hi: 'खाता बनाया गया! अब साइन इन करें।', kn: 'ಖಾತೆ ರಚಿಸಲಾಗಿದೆ! ಈಗ ಸೈನ್ ಇನ್ ಮಾಡಿ.' },
  'login.voice_name_prompt': { en: 'Please say your full name now.', hi: 'कृपया अब अपना पूरा नाम बोलें।', kn: 'ದಯವಿಟ್ಟು ಈಗ ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ಹೇಳಿ.' },
  'login.voice_aadhaar_prompt': { en: 'Please say your 12-digit Aadhaar number now.', hi: 'कृपया अब अपना 12 अंकों का आधार नंबर बोलें।', kn: 'ದಯವಿಟ್ಟು ಈಗ ನಿಮ್ಮ 12 ಅಂಕಿಯ ಆಧಾರ್ ಸಂಖ್ಯೆಯನ್ನು ಹೇಳಿ.' },
  'login.voice_password_prompt': { en: 'Please say your PIN or password now.', hi: 'कृपया अब अपना पिन या पासवर्ड बोलें।', kn: 'ದಯವಿಟ್ಟು ಈಗ ನಿಮ್ಮ ಪಿನ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ಹೇಳಿ.' },
  'login.voice_heard': { en: 'I heard', hi: 'मैंने सुना', kn: 'ನಾನು ಕೇಳಿದೆ' },
  'login.voice_correct': { en: 'Is this correct?', hi: 'क्या यह सही है?', kn: 'ಇದು ಸರಿಯೇ?' },
  'login.name_accepted': { en: 'Name accepted.', hi: 'नाम स्वीकृत।', kn: 'ಹೆಸರು ಸ್ವೀಕರಿಸಲಾಗಿದೆ.' },
  'login.pin_accepted': { en: 'PIN accepted.', hi: 'पिन स्वीकृत।', kn: 'ಪಿನ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ.' },
  'login.listening': { en: 'Listening...', hi: 'सुन रहा है...', kn: 'ಕೇಳುತ್ತಿದೆ...' },
};

function lt(key: string, lang: Language): string {
  return translations[key]?.[lang] || translations[key]?.['en'] || key;
}

function speak(text: string, lang: Language) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = speechLangCode[lang];
  u.rate = 0.9;
  u.volume = 0.4;
  window.speechSynthesis.speak(u);
}

function formatAadhaar(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 12);
  if (d.length <= 4) return d;
  if (d.length <= 8) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8)}`;
}

const wordToDigit: Record<string, string> = {
  zero: '0', one: '1', two: '2', three: '3', four: '4',
  five: '5', six: '6', seven: '7', eight: '8', nine: '9',
  oh: '0', o: '0',
  'शून्य': '0', 'एक': '1', 'दो': '2', 'तीन': '3', 'चार': '4',
  'पांच': '5', 'छह': '6', 'सात': '7', 'आठ': '8', 'नौ': '9',
  'ಸೊನ್ನೆ': '0', 'ಒಂದು': '1', 'ಎರಡು': '2', 'ಮೂರು': '3', 'ನಾಲ್ಕು': '4',
  'ಐದು': '5', 'ಆರು': '6', 'ಏಳು': '7', 'ಎಂಟು': '8', 'ಒಂಬತ್ತು': '9',
};

function SoundWaveVisualizer() {
  return (
    <div className="flex items-center justify-center gap-1 h-8 mt-2">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-primary"
          animate={{ height: [4, 16 + Math.random() * 16, 6, 20 + Math.random() * 12, 4] }}
          transition={{ duration: 0.8 + Math.random() * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.07 }}
        />
      ))}
    </div>
  );
}

type VoiceField = 'name' | 'aadhaar' | 'password';

export default function Login({ lang }: LoginProps) {
  const navigate = useNavigate();
  const [role, setRole] = useState<'farmer' | 'consumer'>('farmer');
  const [isSignUp, setIsSignUp] = useState(false);
  const [farmerName, setFarmerName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [aadhaar, setAadhaar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [listeningField, setListeningField] = useState<VoiceField | null>(null);
  const recognitionRef = useRef<any>(null);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    setListeningField(null);
  }, []);

  const startVoiceInput = useCallback((field: VoiceField) => {
    // Toggle off if already listening
    if (listeningField) {
      stopListening();
      if (listeningField === field) return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    setListeningField(field);

    // Start recognition immediately
    const recognition = new SpeechRecognition();
    recognition.lang = speechLangCode[lang];
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    // Speak prompt in parallel (doesn't block recognition)
    const promptKeys: Record<VoiceField, string> = {
      name: 'login.voice_name_prompt',
      aadhaar: 'login.voice_aadhaar_prompt',
      password: 'login.voice_password_prompt',
    };
    speak(lt(promptKeys[field], lang), lang);

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript: string = result[0].transcript;

      if (field === 'name') {
        setFarmerName(transcript.trim());
        if (result.isFinal) {
          speak(`${lt('login.voice_heard', lang)} ${transcript.trim()}. ${lt('login.name_accepted', lang)}`, lang);
          setListeningField(null);
        }
      } else if (field === 'aadhaar') {
        // Extract digits from speech
        let digits = '';
        const words = transcript.toLowerCase().split(/[\s,.-]+/);
        for (const w of words) {
          if (wordToDigit[w]) digits += wordToDigit[w];
          else {
            const nums = w.replace(/\D/g, '');
            if (nums) digits += nums;
          }
        }
        setAadhaar(formatAadhaar(digits));
        if (result.isFinal) {
          const spokenDigits = digits.split('').join(' ');
          speak(`${lt('login.voice_heard', lang)} ${spokenDigits}. ${lt('login.voice_correct', lang)}`, lang);
          setListeningField(null);
        }
      } else {
        // Password — use raw transcript
        setPassword(transcript.trim());
        if (result.isFinal) {
          speak(lt('login.pin_accepted', lang), lang);
          setListeningField(null);
        }
      }
    };

    recognition.onerror = () => {
      setListeningField(null);
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      setListeningField(null);
      recognitionRef.current = null;
    };

    recognition.start();
  }, [lang, listeningField, stopListening]);

  useEffect(() => {
    return () => { if (recognitionRef.current) try { recognitionRef.current.stop(); } catch (_) {} };
  }, []);

  // Build email from name for auth (name@farmchain.local)
  const buildEmail = (name: string) => {
    const slug = name.trim().toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '') || 'farmer';
    return `${slug}@farmchain.local`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const email = buildEmail(farmerName);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              display_name: farmerName.trim(),
              role,
              aadhaar_kcc: role === 'farmer' ? aadhaar.replace(/-/g, '') : null,
            },
          },
        });
        if (error) throw error;
        setMessage(lt('login.check_email', lang));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(role === 'farmer' ? '/' : '/marketplace');
      }
    } catch (err: any) {
      setError(err.message || lt('login.error', lang));
    } finally {
      setLoading(false);
    }
  };

  const isFarmer = role === 'farmer';

  const MicButton = ({ field, isActive }: { field: VoiceField; isActive: boolean }) => (
    <button
      type="button"
      onClick={() => startVoiceInput(field)}
      className={`p-1.5 rounded-full transition-all ${isActive ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
    >
      {isActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );

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
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> {lt('login.name', lang)}
            </label>
            <div className="relative">
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                required
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring pr-12"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <MicButton field="name" isActive={listeningField === 'name'} />
              </div>
            </div>
          </div>

          {/* Aadhaar — farmer only */}
          {isFarmer && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> {lt('login.aadhaar', lang)}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring pr-12"
                  placeholder="XXXX-XXXX-XXXX"
                  maxLength={14}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <MicButton field="aadhaar" isActive={listeningField === 'aadhaar'} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> {lt('login.password', lang)}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <MicButton field="password" isActive={listeningField === 'password'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Sound wave visualizer */}
          <AnimatePresence>
            {listeningField && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="text-center">
                  <p className="text-xs font-medium text-primary mb-1">{lt('login.listening', lang)}</p>
                  <SoundWaveVisualizer />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
