export interface CropRecord {
  id: string;
  farmerName: string;
  crop: string;
  weight: string;
  price: string;
  txHash: string;
  timestamp: number;
  lat: number;
  lng: number;
  voiceText?: string;
}

export interface Purchase {
  id: string;
  buyerName: string;
  cropRecordId: string;
  txHash: string;
  timestamp: number;
}

const CROPS_KEY = 'farmchain_crops';
const PURCHASES_KEY = 'farmchain_purchases';

const farmerNames = ['Rajesh Kumar', 'Anita Devi', 'Suresh Patil', 'Lakshmi Bai', 'Manoj Reddy', 'Kavitha Gowda'];
const cropNames = ['Rice', 'Wheat', 'Sugarcane', 'Turmeric', 'Cotton', 'Mango', 'Tomato', 'Onion'];

function generateHash(): string {
  const hex = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) hash += hex[Math.floor(Math.random() * 16)];
  return hash;
}

function seedData(): CropRecord[] {
  const records: CropRecord[] = [];
  for (let i = 0; i < 8; i++) {
    records.push({
      id: crypto.randomUUID(),
      farmerName: farmerNames[i % farmerNames.length],
      crop: cropNames[i],
      weight: `${(Math.floor(Math.random() * 200) + 20)}kg`,
      price: `₹${(Math.floor(Math.random() * 80) + 15)}/kg`,
      txHash: generateHash(),
      timestamp: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
      lat: 12.9 + Math.random() * 4,
      lng: 75 + Math.random() * 5,
      voiceText: `I harvested ${cropNames[i]} from my farm`,
    });
  }
  return records;
}

export function getCropRecords(): CropRecord[] {
  const data = localStorage.getItem(CROPS_KEY);
  if (!data) {
    const seeded = seedData();
    localStorage.setItem(CROPS_KEY, JSON.stringify(seeded));
    return seeded;
  }
  return JSON.parse(data);
}

export function addCropRecord(record: Omit<CropRecord, 'id' | 'txHash' | 'timestamp' | 'lat' | 'lng'>): CropRecord {
  const records = getCropRecords();
  const newRecord: CropRecord = {
    ...record,
    id: crypto.randomUUID(),
    txHash: generateHash(),
    timestamp: Date.now(),
    lat: 12.9 + Math.random() * 4,
    lng: 75 + Math.random() * 5,
  };
  records.unshift(newRecord);
  localStorage.setItem(CROPS_KEY, JSON.stringify(records));
  return newRecord;
}

export function getPurchases(): Purchase[] {
  const data = localStorage.getItem(PURCHASES_KEY);
  return data ? JSON.parse(data) : [];
}

export function addPurchase(cropRecordId: string, buyerName: string): Purchase {
  const purchases = getPurchases();
  const p: Purchase = {
    id: crypto.randomUUID(),
    buyerName,
    cropRecordId,
    txHash: generateHash(),
    timestamp: Date.now(),
  };
  purchases.unshift(p);
  localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
  return p;
}

export function parseCropInput(text: string): { crop?: string; weight?: string; price?: string; farmerName?: string; location?: string } {
  const result: { crop?: string; weight?: string; price?: string; farmerName?: string; location?: string } = {};

  // Farmer name: "I am <name>" or "my name is <name>"
  const nameMatch = text.match(/(?:i am|my name is|i'm|मेरा नाम|ನನ್ನ ಹೆಸರು)\s+([a-zA-Z\u0900-\u097F\u0C80-\u0CFF\s]+?)(?:\s*[,.]|\s+(?:and|from|i have|i|with|crop|rice|wheat))/i);
  if (nameMatch) result.farmerName = nameMatch[1].trim();

  // Location: "from <place>"
  const locationMatch = text.match(/(?:from|village|गांव|ಊರು|ಹಳ್ಳಿ)\s+([a-zA-Z\u0900-\u097F\u0C80-\u0CFF\s]+?)(?:\s*[,.]|\s+(?:and|i have|with|crop|rice|wheat|\d))/i);
  if (locationMatch) result.location = locationMatch[1].trim();
  
  // Weight: look for number + kg/kilogram
  const weightMatch = text.match(/(\d+)\s*(kg|kilogram|kilo|கிலோ|किलो|ಕೆಜಿ)/i);
  if (weightMatch) result.weight = `${weightMatch[1]}kg`;
  
  // Price: look for number + rupee/rs/₹ or "at X per"
  const priceMatch = text.match(/(?:₹|rs\.?|rupee[s]?|रुपय[ेा]|ರೂಪಾಯಿ)\s*(\d+)/i) 
    || text.match(/(\d+)\s*(?:₹|rs\.?|rupee[s]?|per\s*kg|रुपय[ेा]|ರೂಪಾಯಿ)/i)
    || text.match(/(?:at|price)\s*(\d+)/i);
  if (priceMatch) result.price = `₹${priceMatch[1]}/kg`;
  
  // Crop: known crop names
  const crops = ['rice', 'wheat', 'sugarcane', 'turmeric', 'cotton', 'mango', 'tomato', 'onion', 'potato', 'corn', 'maize', 'soybean', 'chili', 'pepper', 'banana'];
  const lowerText = text.toLowerCase();
  for (const c of crops) {
    if (lowerText.includes(c)) { result.crop = c.charAt(0).toUpperCase() + c.slice(1); break; }
  }
  // Hindi/Kannada crop names
  const cropMap: Record<string, string> = { 'चावल': 'Rice', 'गेहूं': 'Wheat', 'अक्कि': 'Rice', 'ಅಕ್ಕಿ': 'Rice', 'ಗೋಧಿ': 'Wheat', 'ಟೊಮ್ಯಾಟೊ': 'Tomato', 'ಈರುಳ್ಳಿ': 'Onion' };
  if (!result.crop) {
    for (const [k, v] of Object.entries(cropMap)) {
      if (text.includes(k)) { result.crop = v; break; }
    }
  }
  
  return result;
}

export { generateHash };
