#!/usr/bin/env python3
import sys
from PIL import Image

# Open the image
input_path = "/Users/alexanderenright/.openclaw/workspace/alexenright-ios/AlexEnright/Assets.xcassets/AppIcon.appiconset/AE1024.png"
output_path = "/Users/alexanderenright/.openclaw/workspace/alexenright-ios/AlexEnright/Assets.xcassets/AppIcon.appiconset/AE1024_noalpha.png"

img = Image.open(input_path)

# Create a white background
background = Image.new('RGB', img.size, (255, 255, 255))

# Paste the image on the background using the alpha channel as mask
if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
else:
    background.paste(img)

# Save as PNG without alpha
background.save(output_path, 'PNG')

print(f"Saved to {output_path}")
print(f"Mode: {background.mode}")
