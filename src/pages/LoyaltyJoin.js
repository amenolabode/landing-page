import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { message } from "antd";
import SEO from "../components/SEO";
import { getApiUrl } from "../config/env";
import "./LoyaltyJoin.css";

const IOS_APP_URL = "https://apps.apple.com/app/scan/id123456789";
const ANDROID_APP_URL =
  "https://play.google.com/store/apps/details?id=com.scan.customer";

/** Dark text on light cards, white on dark ones. */
function inkFor(hex) {
  const h = (hex || "").replace("#", "");
  if (h.length !== 6) return "#14181F";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return lum < 0.4 ? "#FFFFFF" : "#14181F";
}

/** Phones can open the Scan app, which joins with one tap. */
const IS_MOBILE =
  typeof navigator !== "undefined" &&
  /android|iphone|ipad|ipod/i.test(navigator.userAgent || "");

const appLink = (id) =>
  `scanafrica://loyalty/programs/${encodeURIComponent(id)}`;

const fmt = (n) => Number(n).toLocaleString("en-US");

/** "1 point for every GHS 1 you spend" / "1 stamp every time you pay". */
function earnLine(p) {
  if (p.mode === "stamps") return "1 stamp every time you pay";
  const rate = Number(p.points_per_ghs || 1);
  if (rate >= 1) {
    const pts = Math.round(rate * 100) / 100;
    return `${pts} ${pts === 1 ? "point" : "points"} for every GHS 1 you spend`;
  }
  const ghs = Math.round((1 / rate) * 100) / 100;
  return `1 point for every GHS ${ghs} you spend`;
}

/** Reads the API's { data } or its error message. */
async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

