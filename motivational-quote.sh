#!/bin/bash
EMAIL="alexenrightt@gmail.com"
DATE=$(date "+%A, %B %d")
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

QUOTES=(
"The only way to do great work is to love what you do. - Steve Jobs"
"Believe you can and you're halfway there. - Theodore Roosevelt"
"Your time is limited, don't waste it living someone else's life. - Steve Jobs"
"The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
"Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill"
"Don't watch the clock; do what it does. Keep going. - Sam Levenson"
"The best way to predict the future is to create it. - Peter Drucker"
"You miss 100% of the shots you don't take. - Wayne Gretzky"
"Whether you think you can or you think you can't, you're right. - Henry Ford"
"The only impossible journey is the one you never begin. - Tony Robbins"
"Everything you've ever wanted is on the other side of fear. - George Addair"
"Hardships often prepare ordinary people for an extraordinary destiny. - C.S. Lewis"
"Dream big and dare to fail. - Norman Vaughan"
"It does not matter how slowly you go as long as you do not stop. - Confucius"
"Everything is figureoutable. - Marie Forleo"
)

RANDOM_INDEX=$((RANDOM % ${#QUOTES[@]}))
QUOTE="${QUOTES[$RANDOM_INDEX]}"

cat > "$TMPDIR/quote.txt" << EOT
Good morning! Here is your motivational quote for $DATE:

$QUOTE

Have an amazing day!
EOT

cat > "$TMPDIR/quote.html" << EOH
<html>
<head>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); margin: 0; padding: 20px; }
.container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); text-align: center; }
h1 { color: #667eea; margin: 0 0 10px 0; font-size: 2em; }
.date { color: #888; margin-bottom: 30px; }
.quote-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; margin: 30px 0; font-size: 1.3em; line-height: 1.6; }
.divider { border: none; border-top: 2px solid #eee; margin: 30px 0; }
.footer { color: #888; font-style: italic; font-size: 1.1em; }
</style>
</head>
<body>
<div class="container">
<h1>✨ Daily Motivation ✨</h1>
<div class="date">$DATE</div>
<div class="quote-box">
"$QUOTE"
</div>
<hr class="divider">
<div class="footer">
✨ Have an amazing day! ✨
</div>
</div>
</body>
</html>
EOH

echo "=========================================="
echo "  DAILY MOTIVATION - $DATE"
echo "=========================================="
echo ""
echo "$QUOTE"
echo ""

say -v Samantha -o "$TMPDIR/quote.aiff" -f "$TMPDIR/quote.txt"
python3 ~/.openclaw/workspace/send_email.py "$EMAIL" "🌤️ Daily Motivation - $DATE" "$TMPDIR/quote.txt" "$TMPDIR/quote.aiff" "$TMPDIR/quote.html"

if [ $? -eq 0 ]; then
    echo "✅ Motivation sent!"
else
    echo "❌ Email failed."
fi
