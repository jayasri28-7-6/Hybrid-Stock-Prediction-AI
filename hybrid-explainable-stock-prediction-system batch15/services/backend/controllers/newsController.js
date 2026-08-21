const geminiHelper = require('../utils/geminiHelper');

// Mock news data (replace with actual news API in production)
const mockNews = {
  AAPL: [
    {
      id: '1',
      headlineKey: 'Apple announces new AI features',
      summaryKey: 'Apple unveiled its latest AI capabilities at WWDC, sending stocks higher.',
      source: 'Financial Times',
      date: new Date().toISOString(),
      sentiment: 'Positive',
      confidence: 0.92
    },
    {
      id: '2',
      headlineKey: 'iPhone sales exceed expectations',
      summaryKey: 'Strong iPhone 15 sales drive revenue growth in Q2.',
      source: 'Bloomberg',
      date: new Date(Date.now() - 86400000).toISOString(),
      sentiment: 'Positive',
      confidence: 0.88
    }
  ],
  GOOGL: [
    {
      id: '3',
      headlineKey: 'Google Cloud revenue surges',
      summaryKey: 'Google Cloud platform sees 28% revenue growth in latest quarter.',
      source: 'Reuters',
      date: new Date().toISOString(),
      sentiment: 'Positive',
      confidence: 0.85
    }
  ],
  TSLA: [
    {
      id: '4',
      headlineKey: 'Tesla delivery numbers miss estimates',
      summaryKey: 'Q2 deliveries fall short of analyst expectations due to production issues.',
      source: 'WSJ',
      date: new Date().toISOString(),
      sentiment: 'Negative',
      confidence: 0.78
    }
  ]
};

exports.getStockNews = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Get news from mock data
    const news = mockNews[symbol] || [];
    
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('News fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message
    });
  }
};

exports.getNewsInLanguage = async (req, res) => {
  try {
    const { symbol, language } = req.params;
    
    const news = mockNews[symbol] || [];
    
    // Translate headlines and summaries to requested language
    const translatedNews = await Promise.all(
      news.map(async (article) => {
        const translatedHeadline = await geminiHelper.translateText(article.headlineKey, language);
        const translatedSummary = await geminiHelper.translateText(article.summaryKey, language);
        
        return {
          ...article,
          headlineKey: translatedHeadline,
          summaryKey: translatedSummary
        };
      })
    );
    
    res.json({
      success: true,
      data: translatedNews,
      language
    });
  } catch (error) {
    console.error('News translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news in requested language',
      error: error.message
    });
  }
};

exports.getMarketSentiment = async (req, res) => {
  try {
    // Calculate overall market sentiment from all stocks
    const allNews = Object.values(mockNews).flat();
    
    const sentimentCounts = {
      Positive: allNews.filter(n => n.sentiment === 'Positive').length,
      Neutral: allNews.filter(n => n.sentiment === 'Neutral').length,
      Negative: allNews.filter(n => n.sentiment === 'Negative').length
    };
    
    const total = allNews.length;
    
    res.json({
      success: true,
      data: {
        overall: total > 0 ? (sentimentCounts.Positive / total) * 100 : 0,
        counts: sentimentCounts,
        total,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Market sentiment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate market sentiment',
      error: error.message
    });
  }
};