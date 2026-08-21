import feedparser
import requests

# Yahoo Finance RSS
def get_yahoo_finance_news():
    feed = feedparser.parse("https://finance.yahoo.com/rss/")
    
    news = []
    for entry in feed.entries[:5]:
        news.append({
            "source": "Yahoo Finance",
            "title": entry.title,
            "link": entry.link
        })
    
    return news


# CNBC RSS
def get_cnbc_news():
    feed = feedparser.parse("https://www.cnbc.com/id/100003114/device/rss/rss.html")
    
    news = []
    for entry in feed.entries[:5]:
        news.append({
            "source": "CNBC",
            "title": entry.title,
            "link": entry.link
        })
    
    return news


# Reuters RSS
def get_reuters_news():
    feed = feedparser.parse("https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best")
    
    news = []
    for entry in feed.entries[:5]:
        news.append({
            "source": "Reuters",
            "title": entry.title,
            "link": entry.link
        })
    
    return news