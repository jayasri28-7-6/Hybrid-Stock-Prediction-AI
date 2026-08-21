
export enum Language {
  EN = 'en',
  HI = 'hi',
  TA = 'ta',
  TE = 'te',
  KN = 'kn',
  ML = 'ml',
  BN = 'bn',
  GU = 'gu',
  MR = 'mr',
  PA = 'pa',
}

export interface User {
  username: string;
  email: string;
  isAuthenticated: boolean;
}

export interface StockData {
  date: string;
  price: number;
}

export interface MarketPerformance {
  symbol: string;
  name: string;
  price: number;
  change: number;
  history: number[];
}

export interface PredictionData {
    date: string;
    predictedPrice: number;
    trend: 'Up' | 'Down' | 'Stable';
}

export interface ForecastData {
    date: string;
    targetPrice: number;
    trend: 'Up' | 'Down' | 'Stable';
}

export interface KeyStatistics {
    dayRange: string;
    open: number;
    previousClose: number;
    fiftyTwoWeekRange: string;
    avgVolume: string;
    marketCap: string;
    sharesOutstanding: string;
    epsTTM: number;
    peTTM: number;
    forwardDividendYield: string;
    exDividendDate: string;
}

export interface CompanyDetails {
    name: string;
    sector: string;
    industry: string;
    marketCategory: string;
    description: string;
    recentTrend: string;
    keyStats?: KeyStatistics;
}

export interface NewsArticle {
  id: string;
  headlineKey: string;
  headlineReplacements: { [key: string]: string };
  summaryKey: string;
  summaryReplacements: { [key: string]: string };
  source: string;
  date: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  confidence: number;
}

export interface ShapFeature {
    feature: string;
    importance: number;
    direction: 'positive' | 'negative';
    reason: string;
}

export interface DiceCounterfactual {
    ifConditionKey: string;
    ifReplacements: { [key: string]: string };
    thenOutcomeKey: string;
    thenReplacements: { [key: string]: string };
    probability: number;
    magnitude: 'High' | 'Medium' | 'Low';
}

export interface MarketAlert {
    id: string;
    stock: string;
    change: string;
    trend: 'Up' | 'Down' | 'Stable';
    action: 'Buy' | 'Sell' | 'Hold';
    message: string;
    timestamp: string;
    priceAtAlert: number;
    recipient: string;
}

export interface Bookmark {
    symbol: string;
    name: string;
    smartAlertEnabled: boolean;
}

export interface UserPreferences {
    language: Language;
    currency: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    timestamp: string;
}