const LoyaltyJoin = () => {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | missing | failed
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [joined, setJoined] = useState(null);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch(
        getApiUrl(`loyalty/programs/${encodeURIComponent(id)}`),
      );
      const json = await readJson(res);
      if (res.ok && json?.data) {
        setProgram(json.data);
        setState("ready");
      } else if (
        res.status === 404 ||
        res.status === 400 ||
        res.status === 422
      ) {
        setState("missing");
      } else {
        setState("failed");
      }
    } catch {
      setState("failed");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // On a phone, try the app once: signed-in customers join there with one
  // tap. Without the app nothing happens and the form below still works.
  const triedApp = useRef(false);
  useEffect(() => {
    if (state !== "ready" || !IS_MOBILE || triedApp.current) return;
    triedApp.current = true;
    window.location.href = appLink(id);
  }, [state, id]);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (phone.replace(/\D/g, "").length < 9) {
      message.error("Enter your full phone number");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(
        getApiUrl(`loyalty/programs/${encodeURIComponent(id)}/join`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: phone.trim(),
            name: name.trim() || null,
          }),
        },
      );
      const json = await readJson(res);
      if (res.ok && json?.data) {
        setJoined(json.data);
        return;
      }
      if (res.status === 429) {
        message.error("Too many tries. Wait a minute and try again.");
        return;
      }
      message.error(json?.message || "Couldn't join. Try again.");
    } catch {
      message.error("Couldn't join. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  if (state === "loading") {
    return (
      <div className="lj-page">
        <div className="lj-wrap lj-center">
          <div className="lj-spinner" aria-label="Loading" />
        </div>
      </div>
    );
  }

  if (state === "missing" || state === "failed") {
    return (
      <div className="lj-page">
        <div className="lj-wrap lj-center">
          <h1 className="lj-title">
            {state === "missing"
              ? "This program isn't taking new members"
              : "Couldn't load this program"}
          </h1>
          <p className="lj-sub">
            {state === "missing"
              ? "It may have ended, or it's joined at the till instead. Ask the store."
              : "Check your connection and try again."}
          </p>
          {state === "failed" && (
            <button type="button" className="lj-btn" onClick={load}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  const ink = inkFor(program.color);
  const unit = program.mode === "stamps" ? "stamps" : "points";
  const cardFooter = joined
    ? joined.welcome_bonus > 0
      ? `${fmt(joined.welcome_bonus)} ${unit}`
      : "Member"
    : program.welcome_bonus > 0
      ? `${fmt(program.welcome_bonus)} ${unit} when you join`
      : "Join free";

  return (
    <>
      <SEO
        title={`Join ${program.name} at ${program.business_name}`}
        description={`Earn ${unit} every time you buy at ${program.business_name} and swap them for rewards.`}
        url={`https://ottoafrica.com/loyalty/programs/${id}`}
      />
      <div className="lj-page">
        <main className="lj-wrap">
          <div
            className="lj-card"
            style={{ background: program.color, color: ink }}
            aria-label={`${program.name} member card`}
          >
            <div className="lj-card-top">
              <span className="lj-card-biz">{program.business_name}</span>
              {program.logo_url && (
                <img src={program.logo_url} alt="" className="lj-card-logo" />
              )}
            </div>
            <div>
              <div className="lj-card-name">{program.name}</div>
              <div className="lj-card-foot">{cardFooter}</div>
            </div>
          </div>

          {joined ? (
            <section className="lj-section" aria-live="polite">
              <h1 className="lj-title">
                {joined.already_member
                  ? "You're already a member"
                  : "You're in"}
              </h1>
              <p className="lj-sub">
                {joined.already_member
                  ? `Your ${unit} keep adding up every time you pay at ${program.business_name} with this phone number.`
                  : joined.welcome_bonus > 0
                    ? `${fmt(joined.welcome_bonus)} ${unit} are on your card. Pay with this phone number at ${program.business_name} to earn more.`
                    : `Pay with this phone number at ${program.business_name} to start earning.`}
              </p>
              <div className="lj-apps">
                <p className="lj-hint">
                  See your {unit} and rewards in the Scan app.
                </p>
                <a
                  className="lj-btn"
                  href={IOS_APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download for iOS
                </a>
                <a
                  className="lj-btn lj-btn-secondary"
                  href={ANDROID_APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download for Android
                </a>
              </div>
            </section>
          ) : (
            <>
              <section className="lj-section">
                <h1 className="lj-title">Join {program.name}</h1>
                <p className="lj-sub">
                  Free to join. Earn {earnLine(program)} at{" "}
                  {program.business_name}.
                </p>
              </section>

              {(program.rewards?.length > 0 ||
                program.welcome_bonus > 0 ||
                program.birthday_bonus > 0) && (
                <ul className="lj-list" aria-label="What you get">
                  {program.welcome_bonus > 0 && (
                    <li>
                      <span className="lj-pill">
                        {fmt(program.welcome_bonus)}
                      </span>
                      <span>{unit} when you join</span>
                    </li>
                  )}
                  {program.birthday_bonus > 0 && (
                    <li>
                      <span className="lj-pill">
                        {fmt(program.birthday_bonus)}
                      </span>
                      <span>{unit} in your birthday month</span>
                    </li>
                  )}
                  {program.rewards?.map((r) => (
                    <li key={`${r.points_required}-${r.name}`}>
                      <span className="lj-pill">{fmt(r.points_required)}</span>
                      <span>
                        {unit} for <strong>{r.name}</strong>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {IS_MOBILE && (
                <div className="lj-apps">
                  <a className="lj-btn" href={appLink(id)}>
                    Join in the Scan app
                  </a>
                  <p className="lj-hint">
                    One tap if you have Scan. No app? Use your phone number
                    below.
                  </p>
                </div>
              )}

              <form className="lj-form" onSubmit={submit} noValidate>
                <label className="lj-label" htmlFor="lj-phone">
                  Phone number
                </label>
                <input
                  id="lj-phone"
                  className="lj-input"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="024 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <label className="lj-label" htmlFor="lj-name">
                  Name <span className="lj-optional">Optional</span>
                </label>
                <input
                  id="lj-name"
                  className="lj-input"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button
                  type="submit"
                  className={IS_MOBILE ? "lj-btn lj-btn-secondary" : "lj-btn"}
                  disabled={busy}
                >
                  {busy ? "Joining…" : "Join free"}
                </button>
                <p className="lj-hint">
                  Use the number you pay with, so your {unit} are added at the
                  till.
                  {program.expiry_months
                    ? ` ${unit[0].toUpperCase()}${unit.slice(1)} expire after ${program.expiry_months} months without a visit.`
                    : ""}
                </p>
              </form>
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default LoyaltyJoin;
