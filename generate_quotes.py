#!/usr/bin/env python3
import json
import os
from datetime import datetime

QUOTES_FILE = os.path.expanduser("~/.openclaw/workspace/quotes.json")

NEW_QUOTES = [
    "The difference between ordinary and extraordinary is that little extra. — Jimmy Johnson",
    "Don't let yesterday take up too much of today. — Will Rogers",
    "You learn more from failure than from success. Don't let it stop you. — Unknown",
    "The only limit to our realization of tomorrow will be our doubts of today. — Franklin D. Roosevelt",
    "Do what you love and the money will follow. — Marsha Sinetar",
    "The road to success and the road to failure are almost exactly the same. — Colin R. Davis",
    "Success is walking from failure to failure with no loss of enthusiasm. — Winston Churchill",
    "I never dreamed about success, I worked for it. — Estée Lauder",
    "Don't be afraid to give up the good to go for the great. — John D. Rockefeller",
    "I have not failed. I've just found 10,000 ways that won't work. — Thomas Edison",
    "The secret of getting ahead is getting started. — Mark Twain",
    "Don't let the fear of losing be greater than the excitement of winning. — Robert Kiyosaki",
    "If you want to achieve greatness stop asking for permission. — Unknown",
    "The only place where success comes before work is in the dictionary. — Vidal Sassoon",
    "Stop chasing the money and start chasing the passion. — Tony Hsieh",
    "All our dreams can come true, if we have the courage to pursue them. — Walt Disney",
    "Opportunities don't happen. You create them. — Chris Grosser",
    "Try not to become a person of success, but rather try to become a person of value. — Albert Einstein",
    "The best time to plant a tree was 20 years ago. The second best time is now. — Chinese Proverb",
    "Never give in except to convictions of honor and good sense. — Winston Churchill",
    "The successful warrior is the average man, with laser-like focus. — Bruce Lee",
    "Fall seven times, stand up eight. — Japanese Proverb",
    "Pain is temporary. Quitting lasts forever. — Lance Armstrong",
    "It's not about how hard you hit. It's about how hard you can get hit and keep moving forward. — Rocky Balboa",
    "The only easy day was yesterday. — Navy SEALs",
    "Champions keep playing until they get it right. — Billie Jean King",
    "If you can't outplay them, outwork them. — Ben Hogan",
    "The more I practice, the luckier I get. — Gary Player",
    "You have to expect things of yourself before you can do them. — Michael Jordan",
    "Talent wins games, but teamwork and intelligence win championships. — Michael Jordan",
    "I've failed over and over again in my life. And that is why I succeed. — Michael Jordan",
    "Obstacles don't have to stop you. If you run into a wall, don't turn around and give up. — Michael Jordan",
    "Just play. Have fun. Enjoy the game. — Michael Jordan",
    "Some people want it to happen, some wish it would happen, others make it happen. — Michael Jordan",
    "There is no 'i' in team but there is in win. — Michael Jordan",
    "If you don't have confidence, you'll always find a way not to win. — Carl Lewis",
    "It's not the size of the dog in the fight, it's the size of the fight in the dog. — Archie Griffin",
    "The harder the battle, the sweeter the victory. — Les Brown",
    "It's what you do in the dark that puts you in the light. — Unknown",
    "The only way to prove that you're a good sport is to lose. — Ernie Banks"
]

def load_quotes():
    if os.path.exists(QUOTES_FILE):
        with open(QUOTES_FILE) as f:
            return json.load(f)
    return []

def save_quotes(quotes):
    with open(QUOTES_FILE, 'w') as f:
        json.dump(quotes, f, indent=2)

def main():
    existing = load_quotes()
    existing_texts = [q.split(' — ')[0] for q in existing]
    
    added = 0
    for quote in NEW_QUOTES:
        quote_text = quote.split(' — ')[0]
        if quote_text not in existing_texts and added < 5:
            existing.append(quote)
            existing_texts.append(quote_text)
            added += 1
            print(f"[{datetime.now()}] Added: {quote[:50]}...")
    
    save_quotes(existing)
    print(f"[{datetime.now()}] Total quotes: {len(existing)} (+{added} new)")

if __name__ == "__main__":
    main()
