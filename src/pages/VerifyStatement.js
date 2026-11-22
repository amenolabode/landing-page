import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { message } from "antd";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { getApiUrl } from "../config/env";

const PURPOSE = { VISA: "Visa", LOAN: "Loan", TENDER: "Tender", OTHER: "Other" };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function day(value) {
  if (!value) return "—";
  const d = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function ghs(minor) {
  if (minor == null) return "—";
  const abs = Math.abs(minor);
  return `${minor < 0 ? "-" : ""}GHS ${Math.floor(abs / 100).toLocaleString("en-GH")}.${String(abs % 100).padStart(2, "0")}`;
}

async function sha256Hex(file) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Where a bank, embassy or tender board checks an official Scan statement:
 * enter the code printed at the foot of each page (or scan its QR code) and
 * compare the figures. Dropping the PDF in also checks the file is unchanged.
 */
const VerifyStatement = () => {
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get("code") || "");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [fileMatch, setFileMatch] = useState(null);

  const check = useCallback(async (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setChecking(true);
    setFileMatch(null);
    try {
      const res = await fetch(getApiUrl(`public/statements/verify/${encodeURIComponent(trimmed)}`));
      const body = await res.json().catch(() => null);
      if (res.status === 429) {
        message.error("Too many checks from this network. Wait a few minutes and try again.");
        return;
      }
      if (!res.ok || !body?.data) {
        message.error(body?.message || "We couldn't check that code right now. Try again.");
        return;
      }
      setResult(body.data);
    } catch {
      message.error("We couldn't reach Scan. Check your connection and try again.");
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    const initial = params.get("code");
    if (initial) check(initial);
  }, [params, check]);

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !result?.document_sha256) return;
    try {
      setFileMatch((await sha256Hex(file)) === result.document_sha256);
    } catch {
      message.error("That file couldn't be read.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Check a Scan statement"
        description="Check that an official Scan bank statement is genuine using the code printed on it."
        keywords="verify bank statement, Scan statement, FCL statement"
        url="https://ottoafrica.com/verify"
      />
      <Header />
      <section className="pt-32 pb-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-medium text-gray-900 mb-3">Check a statement</h1>
          <p className="text-gray-600 mb-8">
            Enter the code printed at the foot of each page of an official Scan statement. We'll show what we issued so you can compare it
            with the paper.
          </p>

          <form
            className="flex gap-2 mb-8"
            onSubmit={(event) => {
              event.preventDefault();
              check(code);
            }}
          >
            <label htmlFor="statement-code" className="sr-only">
              Verification code
            </label>
            <input
              id="statement-code"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-mono uppercase tracking-wider"
              placeholder="XXXX-XXXX-XXXX"
              autoComplete="off"
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
            <button type="submit" disabled={checking || !code.trim()} className="rounded-lg bg-gray-900 px-5 py-3 text-white disabled:opacity-50">
              {checking ? "Checking…" : "Check"}
            </button>
          </form>

          {result && !result.valid ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <h2 className="text-lg font-medium text-red-900">
                {result.reason === "EXPIRED" ? "This code has expired" : "We didn't issue a statement with this code"}
              </h2>
              <p className="mt-1 text-red-800">
                {result.reason === "EXPIRED"
                  ? `Statement ${result.reference} can no longer be checked here. Ask the account holder for a new one.`
                  : "Check the code was typed correctly. If it was, don't rely on this statement."}
              </p>
            </div>
          ) : null}

          {result?.valid ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <h2 className="text-lg font-medium text-green-900">Genuine statement {result.reference}</h2>
              <p className="mt-1 mb-4 text-green-800">
                Issued by {result.issuer} on {day(result.issued_at)}. Compare these details with the paper; if any differ, it has been
                changed.
              </p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {[
                  ["Account holder", result.holder_name],
                  ["Account", result.account || "—"],
                  ["Period", `${day(result.start_date)} – ${day(result.end_date)}`],
                  ["Purpose", PURPOSE[result.purpose] || result.purpose],
                  ["Opening balance", ghs(result.opening_minor)],
                  ["Total debits", ghs(result.total_debit_minor)],
                  ["Total credits", ghs(result.total_credit_minor)],
                  ["Closing balance", ghs(result.closing_minor)],
                  ["Pages", result.page_count ?? "—"],
                  ["Can be checked until", day(result.verify_until)],
                ].map(([label, value]) => (
                  <React.Fragment key={label}>
                    <dt className="text-gray-600">{label}</dt>
                    <dd className="font-medium text-gray-900">{value}</dd>
                  </React.Fragment>
                ))}
              </dl>
              <div className="mt-5 border-t border-green-200 pt-4">
                <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="statement-file">
                  Have the PDF? Check the file too
                </label>
                <p className="text-sm text-gray-600 mb-2">It stays on your device. We compare its fingerprint with the one we issued.</p>
                <input id="statement-file" type="file" accept="application/pdf" onChange={onFile} className="text-sm" />
                {fileMatch === true ? <p className="mt-2 text-sm font-medium text-green-900">This file is exactly the one we issued.</p> : null}
                {fileMatch === false ? (
                  <p className="mt-2 text-sm font-medium text-red-800">This file is not the one we issued. It may have been edited or re-saved.</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default VerifyStatement;
