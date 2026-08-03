# Minimal Digital Watch for Übersicht

A restrained Apple-inspired desktop watch with one glass card, a large local time display, and a functional progress complication.

## Progress modes

Click the blue complication to cycle through:

- **Minute:** live seconds and progress through the current minute
- **Hour:** current minute and progress through the hour
- **Day:** percentage of the day elapsed

The ring updates smoothly between clock refreshes. In Übersicht, click interaction requires an interaction shortcut and Accessibility access.

## Install

1. In Übersicht, choose **Open Widgets Folder** from the menu bar.
2. Copy the entire `apple-watch-clock.widget` folder into that folder.
3. Enable **apple-watch-clock** if it is not enabled automatically.

Edit the `config` object at the top of `index.jsx` to change position, 12/24-hour display, or accent colour. Open `preview.html` in a browser to see and test all three modes without Übersicht.
