# Hybrid Stock Price Prediction with Sentiment Analysis and Explainable AI

## Overview

Hybrid Stock Price Prediction with Sentiment Analysis and Explainable AI is an AI-powered financial analysis platform designed to provide stock market insights through prediction, news sentiment analysis, explainable AI, historical comparison, smart alerts, and an AI-powered market assistant.

The application combines financial analysis and Generative AI to provide an interactive platform for exploring stock-related information and understanding AI-generated insights.

## Key Features

- AI-powered stock prediction and analysis
- News and market sentiment analysis
- Explainable AI for interpreting AI-generated insights
- Historical stock comparison
- Smart stock alerts
- AI-powered market expert chat
- Interactive financial dashboard
- User login and session management
- Multi-language interface
- Financial market ticker
- Interactive charts and data visualization

## AI Capabilities

### Stock Prediction

The application provides stock-related prediction and analysis based on available market information.

### News Sentiment Analysis

The system analyzes relevant news and textual information to identify sentiment and provide additional context for stock analysis.

Sentiment categories include:

- Positive
- Negative
- Neutral

### Explainable AI

The application includes an Explainable AI module designed to help users understand the factors associated with AI-generated stock insights.

### AI Market Assistant

The Market Expert Chat provides an AI-powered conversational interface for discussing stock-related information and analysis.

The assistant can use the selected stock and prediction information as context for generating relevant responses.

### Smart Alerts

The application includes a smart alert module for monitoring selected stock-related information.

## System Workflow

    User
     |
     v
    Login
     |
     v
    Financial Dashboard
     |
     +----------------------+----------------------+-------------------+
     |                      |                      |                   |
     v                      v                      v                   v
    Stock              News Sentiment       Explainable AI      Historical
    Prediction             Analysis             Analysis         Comparison
     |                      |                      |                   |
     +----------------------+----------------------+-------------------+
                            |
                            v
                     AI-Based Insights
                            |
                            v
                     Market Expert Chat
                            |
                            v
                         User

## Technologies Used

- React
- TypeScript
- JavaScript
- Node.js
- Tailwind CSS
- Recharts
- Gemini API
- Generative AI
- Natural Language Processing
- Sentiment Analysis
- Explainable AI

## Application Architecture

The application follows a modular component-based React architecture.

Major components include:

- Login
- Dashboard
- Stock Prediction
- News Sentiment
- Explainable AI
- Historical Comparison
- Smart Alerts
- User Dashboard
- Market Expert Chat
- About System

The application also uses context providers for user preferences and notifications.

## Application Modules

### 1. Stock Prediction

Provides stock-related analysis and prediction functionality through an interactive interface.

### 2. News Sentiment

Analyzes news or textual information related to the selected stock and provides sentiment-based insights.

### 3. Explainable AI

Provides an interface for understanding the factors behind AI-generated stock analysis.

### 4. Historical Comparison

Allows users to compare historical stock information and identify trends.

### 5. Smart Alerts

Provides stock-related alert functionality for monitored information.

### 6. Market Expert Chat

Provides an AI-powered conversational assistant for stock and market-related queries.

### 7. User Dashboard

Provides a personalized area for the user within the application.

## User Authentication

The application includes a basic login system.

User information is stored locally using browser local storage during the application session.

The application supports:

- User login
- User logout
- Session persistence
- User-specific dashboard access

## User Interface

The application provides a dark-themed financial dashboard with:

- Sidebar navigation
- Financial market ticker
- Stock analysis modules
- Interactive charts
- AI analysis sections
- User profile section
- Language selection
- AI market assistant

The dashboard displays market indicators including:

- NIFTY 50
- SENSEX
- NASDAQ
- BTC

## Project Workflow

1. The user logs into the application.
2. The user selects the required financial analysis module.
3. A stock symbol can be selected or entered.
4. The application processes the available stock-related information.
5. Market and textual information are analyzed.
6. Sentiment analysis is performed on relevant textual information.
7. AI-based prediction and analysis are generated.
8. Explainable AI functionality provides additional interpretation.
9. Historical comparison and smart alert features can be used for further analysis.
10. The AI Market Expert Chat allows the user to interact with the system using natural language.

## Project Demonstration

A project demonstration video is included as part of the submission.

The demonstration showcases:

- Application login
- Main financial dashboard
- Stock prediction module
- News sentiment analysis
- Explainable AI module
- Historical comparison
- Smart alerts
- AI Market Expert Chat
- Overall application workflow

## Running the Application Locally

### Prerequisites

- Node.js
- npm
- Gemini API key

### Installation

Clone the repository:

    git clone https://github.com/YOUR-USERNAME/hybrid-stock-prediction-sentiment-xai.git

Navigate to the project directory:

    cd hybrid-stock-prediction-sentiment-xai

Install dependencies:

    npm install

### Environment Configuration

Create a `.env.local` file in the root directory:

    GEMINI_API_KEY=your_gemini_api_key

The actual API key must not be included in the repository.

Add the following to `.gitignore`:

    .env.local

### Run the Application

Start the development server:

    npm run dev

Open the local development URL displayed in the terminal.

## Project Structure

    hybrid-stock-prediction-sentiment-xai/
    |
    +-- components/
    |   +-- Login
    |   +-- Dashboard
    |   +-- common/
    |   +-- modules/
    |       +-- StockPrediction
    |       +-- NewsSentiment
    |       +-- ExplainableAI
    |       +-- HistoricalComparison
    |       +-- SmartAlerts
    |       +-- UserDashboard
    |       +-- AboutSystem
    |       +-- MarketExpertChat
    |
    +-- context/
    |   +-- PreferencesContext
    |   +-- ToastContext
    |
    +-- services/
    |   +-- geminiService
    |
    +-- public/
    |
    +-- index.html
    +-- index.tsx
    +-- App.tsx
    +-- package.json
    +-- .gitignore
    +-- .env.local
    +-- README.md

The exact structure may vary depending on the final implementation.

## Security

The Gemini API key is stored using an environment variable and must not be exposed in the source code.

The `.env.local` file should always be included in `.gitignore`.

Never commit or publicly share a valid API key.

## Project Highlights

- Integrates Generative AI into a financial analysis application
- Uses Gemini API for AI-powered functionality
- Combines stock analysis with sentiment analysis
- Includes Explainable AI functionality
- Provides an AI-powered conversational market assistant
- Uses a modular React architecture
- Provides an interactive financial dashboard
- Includes smart alert and historical comparison functionality
- Uses TypeScript for application development
- Provides an interactive user-oriented interface

## Future Enhancements

- Integration with real-time financial market APIs
- Integration with additional financial data providers
- More advanced time-series forecasting models
- Improved sentiment classification
- Advanced explainability visualizations
- Personalized financial insights
- Portfolio-level analysis
- Automated market monitoring
- Cloud deployment
- Improved AI agent capabilities
- More robust authentication and data storage
