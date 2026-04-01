import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Sprout, AlertCircle, Check, Loader2, RotateCcw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Language, t, speechLangCode } from '@/lib/i18n';
import { parseCropInput, addCropRecord, CropRecord } from '@/lib/store';

interface FarmerPortalProps {
  lang: Language;
}

type Stage = 'idle' | 'listening' | 'parsed' | 'minting' | 'done';

function speak(text: string, lang: Language) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = speechLangCode[lang];
  speechSynthesis.speak(u);
}

export default function FarmerPortal({ lang }: FarmerPortalProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [transcript, setTranscript] = useState('');
  const [parsed, setParsed] = useState<{ crop?: string; weight?: string; price?: string }>({});
  const [missing, setMissing] = useState<string[]>([]);
  const [mintedRecord, setMintedRecord] = useState<CropRecord | null>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = speechLangCode[lang];
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      processTranscript(text);
    };

    recognition.onerror = () => setStage('idle');
    recognition.onend = () => {
      if (stage === 'listening') setStage('idle');
    };

    recognitionRef.current = recognition;
    recognition.start();
    setStage('listening');
    setMissing([]);
  }, [lang, stage]);

  const processTranscript = (text: string) => {
    const result = parseCropInput(text);
    setParsed(result);

    const missingFields: string[] = [];
    if (!result.crop) missingFields.push('crop');
    if (!result.weight) missingFields.push('weight');
    if (!result.price) missingFields.push('price');

    setMissing(missingFields);
    setStage('parsed');

    if (missingFields.length > 0) {
      const firstMissing = missingFields[0];
      const msg = t(`missing.${firstMissing}`, lang);
      speak(msg, lang);
    }
  };

  const handleMint = async () => {
    if (!parsed.crop || !parsed.weight || !parsed.price) return;
    setStage('minting');
    // Simulate blockchain minting
    await new Promise((r) => setTimeout(r, 2500));
    const record = addCropRecord({
      farmerName: 'You',
      crop: parsed.crop,
      weight: parsed.weight,
      price: parsed.price,
      voiceText: transcript,
    });
    setMintedRecord(record);
    setStage('done');
  };

  const reset = () => {
    setStage('idle');
    setTranscript('');
    setParsed({});
    setMissing([]);
    setMintedRecord(null);
  };

  const allPresent = parsed.crop && parsed.weight && parsed.price;

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">{t('farmer.title', lang)}</h1>
        <p className="text-muted-foreground text-sm">{t('farmer.subtitle', lang)}</p>
      </motion.div>

      {/* Sprout Button */}
      <AnimatePresence mode="wait">
        {(stage === 'idle' || stage === 'listening') && (
          <motion.div key="sprout" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center gap-6">
            <div className="relative">
              {stage === 'listening' && (
                <motion.div className="absolute inset-0 rounded-full bg-primary/30" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              )}
              <button onClick={stage === 'idle' ? startListening : () => { recognitionRef.current?.stop(); setStage('idle'); }}
                className="sprout-btn relative z-10 transition-all hover:scale-105 active:scale-95">
                {stage === 'listening' ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </button>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {stage === 'listening' ? t('farmer.listening', lang) : t('farmer.speak', lang)}
            </p>
            <p className="text-xs text-muted-foreground/70 max-w-xs text-center">{t('farmer.example', lang)}</p>
          </motion.div>
        )}

        {/* Parsed Results */}
        {stage === 'parsed' && (
          <motion.div key="parsed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {transcript && (
              <div className="glass-card rounded-2xl p-4 text-center">
                <p className="text-sm text-muted-foreground italic">"{transcript}"</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'crop', label: t('farmer.crop', lang), value: parsed.crop },
                { key: 'weight', label: t('farmer.weight', lang), value: parsed.weight },
                { key: 'price', label: t('farmer.price', lang), value: parsed.price },
              ].map((field) => (
                <div key={field.key}
                  className={`glass-card rounded-2xl p-4 text-center transition-all ${field.value ? 'border-primary/30 bg-accent/50' : 'border-destructive/40 bg-destructive/5'}`}>
                  <p className="text-xs text-muted-foreground mb-1">{field.label}</p>
                  <p className={`font-semibold text-sm ${field.value ? 'text-foreground' : 'text-destructive'}`}>
                    {field.value || '—'}
                  </p>
                  {field.value ? <Check className="w-4 h-4 text-primary mx-auto mt-1" /> : <AlertCircle className="w-4 h-4 text-destructive mx-auto mt-1" />}
                </div>
              ))}
            </div>

            {/* Missing info alerts */}
            {missing.length > 0 && (
              <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  {missing.map((m) => (
                    <p key={m} className="text-sm text-destructive font-medium">{t(`missing.${m}`, lang)}</p>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="flex gap-3">
              <button onClick={startListening} className="river-stone-btn flex-1 bg-muted text-foreground flex items-center justify-center gap-2">
                <Mic className="w-4 h-4" /> {t('farmer.speak', lang)}
              </button>
              {allPresent && (
                <motion.button initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={handleMint}
                  className="river-stone-btn flex-1 bg-primary text-primary-foreground flex items-center justify-center gap-2">
                  <Sprout className="w-4 h-4" /> {t('farmer.mint', lang)}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Minting Animation */}
        {stage === 'minting' && (
          <motion.div key="minting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 py-12">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 rounded-full harvest-gradient flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <p className="font-serif text-lg font-semibold text-foreground">{t('farmer.minting', lang)}</p>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-primary"
                  animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Success + QR */}
        {stage === 'done' && mintedRecord && (
          <motion.div key="done" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <h2 className="font-serif text-xl font-bold text-foreground">{t('farmer.success', lang)}</h2>

            <div className="glass-card rounded-2xl p-6 text-center space-y-3">
              <p className="text-xs text-muted-foreground font-mono break-all">{mintedRecord.txHash}</p>
              <div className="flex justify-center">
                <QRCodeSVG value={`https://polygonscan.com/tx/${mintedRecord.txHash}`} size={160}
                  fgColor="hsl(88, 72%, 27%)" bgColor="transparent" />
              </div>
              <div className="flex gap-4 justify-center text-sm">
                <span className="text-muted-foreground">{mintedRecord.crop}</span>
                <span className="text-muted-foreground">{mintedRecord.weight}</span>
                <span className="font-semibold text-foreground">{mintedRecord.price}</span>
              </div>
            </div>

            <button onClick={reset} className="river-stone-btn bg-muted text-foreground flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> {t('farmer.newRecord', lang)}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
