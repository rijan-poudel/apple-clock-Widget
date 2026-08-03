// Minimal Digital Watch for Übersicht

const config = {
  top: "10%",
  use24Hour: true,
  accent: "#64d2ff",
};

const radius = 45;
const circumference = 2 * Math.PI * radius;
const modes = ["minute", "hour", "day"];
const loadedAt = Date.now();

export const refreshFrequency = 250;
export const initialState = { now: loadedAt, modeIndex: 0 };
export const command = (dispatch) => dispatch({ type: "TICK", now: Date.now() });

export const updateState = (event, previousState = initialState) => {
  if (event.type === "TICK") return { ...previousState, now: event.now };
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
    color: rgba(255, 255, 255, .48);
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
    color: rgba(255, 255, 255, .82);
  }

  .period {
    margin: 0 0 6px 8px;
    color: rgba(255, 255, 255, .42);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .5px;
  }

  .location {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 16px;
    color: rgba(255, 255, 255, .36);
    font-size: 9px;
    font-weight: 650;
    letter-spacing: .35px;
  }

  .live-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${config.accent};
    box-shadow: 0 0 8px rgba(100, 210, 255, .6);
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
      linear-gradient(145deg, rgba(38, 83, 106, .86), rgba(12, 43, 59, .94));
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
      linear-gradient(145deg, rgba(43, 93, 118, .88), rgba(14, 49, 67, .96));
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
    stroke: ${config.accent};
    stroke-width: 6;
    stroke-linecap: round;
    filter: drop-shadow(0 0 4px rgba(100, 210, 255, .22));
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
    color: rgba(255, 255, 255, .40);
    font-size: 7px;
    font-weight: 650;
    letter-spacing: .85px;
  }
`;

const pad = (value) => String(value).padStart(2, "0");

const getProgressData = (date, mode) => {
  const seconds = date.getSeconds() + date.getMilliseconds() / 1000;
  const minutes = date.getMinutes() + seconds / 60;
  const hours = date.getHours() + minutes / 60;

  if (mode === "hour") {
    return { progress: minutes / 60, value: pad(date.getMinutes()), unit: "HOUR" };
  }
  if (mode === "day") {
    const progress = hours / 24;
    return { progress, value: `${Math.floor(progress * 100)}%`, unit: "DAY" };
  }
  return { progress: seconds / 60, value: pad(date.getSeconds()), unit: "MINUTE" };
};

export const render = ({ now, modeIndex = 0 }, dispatch) => {
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
  const progressData = getProgressData(date, mode);
  const dashOffset = circumference * (1 - progressData.progress);

  return (
    <div className="watch-card" role="timer" aria-label={`Local time ${pad(displayHours)}:${pad(date.getMinutes())}`}>
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
        aria-label={`Showing ${mode} progress. Click to change mode.`}
        onClick={() => dispatch({ type: "CYCLE_MODE" })}
      >
        <svg className="progress-svg" viewBox="0 0 112 112" aria-hidden="true">
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
          <span className="progress-value">{progressData.value}</span>
          <span className="progress-unit">{progressData.unit}</span>
        </span>
      </button>
    </div>
  );
};
