import React from "react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const Hero = () => {
  const merchantPortalUrl =
    process.env.NODE_ENV === "production"
      ? "https://business.ottoafrica.com"
      : "http://localhost:3001";

  const heroRef = useScrollAnimation({ threshold: 0.1 });

  return (
    <section
      ref={heroRef}
      className="relative bg-white pt-40 pb-40 md:pt-48 md:pb-48 lg:pt-56 lg:pb-64 overflow-hidden min-h-[75vh] md:min-h-[80vh]"
    >
      {/* Vertical lines pattern behind background.png */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(8deg, transparent, transparent 2px, rgba(27, 51, 89, 0.03) 10px, rgba(27, 51, 89, 0.03) 8px)`,
        }}
      ></div>

      {/* Full background pattern like Cowrywise */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/img/background.png')`,
          opacity: 0.2,
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline - Benefit-focused like Cowrywise */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 leading-tight scroll-animate">
            Watch your payments
            <span className="block text-otto-blue font-medium">do more.</span>
          </h1>

          {/* Sub-headline - Clear value prop */}
          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed scroll-animate delay-100">
            One platform. All your payment needs. Trusted by businesses,
            merchants, and enterprises across Africa.
          </p>

          {/* Primary CTA - Action-oriented */}
          <div className="scroll-animate delay-200">
            <a
              href={merchantPortalUrl}
              className="inline-flex items-center gap-2 bg-otto-blue text-white px-8 py-4 rounded-lg hover:bg-black transition-all duration-300 font-semibold text-lg"
            >
              Start growing now
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
