import React, { useMemo, useState } from "react";

const LS_KEY = "weather:lastForecast";

function saveLocal(payload) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ savedAt: Date.now(), payload }));
  } catch {
    // ignore storage failures (private mode / quota)
  }
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function fetchForecast({ city, offline }) {
  const u = new URL("/api/forecast", window.location.origin);
  u.searchParams.set("city", city);
  u.searchParams.set("days", "3");
  if (offline) u.searchParams.set("offline", "true");

  const res = await fetch(u.toString(), { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const msg = body?.message || `Request failed (${res.status})`;
    const e = new Error(msg);
    e.status = res.status;
    e.body = body;
    throw e;
  }
  return await res.json();
}

function Badge({ tone, children }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export default function App() {
  const [city, setCity] = useState("London");
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const cached = useMemo(() => loadLocal(), []);

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await fetchForecast({ city: city.trim(), offline });
      setResult(payload);
      saveLocal(payload);
    } catch (e) {
      if (offline && cached?.payload) {
        setResult({
          ...cached.payload,
          source: { mode: "offline", provider: "cache" },
          _uiNote: "Showing the last saved result from this browser."
        });
      } else {
        setError(e.message || "Unexpected error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="title">Weather Prediction</div>
          <div className="subtitle">Next 3 days high/low + advisories (offline-capable)</div>
        </div>
        <nav className="nav">
          <a href="/docs" target="_blank" rel="noreferrer">
            API Docs
          </a>
          <a href="/openapi.json" target="_blank" rel="noreferrer">
            OpenAPI
          </a>
        </nav>
      </header>

      <section className="card">
        <div className="formRow">
          <label className="label">
            City
            <input
              className="input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. London"
            />
          </label>

          <label className="toggle">
            <input type="checkbox" checked={offline} onChange={(e) => setOffline(e.target.checked)} />
            <span>Offline mode</span>
          </label>

          <button className="button" onClick={run} disabled={loading || !city.trim()}>
            {loading ? "Loading…" : "Get forecast"}
          </button>
        </div>

        {error ? (
          <div className="alert alert--error">
            <strong>Error:</strong> {error}
          </div>
        ) : null}

        {result?._uiNote ? <div className="alert alert--info">{result._uiNote}</div> : null}

        {result ? (
          <div className="result">
            <div className="meta">
              <div className="metaLeft">
                <div className="metaTitle">{result.city}</div>
                <div className="metaSub">
                  Source: <Badge tone={result.source.mode === "offline" ? "warn" : "ok"}>{result.source.mode}</Badge>{" "}
                  <Badge tone="muted">{result.source.provider}</Badge>
                </div>
              </div>
            </div>

            <div className="grid">
              {result.days.map((d) => (
                <div key={d.date} className="day">
                  <div className="dayTop">
                    <div className="dayDate">{d.date}</div>
                    <div className="temps">
                      <span className="tempHi">{d.highC ?? "?"}°C</span>
                      <span className="tempLo">{d.lowC ?? "?"}°C</span>
                    </div>
                  </div>

                  <div className="window">
                    Window: {d.window.from} → {d.window.to}
                  </div>

                  <div className="advice">
                    {d.advice.length ? (
                      d.advice.map((a) => (
                        <div key={a} className="adviceItem">
                          {a}
                        </div>
                      ))
                    ) : (
                      <div className="adviceItem adviceItem--none">No special advice</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty">Enter a city and click “Get forecast”.</div>
        )}
      </section>

      <footer className="footer">
        Tip: toggle <strong>Offline mode</strong> to force cached/fallback results even if the upstream API is down.
      </footer>
    </div>
  );
}

