import { getApiUrl } from "../config/env";

export const MOMO_NETWORKS = [
  { id: "MTN", label: "MTN" },
  { id: "AT", label: "AirtelTigo" },
  { id: "VOD", label: "Vodafone" },
];

export const POLL_INTERVAL_MS = 4000;
export const POLL_TIMEOUT_MS = 2 * 60 * 1000;

export function normalizeGhanaPhone(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (digits.startsWith("233")) {
    digits = `0${digits.slice(3)}`;
  }
  if (digits.length === 9 && !digits.startsWith("0")) {
    digits = `0${digits}`;
  }
  return digits;
}

export function isValidGhanaPhone(raw) {
  return /^0[235][0-9]{8}$/.test(normalizeGhanaPhone(raw));
}

export function detectNetworkFromPhone(raw) {
  const phone = normalizeGhanaPhone(raw);
  const prefix = phone.slice(0, 3);
  if (["024", "025", "053", "054", "055", "059"].includes(prefix)) {
    return "MTN";
  }
  if (["020", "050"].includes(prefix)) {
    return "VOD";
  }
  if (["026", "027", "056", "057"].includes(prefix)) {
    return "AT";
  }
  return "MTN";
}

export function maskPhone(raw) {
  const phone = normalizeGhanaPhone(raw);
  const last4 = phone.slice(-4).padStart(4, "0");
  return `••• ••• ${last4}`;
}

export function formatAmountMinor(amountMinor, currency = "GHS") {
  const major = Number(amountMinor) / 100;
  if (!Number.isFinite(major)) return null;
  return `${currency} ${major.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

async function parseApiResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.error === true) {
    throw new Error(
      payload?.message || "Something went wrong. Please try again.",
    );
  }
  return payload?.data ?? payload;
}

export async function fetchCollectSummary(collectId) {
  const response = await fetch(
    getApiUrl(`public/collect/${encodeURIComponent(collectId)}/summary`),
  );
  return parseApiResponse(response);
}

export async function initiateDirectDebit(collectId, { phone, network }) {
  const response = await fetch(
    getApiUrl(
      `public/collect/${encodeURIComponent(collectId)}/direct-debit/initiate`,
    ),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({ phone, network }),
    },
  );
  return parseApiResponse(response);
}

export async function fetchDirectDebitStatus(collectId, debitRequestId) {
  const query = new URLSearchParams({ debitRequestId });
  const response = await fetch(
    `${getApiUrl(
      `public/collect/${encodeURIComponent(collectId)}/direct-debit/status`,
    )}?${query.toString()}`,
  );
  return parseApiResponse(response);
}

export async function cancelDirectDebit(collectId, debitRequestId) {
  const response = await fetch(
    getApiUrl(
      `public/collect/${encodeURIComponent(collectId)}/direct-debit/cancel`,
    ),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ debitRequestId }),
    },
  );
  return parseApiResponse(response);
}
