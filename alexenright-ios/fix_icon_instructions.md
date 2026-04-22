# Fix App Icon - Remove Alpha Channel

The error means your 1024x1024 app icon has transparency (alpha channel).
Apple requires app icons to be opaque (no transparency).

## Quick Fix:

1. Open AE1024.png in Preview
2. File → Export...
3. Format: PNG
4. UNCHECK "Alpha" checkbox
5. Save and replace AE1024.png

## Alternative: Use an online tool:

1. Go to https://remove-bg.com or any image editor
2. Upload your AE1024.png
3. Add white background (if it has transparency)
4. Download and replace

## Command line fix (if you have ImageMagick):

```bash
convert AE1024.png -background white -alpha remove -alpha off AE1024_fixed.png
```

Then in Xcode:
1. Select AE1024.png in Assets.xcassets
2. Delete it
3. Drag the fixed version in
4. Rebuild

The icon must be:
- 1024x1024 pixels
- PNG format
- NO transparency (RGB only, no RGBA)
