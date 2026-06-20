import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import SEO from "../components/SEO";
import OttoIcon from "../components/OttoIcon";
import {
  attemptOpenCustomerApp,
  buildPayDeepLink,
  getDeviceOS,
  getStoreUrlForOS,
  isMobileDevice,
  redirectToStoreForDevice,
} from "../utils/openCustomerApp";
import {
  CUSTOMER_ANDROID_APP_URL,
  CUSTOMER_IOS_APP_URL,
} from "../utils/customerAppStoreUrls";
import "./GiftCardShare.css";

const PayPage = () => {
  const { qrId } = useParams();
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount") || "";

  const [phase, setPhase] = useState("opening"); // opening | store | desktop
  const cleanupRef = useRef(null);

  const deviceOS = useMemo(() => getDeviceOS(), []);
  const isMobile = isMobileDevice();

  const deepLink = useMemo(
    () => (qrId ? buildPayDeepLink(qrId, amount) : ""),
    [qrId, amount],
  );

  const storeUrl = getStoreUrlForOS(deviceOS);

  useEffect(() => {
    if (!isMobile || !qrId || !deepLink) {
      setPhase("desktop");
      return undefined;
    }

    cleanupRef.current = attemptOpenCustomerApp({
      deepLink,
      onAppOpened: () => {
        setPhase("opening");
      },
      onFallback: () => {
        setPhase("store");
        window.setTimeout(() => redirectToStoreForDevice(), 1200);
      },
    });

    return () => {
      cleanupRef.current?.();
    };
  }, [deepLink, isMobile, qrId]);

  const retryOpenApp = () => {
    if (!deepLink) return;
    cleanupRef.current?.();
    setPhase("opening");
    cleanupRef.current = attemptOpenCustomerApp({
      deepLink,
      onAppOpened: () => setPhase("opening"),
      onFallback: () => {
        setPhase("store");
        window.setTimeout(() => redirectToStoreForDevice(), 1200);
      },
    });
  };

  const amountDisplay = amount
    ? `GHS ${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : null;

  if (phase === "opening" && isMobile && qrId) {
    return (
      <div className="gift-card-share-container">
        <div className="gift-card-share-content">
          <div className="gift-card-celebrate">💳</div>
          <div className="loading-spinner"></div>
          <h2>Opening Otto…</h2>
          <p>
            {amountDisplay
              ? `Taking you to pay ${amountDisplay}`
              : "Taking you to the app to complete your payment"}
          </p>
        </div>
      </div>
    );
  }

  if (phase === "store" && isMobile) {
    return (
      <>
        <SEO
          title="Pay with Otto – Otto Africa"
          description="Download Otto to complete your payment."
          keywords="pay, Otto, payment, Ghana"
          url={`https://ottoafrica.com/pay/${qrId || ""}${amount ? `?amount=${amount}` : ""}`}
        />
        <div className="gift-card-share-container">
          <div className="gift-card-share-content">
            <img
              src="/img/logos/Favicon - Black@4x-8.png"
              alt="Otto"
              className="gift-card-share-logo"
            />
            <h1>Get Otto to pay</h1>
            {amountDisplay && (
              <p className="gift-card-sender">Amount: {amountDisplay}</p>
            )}
            <p className="subhead">
              Otto isn&apos;t installed on this device. We&apos;re sending you
              to the {deviceOS === "ios" ? "App Store" : "Google Play"} to
              download it — then open this link again to pay.
            </p>
            <div className="download-section">
              <div className="download-primary">
                <a
                  href={storeUrl || CUSTOMER_IOS_APP_URL}
                  className="download-btn-primary"
                >
                  {deviceOS === "ios"
                    ? "Continue to App Store"
                    : "Continue to Google Play"}
                </a>
              </div>
              <button
                type="button"
                className="gift-card-try-app-btn"
                onClick={retryOpenApp}
              >
                Already installed? Open Otto
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Pay with Otto – Otto Africa"
        description="Complete your payment in the Otto app. Download Otto to pay with gift cards, mobile money, and more."
        keywords="pay, Otto, payment, scan to pay"
        url={`https://ottoafrica.com/pay/${qrId || ""}${amount ? `?amount=${amount}` : ""}`}
      />
      <div className="gift-card-share-container">
        <div className="gift-card-share-content">
          <img
            src="/img/logos/Favicon - Black@4x-8.png"
            alt="Otto"
            className="gift-card-share-logo"
          />
          <h1>Pay with Otto</h1>
          <p className="gift-card-sender">
            {amountDisplay
              ? `Amount: ${amountDisplay}`
              : "Scan to pay this merchant"}
          </p>
          <p className="subhead">
            Open the Otto app on your phone to choose your payment method and
            complete the payment.
          </p>

          <div className="benefits benefits-with-icons">
            <div className="benefit-item">
              <span className="benefit-icon" aria-hidden>
                <OttoIcon name="credit-card-outline" size={20} />
              </span>
              <span>
                <strong>Gift cards, mobile money & more</strong> – Choose how
                you pay
              </span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon" aria-hidden>
                <OttoIcon name="smartphone-outline" size={20} />
              </span>
              <span>
                <strong>Quick & secure</strong> – Pay in a few taps
              </span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon" aria-hidden>
                <OttoIcon name="shield-outline" size={20} />
              </span>
              <span>
                <strong>Safe</strong> – Your details stay protected
              </span>
            </div>
          </div>

          <div className="download-section">
            <div className="download-primary">
              <a
                href={CUSTOMER_IOS_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="download-btn-secondary"
              >
                Download for iOS
              </a>
              <a
                href={CUSTOMER_ANDROID_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="download-btn-secondary"
              >
                Download for Android
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PayPage;
