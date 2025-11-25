const KELVIN_TO_C = (k) => (typeof k === "number" ? k - 273.15 : NaN);
const MPS_TO_MPH = (mps) => (typeof mps === "number" ? mps * 2.236936 : NaN);

function safeDate(dtTxt) {
  // dt_txt is "YYYY-MM-DD HH:mm:ss"
  const [d] = String(dtTxt || "").split(" ");
  return d || null;
}

function pickMain(weatherArr) {
  if (!Array.isArray(weatherArr) || weatherArr.length === 0) return "";
  return String(weatherArr[0]?.main || "");
}

export function mapToDailyForecast({ raw, days }) {
  const byDay = new Map(); // date -> { entries: [], from, to }

  for (const item of raw?.list ?? []) {
    const date = safeDate(item.dt_txt);
    if (!date) continue;
    if (!byDay.has(date)) byDay.set(date, { entries: [], from: item.dt_txt, to: item.dt_txt });
    const bucket = byDay.get(date);
    bucket.entries.push(item);
    if (String(item.dt_txt) < String(bucket.from)) bucket.from = item.dt_txt;
    if (String(item.dt_txt) > String(bucket.to)) bucket.to = item.dt_txt;
  }

  const orderedDates = [...byDay.keys()].sort().slice(0, days);

  return orderedDates.map((date) => {
    const bucket = byDay.get(date);
    let highC = -Infinity;
    let lowC = Infinity;
    let hasRain = false;
    let hasThunderstorm = false;
    let maxWindMph = 0;

    for (const e of bucket.entries) {
      const maxC = KELVIN_TO_C(e?.main?.temp_max);
      const minC = KELVIN_TO_C(e?.main?.temp_min);
      if (Number.isFinite(maxC)) highC = Math.max(highC, maxC);
      if (Number.isFinite(minC)) lowC = Math.min(lowC, minC);

      const main = pickMain(e?.weather);
      if (main === "Rain") hasRain = true;
      if (main === "Thunderstorm") hasThunderstorm = true;

      const mph = MPS_TO_MPH(e?.wind?.speed);
      if (Number.isFinite(mph)) maxWindMph = Math.max(maxWindMph, mph);
    }

    // If provider data is weird, normalize values
    if (!Number.isFinite(highC)) highC = null;
    if (!Number.isFinite(lowC)) lowC = null;

    const facts = {
      date,
      highC,
      lowC,
      hasRain,
      hasThunderstorm,
      maxWindMph: Math.round(maxWindMph * 10) / 10
    };

    return {
      date,
      highC: highC === null ? null : Math.round(highC * 10) / 10,
      lowC: lowC === null ? null : Math.round(lowC * 10) / 10,
      window: { from: bucket.from, to: bucket.to },
      facts
    };
  });
}

