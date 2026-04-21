#!/usr/bin/env python3
import tweepy
import sys
import os

def load_credentials():
    cred_path = os.path.expanduser("~/.openclaw/workspace/x_credentials.txt")
    with open(cred_path, 'r') as f:
        lines = [l.strip() for l in f.readlines() if l.strip()]
    return lines[0], lines[1], lines[2], lines[3]

def post_tweet(text):
    api_key, api_secret, access_token, access_secret = load_credentials()
    
    # Use OAuth 1.0a (more reliable for posting)
    auth = tweepy.OAuthHandler(api_key, api_secret)
    auth.set_access_token(access_token, access_secret)
    api = tweepy.API(auth)
    
    try:
        # Test credentials first
        api.verify_credentials()
        print("✅ Authentication successful")
        
        # Post tweet
        response = api.update_status(text)
        print(f"✅ Posted: https://x.com/i/web/status/{response.id}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        post_tweet(sys.argv[1])
    else:
        print("Usage: python3 post_to_x.py 'Your tweet'")
