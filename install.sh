#!/bin/sh
# Install or update the Apple Watch Clock widget for Übersicht.
#
# Install:    curl -fsSL https://raw.githubusercontent.com/rijan-poudel/apple-clock-Widget/main/install.sh | sh
# Update:     run the exact same command again.
#
# Optionally point WIDGETS_DIR at a custom Übersicht widgets folder:
#   WIDGETS_DIR=/path/to/widgets sh install.sh

set -eu

REPO_URL="https://github.com/rijan-poudel/apple-clock-Widget.git"
NAME="apple-watch-clock"
WIDGET_DIR="${WIDGETS_DIR:-$HOME/Library/Application Support/Übersicht/widgets}"
TARGET="$WIDGET_DIR/$NAME.widget"

mkdir -p "$WIDGET_DIR"

if [ -d "$TARGET/.git" ]; then
  echo "Updating $NAME.widget ..."
  git -C "$TARGET" pull --ff-only origin main
elif [ -d "$TARGET" ]; then
  echo "Error: $TARGET already exists but is not a git checkout."
  echo "Remove it first (make sure to keep any saved state) and run again."
  exit 1
else
  echo "Installing $NAME.widget ..."
  git clone --depth 1 "$REPO_URL" "$TARGET"
fi

echo ""
echo "Done. The widget updates itself automatically from now on."
echo "If it does not appear, click the Übersicht icon in the menu bar and choose Refresh."
