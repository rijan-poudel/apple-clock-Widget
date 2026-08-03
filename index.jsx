// Minimal Digital Watch for Übersicht

import { run } from "uebersicht";

const config = {
  top: "10%",
  use24Hour: true,
  accent: "#a8a8a8",
  snap: 8,
  autoLaunchEyedropper: false,
};

const radius = 45;
const circumference = 2 * Math.PI * radius;
const modes = ["second", "day", "year", "color"];
const DEFAULT_PANE_COLOR = "#26536a";
const loadedAt = Date.now();

let dragStart = null;
let lastDrag = null;
let suppressClick = false;

const getFolder = () => {
  try {
    const src =
      (typeof document !== "undefined" && document.currentScript && document.currentScript.src) || "";
    const match = src.match(/\/widgets\/([^/?]+)/);
    if (!match) return null;
    let id = match[1];
    for (const suffix of ["-widget-jsx", "-index-jsx", "-main-jsx"]) {
      if (id.endsWith(suffix)) id = id.slice(0, -suffix.length);
    }
    if (id.endsWith("-widget")) id = id.slice(0, -7) + ".widget";
    return id || null;
  } catch (e) {
    return null;
  }
};

const folder = getFolder();

const quoteShell = (value) => `'${String(value).replace(/'/g, `'\\''`)}'`;

const saveConfig = (offsetX, offsetY, paneColor) => {
  if (!folder) return;
  const tmp = `${folder}/position.json.tmp`;
  const file = `${folder}/position.json`;
  const json = JSON.stringify({ offsetX, offsetY, paneColor });
  const command = [
    `mkdir -p ${quoteShell(folder)}`,
    `cat > ${quoteShell(tmp)} <<'POEOF'`,
    json,
    "POEOF",
    `mv -f ${quoteShell(tmp)} ${quoteShell(file)}`,
  ].join("\n");
  run(command).catch(() => {});
};

const launchEyedropper = (dispatch, ox, oy) => {
  if (!folder) return;
  run(`${quoteShell(folder)}/eyedropper 2>/dev/null`)
    .then((out) => {
      const firstLine = String(out || "").trim().split("\n")[0].trim();
      if (/^#[0-9a-fA-F]{6}$/.test(firstLine)) {
        const next = firstLine.toLowerCase();
        dispatch({ type: "SET_COLOR", color: next });
        saveConfig(ox, oy, next);
      }
    })
    .catch(() => {});
};

export const refreshFrequency = 250;
export const initialState = {
  now: loadedAt,
  modeIndex: 0,
  offsetX: 0,
  offsetY: 0,
  paneColor: DEFAULT_PANE_COLOR,
};
export const command = (dispatch) => dispatch({ type: "TICK", now: Date.now() });

export const init = (dispatch) => {
  if (!folder) return;
  run(`cat ${quoteShell(folder)}/position.json 2>/dev/null || echo "{}"`)
    .then((output) => {
      let restored = { offsetX: 0, offsetY: 0, paneColor: DEFAULT_PANE_COLOR };
      try {
        const saved = JSON.parse(output);
        restored = {
          offsetX: Number.isFinite(saved.offsetX) ? saved.offsetX : 0,
          offsetY: Number.isFinite(saved.offsetY) ? saved.offsetY : 0,
          paneColor: /^#[0-9a-fA-F]{6}$/.test(saved.paneColor)
            ? saved.paneColor.toLowerCase()
            : DEFAULT_PANE_COLOR,
        };
      } catch (e) {}
      dispatch({ type: "RESTORE", ...restored });
      if (config.autoLaunchEyedropper) {
        launchEyedropper(dispatch, restored.offsetX, restored.offsetY);
      }
    })
    .catch(() => {});
};

export const updateState = (event, previousState = initialState) => {
  if (event.type === "TICK") return { ...previousState, now: event.now };
  if (event.type === "RESTORE") {
    return {
      ...previousState,
      offsetX: event.offsetX,
      offsetY: event.offsetY,
      paneColor: event.paneColor,
    };
  }
  if (event.type === "DRAG") {
    return { ...previousState, offsetX: event.offsetX, offsetY: event.offsetY };
  }
  if (event.type === "SET_COLOR") {
    return { ...previousState, paneColor: event.color };
  }
  if (event.type === "CYCLE_MODE") {
    const currentMode = Number.isFinite(previousState.modeIndex) ? previousState.modeIndex : 0;
    return { ...previousState, modeIndex: (currentMode + 1) % modes.length };
  }
  return previousState;
};

export const className = `
  top: ${config.top};
  left: 50%;
  transform: translateX(-50%);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif;
  color: white;
  user-select: none;
  pointer-events: none;
  -webkit-font-smoothing: antialiased;

  * { box-sizing: border-box; }

  .watch-card {
    position: relative;
    display: flex;
    width: 430px;
    height: 182px;
    padding: 8px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, .10);
    border-radius: 40px;
    background: linear-gradient(135deg, rgba(26, 27, 30, .88), rgba(7, 8, 10, .92) 62%);
    -webkit-backdrop-filter: blur(30px) saturate(135%);
    backdrop-filter: blur(30px) saturate(135%);
    box-shadow:
      0 24px 56px rgba(0, 0, 0, .38),
      0 5px 16px rgba(0, 0, 0, .20),
      inset 0 1px 0 rgba(255, 255, 255, .09);
    pointer-events: auto;
    cursor: grab;
    touch-action: none;
  }

  .watch-card:active {
    cursor: grabbing;
  }

  .watch-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 52px;
    width: 128px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, .22), transparent);
    pointer-events: none;
  }

  .left-pane {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    padding: 3px 18px 2px 25px;
  }

  .date {
    margin-bottom: 10px;
    color: #fff;
    font-size: 11px;
    font-weight: 520;
    letter-spacing: .1px;
  }

  .time-row {
    display: flex;
    align-items: flex-end;
  }

  .time {
    color: #fff;
    font-size: 64px;
    font-weight: 300;
    font-variant-numeric: tabular-nums;
    letter-spacing: -3.5px;
    line-height: .92;
  }

  .colon {
    color: #fff;
  }

  .period {
    margin: 0 0 6px 8px;
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .5px;
  }

  .location {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 16px;
    color: #fff;
    font-size: 9px;
    font-weight: 650;
    letter-spacing: .35px;
  }

  .live-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${config.accent};
    box-shadow: 0 0 8px rgba(168, 168, 168, .6);
  }

  .right-pane {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 150px;
    margin: 0;
    padding: 0;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, .08);
    border-radius: 32px;
    outline: none;
    background:
      radial-gradient(circle at 28% 8%, rgba(255, 255, 255, .11), transparent 43%),
      linear-gradient(
        145deg,
        color-mix(in srgb, var(--pane) 86%, transparent),
        color-mix(in srgb, var(--pane) 38%, black)
      );
    color: #fff;
    font-family: inherit;
    pointer-events: auto;
    cursor: pointer;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08);
    transition: background .2s ease, transform .2s ease;
  }

  .right-pane:hover {
    background:
      radial-gradient(circle at 28% 8%, rgba(255, 255, 255, .13), transparent 43%),
      linear-gradient(
        145deg,
        color-mix(in srgb, var(--pane) 92%, white),
        color-mix(in srgb, var(--pane) 42%, black)
      );
  }

  .right-pane:active {
    transform: scale(.985);
  }

  .progress-svg {
    width: 112px;
    height: 112px;
    transform: rotate(-90deg);
  }

  .progress-bg {
    fill: none;
    stroke: rgba(255, 255, 255, .095);
    stroke-width: 6;
  }

  .progress-bar {
    fill: none;
    stroke: var(--ring, ${config.accent});
    stroke-width: 6;
    stroke-linecap: round;
    filter: drop-shadow(0 0 4px rgba(168, 168, 168, .22));
    transition: stroke-dashoffset .28s linear;
  }

  .progress-content {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-variant-numeric: tabular-nums;
  }

  .progress-value {
    color: #fff;
    font-size: 28px;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -1px;
  }

  .progress-unit {
    margin-top: 5px;
    color: #fff;
    font-size: 7px;
    font-weight: 650;
    letter-spacing: .85px;
  }

  .color-icon {
    width: 26px;
    height: 26px;
    fill: #fff;
    opacity: .95;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, .35));
  }
