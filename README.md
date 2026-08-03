# Minimal Digital Watch for Übersicht

A restrained Apple-inspired desktop watch with one glass card, a large local time display, and a functional progress complication.

## Progress modes

Right-click the complication to open the native color eyedropper and pick a ring color. Click the complication to cycle through the enabled modes (set in `config.modes`):

- **Battery:** battery level, shows "CHARGING" when plugged in
- **Second:** live seconds and progress through the current minute
- **Year:** day of the year and progress through the year
- **Weekend:** hours until Saturday and progress through the work week
- **Color:** picker for the ring color

The ring updates smoothly between clock refreshes. In Übersicht, click interaction requires an interaction shortcut and Accessibility access.

## Install

1. In Übersicht, choose **Open Widgets Folder** from the menu bar.
2. Copy the entire `apple-watch-clock.widget` folder into that folder.
3. Enable **apple-watch-clock** if it is not enabled automatically.

Edit the `config` object at the top of `index.jsx` to change position, 12/24-hour display, accent colour, which ring modes are shown, and the default mode. Open `preview.html` in a browser to see and test the modes without Übersicht.
