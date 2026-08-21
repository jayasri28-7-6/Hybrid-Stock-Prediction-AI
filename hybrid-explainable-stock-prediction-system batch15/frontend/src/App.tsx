import React, { useState } from 'react';

const App: React.FC = () => {
  const [searchSymbol, setSearchSymbol] = useState('');

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-blue-400">
                📈 StockPredict AI
              </h1>
              <div className="hidden md:flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2">Dashboard</a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2">Predictions</a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2">News</a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2">About</a>
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            AI-Powered Stock Predictions
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl">
            Get real-time stock predictions with explainable AI insights. Make smarter investment decisions with our hybrid model.
          </p>
          
          {/* Search Bar */}
          <div className="flex max-w-2xl">
            <input
              type="text"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
              placeholder="Enter stock symbol (e.g., AAPL, GOOGL, TSLA)"
              className="flex-1 bg-gray-700 text-white rounded-l-lg px-4 py-3 border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-lg font-medium">
              Analyze
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Market Overview */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Market Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">S&P 500</p>
              <p className="text-2xl font-bold text-white">4,782.45</p>
              <p className="text-green-400 text-sm">+0.89%</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">NASDAQ</p>
              <p className="text-2xl font-bold text-white">15,092.85</p>
              <p className="text-green-400 text-sm">+1.23%</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">DOW JONES</p>
              <p className="text-2xl font-bold text-white">37,683.01</p>
              <p className="text-red-400 text-sm">-0.15%</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">RUSSELL 2000</p>
              <p className="text-2xl font-bold text-white">2,156.32</p>
              <p className="text-green-400 text-sm">+0.67%</p>
            </div>
          </div>
        </section>

        {/* Popular Stocks */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Popular Stocks</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { symbol: 'AAPL', name: 'Apple Inc.', price: '175.43', change: '+2.34' },
              { symbol: 'GOOGL', name: 'Alphabet', price: '142.56', change: '+1.45' },
              { symbol: 'MSFT', name: 'Microsoft', price: '378.85', change: '+1.89' },
              { symbol: 'TSLA', name: 'Tesla', price: '238.45', change: '-0.78' },
              { symbol: 'AMZN', name: 'Amazon', price: '145.67', change: '+1.23' },
            ].map((stock) => (
              <div key={stock.symbol} className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white">{stock.symbol}</h4>
                    <p className="text-gray-400 text-sm">{stock.name}</p>
                  </div>
                  <span className={`text-sm font-medium ${stock.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.change}%
                  </span>
                </div>
                <p className="text-xl font-bold text-white mt-2">${stock.price}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AI Predictions */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">AI Predictions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4">Today's Top Picks</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">AAPL</span>
                  <span className="text-green-400">Buy (92% confidence)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">MSFT</span>
                  <span className="text-green-400">Buy (89% confidence)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">TSLA</span>
                  <span className="text-yellow-400">Hold (75% confidence)</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4">Explainable AI Insights</h4>
              <div className="space-y-3">
                <div className="text-gray-300">
                  <span className="text-blue-400">AAPL:</span> Strong earnings, positive sentiment
                </div>
                <div className="text-gray-300">
                  <span className="text-blue-400">MSFT:</span> Cloud growth, AI integration
                </div>
                <div className="text-gray-300">
                  <span className="text-blue-400">TSLA:</span> Delivery numbers, market competition
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* News Section */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Market News</h3>
          <div className="bg-gray-800 rounded-lg border border-gray-700 divide-y divide-gray-700">
            <div className="p-4 hover:bg-gray-700 transition">
              <h4 className="text-white font-medium">Apple Announces New AI Features</h4>
              <p className="text-gray-400 text-sm mt-1">Stock rises 2.3% on positive sentiment</p>
              <div className="flex items-center mt-2 text-xs">
                <span className="text-gray-500">2 hours ago</span>
                <span className="mx-2 text-gray-600">•</span>
                <span className="text-green-400">Positive</span>
              </div>
            </div>
            <div className="p-4 hover:bg-gray-700 transition">
              <h4 className="text-white font-medium">Tesla Q4 Deliveries Beat Estimates</h4>
              <p className="text-gray-400 text-sm mt-1">Production numbers exceed expectations</p>
              <div className="flex items-center mt-2 text-xs">
                <span className="text-gray-500">5 hours ago</span>
                <span className="mx-2 text-gray-600">•</span>
                <span className="text-green-400">Positive</span>
              </div>
            </div>
            <div className="p-4 hover:bg-gray-700 transition">
              <h4 className="text-white font-medium">Microsoft Cloud Growth Slows</h4>
              <p className="text-gray-400 text-sm mt-1">Analysts adjust ratings</p>
              <div className="flex items-center mt-2 text-xs">
                <span className="text-gray-500">1 day ago</span>
                <span className="mx-2 text-gray-600">•</span>
                <span className="text-yellow-400">Neutral</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-white font-medium mb-4">About</h5>
              <p className="text-gray-400 text-sm">Hybrid explainable AI model for stock predictions with real-time insights.</p>
            </div>
            <div>
              <h5 className="text-white font-medium mb-4">Features</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Real-time predictions</li>
                <li>Explainable AI</li>
                <li>Sentiment analysis</li>
                <li>Smart alerts</li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-medium mb-4">Resources</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Blog</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-medium mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Disclaimer</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm mt-8">
            © 2024 Hybrid Explainable Stock Prediction System. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;