`;

const pad = (value) => String(value).padStart(2, "0");
const snapValue = (value, grid) => Math.round(value / grid) * grid;

const getProgressData = (date, mode) => {
  const seconds = date.getSeconds() + date.getMilliseconds() / 1000;
  const minutes = date.getMinutes() + seconds / 60;
  const hours = date.getHours() + minutes / 60;

  if (mode === "day") {
    const progress = hours / 24;
    return { progress, value: `${Math.floor(progress * 100)}%`, unit: "DAY" };
  }
  if (mode === "year") {
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((date - startOfYear) / 86400000);
    const year = date.getFullYear();
    const daysInYear =
      (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
    return { progress: dayOfYear / daysInYear, value: String(dayOfYear), unit: "DAY" };
  }
  return { progress: seconds / 60, value: pad(date.getSeconds()), unit: "SEC" };
};

export const render = ({ now, modeIndex = 0, offsetX = 0, offsetY = 0, paneColor = DEFAULT_PANE_COLOR }, dispatch) => {
  const date = new Date(Number.isFinite(now) ? now : Date.now());
  const rawHours = date.getHours();
  const displayHours = config.use24Hour ? rawHours : rawHours % 12 || 12;
  const period = config.use24Hour ? "" : rawHours >= 12 ? "PM" : "AM";
  const weekday = date.toLocaleDateString(undefined, { weekday: "long" });
  const month = date.toLocaleDateString(undefined, { month: "long" });
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "LOCAL";
  const location = timeZone.split("/").pop().replace(/_/g, " ");
  const safeModeIndex = Number.isFinite(modeIndex) ? modeIndex % modes.length : 0;
  const mode = modes[safeModeIndex];
  const isColorMode = mode === "color";
  const progressData = isColorMode
    ? { progress: 1, value: paneColor.replace("#", "").toUpperCase(), unit: "COLOR" }
    : getProgressData(date, mode);
  const dashOffset = circumference * (1 - progressData.progress);

  const handlePointerMove = (e) => {
    if (!dragStart) return;
    const nextX = snapValue(dragStart.ox + (e.clientX - dragStart.sx), config.snap);
    const nextY = snapValue(dragStart.oy + (e.clientY - dragStart.sy), config.snap);
    if (Math.abs(e.clientX - dragStart.sx) + Math.abs(e.clientY - dragStart.sy) > 3) {
      suppressClick = true;
    }
    lastDrag = { offsetX: nextX, offsetY: nextY };
    dispatch({ type: "DRAG", offsetX: nextX, offsetY: nextY });
  };

  const handlePointerUp = () => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerUp);
    const finalDrag = lastDrag;
    dragStart = null;
    lastDrag = null;
    if (finalDrag) saveConfig(finalDrag.offsetX, finalDrag.offsetY, paneColor);
    setTimeout(() => {
      suppressClick = false;
    }, 0);
  };

  const handlePointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    dragStart = { sx: e.clientX, sy: e.clientY, ox: offsetX, oy: offsetY };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  const openEyedropper = () => {
    launchEyedropper(dispatch, offsetX, offsetY);
  };

  return (
    <div
      className="watch-card"
      role="timer"
      aria-label={`Local time ${pad(displayHours)}:${pad(date.getMinutes())}`}
      style={{ "--pane": paneColor, transform: `translate(${offsetX}px, ${offsetY}px)` }}
      onPointerDown={handlePointerDown}
    >
      <div className="left-pane">
        <div className="date">{weekday}, {month} {date.getDate()}</div>
        <div className="time-row">
          <div className="time">{pad(displayHours)}<span className="colon">:</span>{pad(date.getMinutes())}</div>
          {period && <span className="period">{period}</span>}
        </div>
        <div className="location"><span className="live-dot" />{location}</div>
      </div>

      <button
        className="right-pane"
        type="button"
        aria-label={
          isColorMode
            ? "Color mode. Click to cycle modes, right-click to pick a color."
            : `Showing ${mode} progress. Click to change mode, right-click to pick a color.`
        }
        onClick={() => {
          if (suppressClick) {
            suppressClick = false;
            return;
          }
          dispatch({ type: "CYCLE_MODE" });
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          openEyedropper();
        }}
      >
        <svg
          className="progress-svg"
          viewBox="0 0 112 112"
          aria-hidden="true"
          style={isColorMode ? { "--ring": paneColor } : undefined}
        >
          <circle className="progress-bg" cx="56" cy="56" r={radius} />
          <circle
            className="progress-bar"
            cx="56"
            cy="56"
            r={radius}
            style={{ strokeDasharray: circumference, strokeDashoffset: dashOffset }}
          />
        </svg>
        <span className="progress-content">
          {isColorMode ? (
            <svg className="color-icon" viewBox="0 0 512 512" aria-hidden="true">
              <path d="M50.75 333.25c-12 12-18.75 28.28-18.75 45.26V424L0 480l32 32 56-32h45.49c16.97 0 33.25-6.74 45.25-18.74l126.64-126.62c-14.58-6.12-28.8-14.03-41.1-26.35L50.75 333.25zM483.88 28.12c-37.47-37.5-98.28-37.5-135.75 0L238.75 137.5c-6.25 6.25-6.25 16.38 0 22.63l9.37 9.37-34.25 34.25c-9.37 9.37-9.37 24.56 0 33.94l22.62 22.62c9.37 9.37 24.56 9.37 33.94 0l34.25-34.25 9.37 9.37c6.25 6.25 16.38 6.25 22.63 0L411.88 164c37.5-37.47 37.5-98.28 0-135.75z" />
            </svg>
          ) : (
            <span className="progress-value">{progressData.value}</span>
          )}
          <span className="progress-unit">{progressData.unit}</span>
        </span>
      </button>
    </div>
  );
};
