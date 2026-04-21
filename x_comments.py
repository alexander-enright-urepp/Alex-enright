#!/usr/bin/env python3
import json, os, random
from datetime import datetime
import tweepy

TOP_ACCOUNTS = [
    # Sports
    "ESPN", "SportsCenter", "NBA", "NFL", "MLB", "NHL", "BleacherReport", 
    "FirstTake", "RealSkipBayless", "ShannonSharpe", "AdamSchefter", "wojespn",
    "KingJames", "StephenCurry30", "KDTrey5", "Giannis_An34", "KyrieIrving",
    "Cristiano", "KMbappe", "neymarjr", "mancity", "realmadrid", "FCBarcelona",
    "Lakers", "Warriors", "NYYankees", "RedSox", "Dodgers",
    
    # Business/Entrepreneurship
    "Forbes", "Inc", "FastCompany", "Entrepreneur", "BusinessInsider",
    "garyvee", "naval", "paulg", "sama", "reidhoffman", "elonmusk",
    "BillGates", "JeffBezos", "tim_cook", "satyanadella", "sundarpichai",
    "Oprah", "MarkCuban", "BarbaraCorcoran", "DaymondJohn", "kevinolearytv",
    "GrantCardone", "TonyRobbins", "RobinSharma", "BrendonBurchard",
    "WarrenBuffett", "CharlieMunger", "RayDalio",
    
    # Tech/VC
    "TechCrunch", "TheVerge", "Wired", "mashable",
    "a16z", "ycombinator", "sequoia",
    "jason", "fredwilson", "pmarca", "bhorowitz",
    
    # Entertainment
    "Netflix", "PrimeVideo", "disneyplus", "HBOMax",
    "TheRock", "KevinHart4real",
    "rihanna", "Beyonce", "taylorswift13", "Drake",
    
    # News/Thought Leaders  
    "CNN", "BBCWorld", "Reuters", "nytimes",
    "BarackObama", "timoreilly", "cdixon", "balajis"
]

SMART_COMMENTS = [
    "This is the kind of insight that changes how you think about the game 🎯",
    "Facts. The data backs this up too 📊",
    "Couldn't have said it better myself. This is why I follow you 👏",
    "The nuance here is what most people miss. Appreciate this breakdown 🧠",
    "Plot twist: I'm saving this for later 📌",
    "This aged well already and it's only been an hour ⌛",
    "The real ones know this is gold 💎",
    "Someone get this person a raise immediately 💰",
    "This is the content that keeps me coming back here daily 🙌",
    "Reading this felt like a masterclass. Thank you for sharing 🎓",
    "The attention to detail here is *chef's kiss* 👨‍🍳",
    "This is why you're in my top follows. Pure value 🔥",
    "Unpopular opinion: this should be mandatory reading 📚",
    "The way you broke this down deserves its own thread 🧵",
    "This perspective just shifted my entire approach. Thank you 🙏",
    "Not all heroes wear capes. Some just post content like this 🦸",
    "Screenshotting this before it blows up 📸",
    "The algorithm did its job today by showing me this ✨",
    "This is the quality content I signed up for. More of this please 🙏",
    "If knowledge is power, consider me charged up after reading this ⚡",
    "This hit different. In the best way possible 💯",
    "The timing of this post couldn't be better. Right on cue 🎯",
    "This just became my new favorite post of the day 🏆",
    "The depth here is what separates the pros from the amateurs 🎓",
    "Bookmarked for future reference. This is gold 🏅",
    "How do you consistently deliver content this good? Asking for a friend 🤔",
    "This is the definition of adding value to the timeline 💎",
    "Mind = blown. Simple as that 🤯",
    "The clarity in this post is unmatched. Well done 👏",
    "This just changed how I'm approaching my day. Thank you for this 🙏"
]

def load_creds():
    with open(os.path.expanduser("~/.openclaw/config.json")) as f:
        return json.load(f)["twitter"]

def get_client():
    creds = load_creds()
    return tweepy.Client(
        consumer_key=creds["apiKey"],
        consumer_secret=creds["apiSecret"],
        access_token=creds["accessToken"],
        access_token_secret=creds["accessSecret"]
    )

def post_comments():
    client = get_client()
    posted = 0
    max_attempts = 15
    attempts = 0
    
    print(f"[{datetime.now()}] Starting comment batch...")
    
    while posted < 5 and attempts < max_attempts:
        attempts += 1
        target = random.choice(TOP_ACCOUNTS)
        
        try:
            user = client.get_user(username=target, user_auth=True)
            if not user.data:
                continue
                
            tweets = client.get_users_tweets(user_auth=True, user_auth=True, 
                id=user.data.id, 
                max_results=5,
                exclude=['retweets', 'replies']
            )
            
            if not tweets.data:
                continue
            
            tweet = random.choice(tweets.data)
            comment = random.choice(SMART_COMMENTS)
            
            response = client.create_tweet(
                text=comment,
                in_reply_to_tweet_id=tweet.id
            )
            
            posted += 1
            print(f"[{datetime.now()}] Posted {posted}/10: Reply to @{target}")
            
            import time
            time.sleep(2)
            
        except Exception as e:
            print(f"[{datetime.now()}] Error with @{target}: {str(e)[:50]}")
            continue
    
    print(f"[{datetime.now()}] Batch complete: {posted}/10 comments posted")

if __name__ == "__main__":
    post_comments()
