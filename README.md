# Clacky

A restrained Apple-inspired desktop watch for Übersicht with one glass card, a large local time display, and a functional progress complication.

## Progress modes

Right-click the complication to open the native color eyedropper and pick a ring color. Click the complication to cycle through the enabled modes (set in `config.modes`):

- **Battery:** battery level, shows "CHARGING" when plugged in
- **Second:** live seconds and progress through the current minute
- **Year:** day of the year and progress through the year
- **Weekend:** hours until Saturday and progress through the work week
- **Color:** picker for the ring color

The ring updates smoothly between clock refreshes. In Übersicht, click interaction requires an interaction shortcut and Accessibility access.

## Install

Install or update with a single command (no git knowledge needed):

```sh
curl -fsSL https://raw.githubusercontent.com/rijan-poudel/apple-clock-Widget/main/install.sh | sh
```

This clones the widget into Übersicht's widgets folder. Run the **same command again** any time to update.

If the widget does not appear after installing, click the Übersicht icon in the menu bar and choose **Refresh**.

### Manual install

1. In Übersicht, choose **Open Widgets Folder** from the menu bar.
2. Copy the entire `clacky.widget` folder into that folder.
3. Enable **clacky** if it is not enabled automatically.

> Note: a manual copy has no automatic updates. Only the `curl` install gets them.

## Automatic updates

When installed via the command above, the widget pulls the latest code from GitHub every time Übersicht loads it (at most once per hour). Turn this off by setting `autoUpdate: false` in the `config` object at the top of `index.jsx`. Your position, mode, and color are never overwritten by an update.

Edit the `config` object at the top of `index.jsx` to change position, 12/24-hour display, accent colour, which ring modes are shown, and the default mode. Open `preview.html` in a browser to see and test the modes without Übersicht.
