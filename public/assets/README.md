# SirBro Assets

This folder contains static assets for the SirBro admin panel, public site, and deep link handler.

## Files

### Icons

- `logo.svg` - Main SirBro brand mark used by metadata icon links.
- `brandmark.png` - SirBro raster brand mark used by app chrome, touch icons, and visual surfaces.
- `icon-192.svg` - Medium size icon for PWA (192x192).
- `icon-512.svg` - Large size icon for PWA (512x512).
- `../favicon.ico` - Browser tab favicon generated from the SirBro brand mark.
- `../apple-touch-icon.png` - Apple touch icon generated from the SirBro brand mark.

### Usage

- Icons are used in the web app manifest and Next.js metadata for browser tabs and PWA support
- SVG format ensures scalability across all devices
- Blue theme (#2563eb) matches the application design

### Notes

- All active icons should use SirBro branding
- Designed to work well on both light and dark backgrounds

## Replacing Icons

To replace with custom icons:

1. Maintain the same file names and sizes
2. Use SVG format for scalability
3. Update the manifest.json if changing file names
4. Ensure icons work well at small sizes for mobile devices
