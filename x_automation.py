#!/usr/bin/env python3
import json, os, random
from datetime import datetime
import tweepy

QUOTES_FILE = os.path.expanduser("~/.openclaw/workspace/quotes.json")
TARGETS = ["ESPN", "SportsCenter", "NBA", "Forbes", "garyvee"]
WITTY_REPLIES = [
    "This is the content I signed up for 👏",
    "Screenshotting this for later 📸",
    "Someone get this person a trophy 🏆",
    "Facts only right here 💯",
    "Preach 🙌"
]

def load_creds():
    with open(os.path.expanduser("~/.openclaw/config.json")) as f:
        return json.load(f)["twitter"]

def load_quotes():
    with open(QUOTES_FILE) as f:
        return json.load(f)

def save_quotes(quotes):
    with open(QUOTES_FILE, 'w') as f:
        json.dump(quotes, f, indent=2)

def get_client():
    creds = load_creds()
    return tweepy.Client(
        consumer_key=creds["apiKey"],
        consumer_secret=creds["apiSecret"],
        access_token=creds["accessToken"],
        access_token_secret=creds["accessSecret"]
    )

def post_quote(client):
    quotes = load_quotes()
    if len(quotes) < 5:
        print(f"[{datetime.now()}] Warning: Only {len(quotes)} quotes left!")
    
    quote = random.choice(quotes)
    client.create_tweet(text=f"{quote}\n\n#Motivation #Sports #Entrepreneurship")
    print(f"[{datetime.now()}] Posted: {quote[:50]}...")

def retweet_sports(client):
    tweets = client.search_recent_tweets(query="sports -is:retweet lang:en", max_results=10)
    if tweets.data:
        client.retweet(tweets.data[0].id)
        print(f"[{datetime.now()}] Retweeted sports content")

def retweet_entrepreneurship(client):
    tweets = client.search_recent_tweets(query="entrepreneurship -is:retweet lang:en", max_results=10)
    if tweets.data:
        client.retweet(tweets.data[0].id)
        print(f"[{datetime.now()}] Retweeted entrepreneurship content")

def reply_witty(client):
    target = random.choice(TARGETS)
    user = client.get_user(username=target)
    if user.data:
        tweets = client.get_users_tweets(id=user.data.id, max_results=5)
        if tweets.data:
            reply = random.choice(WITTY_REPLIES)
            client.create_tweet(text=reply, in_reply_to_tweet_id=tweets.data[0].id)
            print(f"[{datetime.now()}] Replied to @{target}")

def main():
    client = get_client()
    hour = datetime.now().hour
    
    if hour == 9 or hour == 15:
        post_quote(client)
    elif hour == 12:
        retweet_sports(client)
    elif hour == 16:
        retweet_entrepreneurship(client)
    elif hour == 14 and datetime.now().day % 2 == 0:
        reply_witty(client)

if __name__ == "__main__":
    main()
