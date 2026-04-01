import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBasket, Volume2, ArrowLeft, CheckCircle2, Truck, Store, Leaf, X } from 'lucide-react';
import { Language, t } from '@/lib/i18n';
import { getCropRecords, addPurchase, CropRecord } from '@/lib/store';

interface MarketplaceProps {
  lang: Language;
}

const cropEmojis: Record<string, string> = {
  Rice: '🌾', Wheat: '🌾', Sugarcane: '🎋', Turmeric: '🟡', Cotton: '☁️',
  Mango: '🥭', Tomato: '🍅', Onion: '🧅', Potato: '🥔', Corn: '🌽',
};

function TimelineStep({ icon: Icon, label, done }: { icon: any; label: string; done: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
        className={`w-10 h-10 rounded-full flex items-center justify-center ${done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
        <Icon className="w-5 h-5" />
      </motion.div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

export default function Marketplace({ lang }: MarketplaceProps) {
  const records = getCropRecords();
  const [selectedCrop, setSelectedCrop] = useState<CropRecord | null>(null);
  const [purchased, setPurchased] = useState<string | null>(null);

  const handleBuy = (record: CropRecord) => {
    addPurchase(record.id, 'Consumer');
    setPurchased(record.id);
    setTimeout(() => setPurchased(null), 3000);
  };

  const handleHearVoice = (record: CropRecord) => {
    if (!('speechSynthesis' in window)) return;
    const text = record.voiceText || `${record.farmerName} harvested ${record.crop}`;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';
    speechSynthesis.speak(u);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">{t('market.title', lang)}</h1>
        <p className="text-muted-foreground text-sm">{t('market.subtitle', lang)}</p>
      </motion.div>

      {/* Crop Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {records.map((record, i) => (
          <motion.div key={record.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-5 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 group"
            onClick={() => setSelectedCrop(record)}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{cropEmojis[record.crop] || '🌱'}</span>
              <span className="text-xs font-mono text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {record.txHash.slice(0, 8)}...
              </span>
            </div>
            <h3 className="font-serif font-bold text-lg text-foreground mb-1">{record.crop}</h3>
            <p className="text-sm text-muted-foreground mb-3">{record.farmerName}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{record.weight}</span>
              <span className="font-semibold text-sm text-primary">{record.price}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Story Modal */}
      <AnimatePresence>
        {selectedCrop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedCrop(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass-card rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => setSelectedCrop(null)} className="p-2 rounded-full hover:bg-muted">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setSelectedCrop(null)} className="p-2 rounded-full hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mb-6">
                <span className="text-5xl mb-3 block">{cropEmojis[selectedCrop.crop] || '🌱'}</span>
                <h2 className="font-serif text-2xl font-bold text-foreground">{selectedCrop.crop}</h2>
                <p className="text-muted-foreground text-sm">by {selectedCrop.farmerName}</p>
              </div>

              <div className="glass-card rounded-2xl p-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{t('farmer.weight', lang)}</span>
                  <span className="font-semibold text-foreground">{selectedCrop.weight}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{t('farmer.price', lang)}</span>
                  <span className="font-semibold text-primary">{selectedCrop.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TX</span>
                  <span className="font-mono text-xs text-muted-foreground">{selectedCrop.txHash.slice(0, 18)}...</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">{t('market.timeline', lang)}</h3>
                <div className="flex items-center justify-between">
                  <TimelineStep icon={Leaf} label={t('market.harvested', lang)} done={true} />
                  <div className="flex-1 h-0.5 bg-primary/30 mx-2" />
                  <TimelineStep icon={CheckCircle2} label={t('market.verified', lang)} done={true} />
                  <div className="flex-1 h-0.5 bg-primary/30 mx-2" />
                  <TimelineStep icon={Store} label={t('market.inStore', lang)} done={true} />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => handleHearVoice(selectedCrop)}
                  className="river-stone-btn flex-1 bg-muted text-foreground flex items-center justify-center gap-2 text-sm">
                  <Volume2 className="w-4 h-4" /> {t('market.hearVoice', lang)}
                </button>
                <button onClick={() => handleBuy(selectedCrop)}
                  className={`river-stone-btn flex-1 flex items-center justify-center gap-2 text-sm ${purchased === selectedCrop.id ? 'bg-primary/20 text-primary' : 'bg-primary text-primary-foreground'}`}>
                  {purchased === selectedCrop.id ? (
                    <><CheckCircle2 className="w-4 h-4" /> {t('market.purchased', lang)}</>
                  ) : (
                    <><ShoppingBasket className="w-4 h-4" /> {t('market.buy', lang)}</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
