#!/bin/bash
LOCATION="Sacramento,California"
EMAIL="alexenrightt@gmail.com"
DATE=$(date "+%A, %B %d")
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

WEATHER_FULL=$(curl -s "wttr.in/${LOCATION}?format=%C+%t+(%f)+%w+%h" 2>/dev/null || echo "Weather unavailable")
NEWS=$(curl -s "https://feeds.npr.org/1001/rss.xml" 2>/dev/null | grep -o '<title>[^<]*</title>' | tail -n +2 | head -5 | sed 's/<title>//;s/<\/title>//' | sed "s/&apos;/'/g" || echo "News unavailable")

echo "Good morning! Today is $DATE. Weather: $WEATHER_FULL. Headlines: $(echo "$NEWS" | tr '\n' '; '). Targets: 2000 cal, 150g protein, \$800 paycheck." > "$TMPDIR/briefing_tts.txt"

cat > "$TMPDIR/briefing.html" << EOH
<html>
<head>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f7fa; }
.container { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
h1 { color: #667eea; text-align: center; margin-top: 0; }
.section { background: #f9f9f9; padding: 15px; border-radius: 10px; margin: 20px 0; }
.weather { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); }
.targets { background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%); }
</style>
</head>
<body>
<div class="container">
<h1>☀️ Morning Briefing - $DATE</h1>
<div class="section weather">
<h2>🌤️ Weather</h2>
<p>$WEATHER_FULL</p>
</div>
<div class="section">
<h2>📰 News</h2>
$(echo "$NEWS" | sed 's/^/<p>📰 /;s/$/<\/p>/')
</div>
<div class="section targets">
<h2>💪 Your Targets</h2>
<p>🔥 Calories: Stay under 2,000</p>
<p>🥩 Protein: Hit 150g</p>
<p>💰 Paycheck reminder: $800</p>
</div>
<div style="text-align: center; color: #888; margin-top: 30px; font-style: italic;">
✨ Have a productive day! ✨
</div>
</div>
</body>
</html>
EOH

echo "=========================================="
echo "  Morning Briefing - $DATE"
echo "=========================================="
echo ""
echo "Weather: $WEATHER_FULL"
echo ""
echo "News:"
echo "$NEWS"
echo ""
echo "Targets: 2000 cal / 150g protein / \$800"

say -v Samantha -o "$TMPDIR/briefing.aiff" -f "$TMPDIR/briefing_tts.txt"
python3 ~/.openclaw/workspace/send_email.py "$EMAIL" "Morning Briefing - $DATE" "$TMPDIR/briefing_tts.txt" "$TMPDIR/briefing.aiff" "$TMPDIR/briefing.html"

if [ $? -eq 0 ]; then
    echo "✅ Briefing sent!"
else
    echo "❌ Email failed."
fi
