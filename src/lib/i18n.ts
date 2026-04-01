export type Language = 'en' | 'hi' | 'kn';

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.farmer': { en: 'Farmer Portal', hi: 'किसान पोर्टल', kn: 'ರೈತ ಪೋರ್ಟಲ್' },
  'nav.marketplace': { en: 'Marketplace', hi: 'बाजार', kn: 'ಮಾರುಕಟ್ಟೆ' },
  'nav.admin': { en: 'Admin', hi: 'प्रशासन', kn: 'ನಿರ್ವಾಹಕ' },
  
  // Farmer Portal
  'farmer.title': { en: 'Record Your Harvest', hi: 'अपनी फसल दर्ज करें', kn: 'ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ದಾಖಲಿಸಿ' },
  'farmer.subtitle': { en: 'Tap the sprout and speak your crop details', hi: 'स्प्राउट पर टैप करें और अपनी फसल का विवरण बोलें', kn: 'ಸ್ಪ್ರೌಟ್ ಟ್ಯಾಪ್ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಬೆಳೆ ವಿವರಗಳನ್ನು ಹೇಳಿ' },
  'farmer.speak': { en: 'Tap to Speak', hi: 'बोलने के लिए टैप करें', kn: 'ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ' },
  'farmer.listening': { en: 'Listening...', hi: 'सुन रहा है...', kn: 'ಕೇಳುತ್ತಿದೆ...' },
  'farmer.crop': { en: 'Crop', hi: 'फसल', kn: 'ಬೆಳೆ' },
  'farmer.weight': { en: 'Weight', hi: 'वजन', kn: 'ತೂಕ' },
  'farmer.price': { en: 'Price', hi: 'कीमत', kn: 'ಬೆಲೆ' },
  'farmer.mint': { en: 'Mint to Blockchain', hi: 'ब्लॉकचेन पर मिंट करें', kn: 'ಬ್ಲಾಕ್‌ಚೈನ್‌ಗೆ ಮಿಂಟ್ ಮಾಡಿ' },
  'farmer.minting': { en: 'Minting to Polygon...', hi: 'पॉलीगॉन पर मिंट हो रहा है...', kn: 'ಪಾಲಿಗಾನ್‌ಗೆ ಮಿಂಟ್ ಆಗುತ್ತಿದೆ...' },
  'farmer.success': { en: 'Minted Successfully!', hi: 'सफलतापूर्वक मिंट हुआ!', kn: 'ಯಶಸ್ವಿಯಾಗಿ ಮಿಂಟ್ ಆಯಿತು!' },
  'farmer.example': { en: 'Example: "50kg of Rice at 40 rupees per kg"', hi: 'उदाहरण: "50 किलो चावल 40 रुपये प्रति किलो"', kn: 'ಉದಾಹರಣೆ: "50 ಕೆಜಿ ಅಕ್ಕಿ 40 ರೂಪಾಯಿ ಪ್ರತಿ ಕೆಜಿ"' },
  'farmer.newRecord': { en: 'Record Another', hi: 'एक और दर्ज करें', kn: 'ಇನ್ನೊಂದು ದಾಖಲಿಸಿ' },

  // Missing info
  'missing.crop': { en: 'Crop name is missing, please provide it', hi: 'फसल का नाम गायब है, कृपया बताएं', kn: 'ಬೆಳೆ ಹೆಸರು ಕಾಣೆಯಾಗಿದೆ, ದಯವಿಟ್ಟು ಒದಗಿಸಿ' },
  'missing.weight': { en: 'Weight is missing, please provide it', hi: 'वजन गायब है, कृपया बताएं', kn: 'ತೂಕ ಕಾಣೆಯಾಗಿದೆ, ದಯವಿಟ್ಟು ಒದಗಿಸಿ' },
  'missing.price': { en: 'Price is missing, please provide it', hi: 'कीमत गायब है, कृपया बताएं', kn: 'ಬೆಲೆ ಕಾಣೆಯಾಗಿದೆ, ದಯವಿಟ್ಟು ಒದಗಿಸಿ' },

  // Marketplace
  'market.title': { en: 'Digital Mandi', hi: 'डिजिटल मंडी', kn: 'ಡಿಜಿಟಲ್ ಮಂಡಿ' },
  'market.subtitle': { en: 'Fresh from the farm, verified on chain', hi: 'खेत से ताजा, चेन पर सत्यापित', kn: 'ಹೊಲದಿಂದ ತಾಜಾ, ಚೈನ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ' },
  'market.hearVoice': { en: 'Hear Farmer Voice', hi: 'किसान की आवाज सुनें', kn: 'ರೈತರ ಧ್ವನಿ ಕೇಳಿ' },
  'market.buy': { en: 'Buy Now', hi: 'अभी खरीदें', kn: 'ಈಗ ಖರೀದಿಸಿ' },
  'market.timeline': { en: 'Supply Chain Timeline', hi: 'आपूर्ति श्रृंखला समयरेखा', kn: 'ಪೂರೈಕೆ ಸರಪಳಿ ಟೈಮ್‌ಲೈನ್' },
  'market.harvested': { en: 'Harvested', hi: 'कटाई हुई', kn: 'ಕೊಯ್ಲು' },
  'market.verified': { en: 'Verified', hi: 'सत्यापित', kn: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ' },
  'market.inStore': { en: 'In Store', hi: 'स्टोर में', kn: 'ಅಂಗಡಿಯಲ್ಲಿ' },
  'market.purchased': { en: 'Purchase Confirmed!', hi: 'खरीद की पुष्टि!', kn: 'ಖರೀದಿ ದೃಢಪಡಿಸಲಾಗಿದೆ!' },

  // Admin
  'admin.title': { en: 'Command Center', hi: 'कमांड सेंटर', kn: 'ಕಮಾಂಡ್ ಸೆಂಟರ್' },
  'admin.farmers': { en: 'Farmer Transactions', hi: 'किसान लेनदेन', kn: 'ರೈತ ವಹಿವಾಟುಗಳು' },
  'admin.consumers': { en: 'Consumer Purchases', hi: 'उपभोक्ता खरीद', kn: 'ಗ್ರಾಹಕ ಖರೀದಿಗಳು' },
  'admin.ledger': { en: 'Blockchain Ledger', hi: 'ब्लॉकचेन लेजर', kn: 'ಬ್ಲಾಕ್‌ಚೈನ್ ಲೆಡ್ಜರ್' },
  'admin.map': { en: 'Harvest Map', hi: 'फसल नक्शा', kn: 'ಬೆಳೆ ನಕ್ಷೆ' },
};

export function t(key: string, lang: Language): string {
  return translations[key]?.[lang] || translations[key]?.['en'] || key;
}

export const speechLangCode: Record<Language, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  kn: 'kn-IN',
};
