
import { Language } from './types';

export const LANGUAGES = [
  { code: Language.EN, name: 'English' },
  { code: Language.HI, name: 'हिन्दी' },
  { code: Language.TA, name: 'தமிழ்' },
  { code: Language.TE, name: 'తెలుగు' },
  { code: Language.KN, name: 'ಕನ್ನಡ' },
  { code: Language.ML, name: 'മലയാളം' },
  { code: Language.BN, name: 'বাংলা' },
  { code: Language.GU, name: 'ગુજરાતી' },
  { code: Language.MR, name: 'मराठी' },
  { code: Language.PA, name: 'ਪੰਜਾਬੀ' },
];

export const CURRENCIES = [
  { symbol: '₹', name: 'India' },
  { symbol: '$', name: 'USA' },
  { symbol: '€', name: 'Europe' },
  { symbol: '£', name: 'UK' },
  { symbol: '¥', name: 'Japan' },
];

export const NAV_ITEMS = [
  'stockPrediction',
  'newsSentiment',
  'explainableAI',
  'historicalComparison',
  'smartAlerts',
  'userDashboard',
  'aboutSystem',
];