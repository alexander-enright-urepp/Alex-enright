#!/usr/bin/env python3
import json, os, random
from datetime import datetime
import tweepy

QUOTES = [
    "Champions aren't made in gyms. Champions are made from within. — Muhammad Ali",
    "Success is no accident. It's hard work and sacrifice. — Pelé",
    "The entrepreneur searches for change and exploits it. — Peter Drucker",
    "Your biggest opponent is the voice telling you to quit.",
    "Build in silence, let success make the noise.",
    "Every setback is data for the next win."
]

def load_creds():
    with open(os.path.expanduser("~/.openclaw/config.json")) as f:
        return json.load(f)["twitter"]

def main():
    creds = load_creds()
    client = tweepy.Client(
        consumer_key=creds["apiKey"],
        consumer_secret=creds["apiSecret"],
        access_token=creds["accessToken"],
        access_token_secret=creds["accessSecret"]
    )
    
    # Post a quote
    quote = random.choice(QUOTES)
    client.create_tweet(text=f"{quote} #Motivation #Sports")
    print(f"Posted at {datetime.now()}")

if __name__ == "__main__":
    main()
