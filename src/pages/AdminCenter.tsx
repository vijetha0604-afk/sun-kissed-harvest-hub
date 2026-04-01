import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, ShoppingCart, MapPin } from 'lucide-react';
import { Language, t } from '@/lib/i18n';
import { getCropRecords, getPurchases, generateHash, CropRecord, Purchase } from '@/lib/store';

interface AdminProps {
  lang: Language;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString();
}

// Simple map dots positioned on a rectangle "map"
function HarvestMap({ records, lang }: { records: CropRecord[]; lang: Language }) {
  return (
    <div className="relative w-full h-64 rounded-2xl bg-accent/50 overflow-hidden border border-border/30">
      {/* Grid lines */}
      {[...Array(5)].map((_, i) => (
        <div key={`h${i}`} className="absolute left-0 right-0 border-t border-border/20" style={{ top: `${(i + 1) * 16.6}%` }} />
      ))}
      {[...Array(5)].map((_, i) => (
        <div key={`v${i}`} className="absolute top-0 bottom-0 border-l border-border/20" style={{ left: `${(i + 1) * 16.6}%` }} />
      ))}
      <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground/40 font-mono">
        {t('admin.map', lang)}
      </div>
      {records.slice(0, 12).map((r, i) => {
        const x = ((r.lng - 74) / 7) * 100;
        const y = ((r.lat - 12) / 6) * 100;
        return (
          <motion.div key={r.id} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}
            className="absolute" style={{ left: `${Math.max(5, Math.min(90, x))}%`, top: `${Math.max(5, Math.min(90, y))}%` }}>
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-ping-dot" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function AdminCenter({ lang }: AdminProps) {
  const records = getCropRecords();
  const purchases = getPurchases();
  const [ledgerEntries, setLedgerEntries] = useState<string[]>([]);

  useEffect(() => {
    // Generate initial ledger
    const initial = records.slice(0, 5).map((r) => r.txHash);
    setLedgerEntries(initial);

    // Simulate live ledger
    const interval = setInterval(() => {
      setLedgerEntries((prev) => [generateHash(), ...prev.slice(0, 19)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: Users, label: t('admin.farmers', lang), value: records.length },
    { icon: ShoppingCart, label: t('admin.consumers', lang), value: purchases.length },
    { icon: Activity, label: 'Total Value', value: `₹${records.reduce((a, r) => a + parseInt(r.price.replace(/[^\d]/g, '') || '0'), 0).toLocaleString()}` },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">{t('admin.title', lang)}</h1>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <stat.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Map */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
        <HarvestMap records={records} lang={lang} />
      </motion.div>

      {/* Dual Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Farmer Transactions */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-serif font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> {t('admin.farmers', lang)}
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {records.slice(0, 10).map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors">
                <div className="w-8 h-8 rounded-full harvest-gradient flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {r.farmerName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.farmerName} — {r.crop}</p>
                  <p className="text-xs text-muted-foreground">{r.weight} · {r.price}</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground hidden sm:inline">{r.txHash.slice(0, 10)}...</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Consumer Purchases */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-serif font-bold text-foreground mb-4 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-secondary" /> {t('admin.consumers', lang)}
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {purchases.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No purchases yet</p>
            ) : (
              purchases.slice(0, 10).map((p, i) => {
                const crop = records.find((r) => r.id === p.cropRecordId);
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-accent/30">
                    <ShoppingCart className="w-4 h-4 text-secondary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{p.buyerName} → {crop?.crop || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(p.timestamp)}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Blockchain Ledger */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-serif font-bold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> {t('admin.ledger', lang)}
        </h3>
        <div className="bg-foreground/5 rounded-xl p-4 max-h-48 overflow-y-auto ledger-scroll space-y-1">
          {ledgerEntries.map((hash, i) => (
            <motion.div key={`${hash}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 py-1">
              <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-secondary animate-pulse' : 'bg-primary/40'}`} />
              <span className="text-muted-foreground">{hash}</span>
              {i === 0 && <span className="text-xs text-secondary font-medium ml-2">latest</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
