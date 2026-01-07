import React from "react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const Features = () => {
  const featuresRef = useScrollAnimation({ threshold: 0.1 });

  const merchantPortalUrl =
    process.env.NODE_ENV === "production"
      ? "https://business.ottoafrica.com"
      : "http://localhost:3001";

  const features = [
    {
      title: "QR Code Payments",
      description:
        "Enable instant, contactless payments with QR codes. No physical cards needed—customers simply scan and pay. Ideal for retail stores, restaurants, and service businesses looking to streamline checkout.",
      image: "/img/Scan a Code.png",
      link: "/about/qr-payments",
      color: "otto-blue",
    },
    {
      title: "Digital Gift Cards",
      description:
        "Create, sell, and manage digital gift cards with custom designs and instant delivery. Increase sales and attract new customers with flexible gift card options that work for any business.",
      image: "/img/Card.png",
      link: "/about/gift-cards",
      color: "green-600",
    },
    {
      title: "Loyalty Programs",
      description:
        "Build lasting customer relationships with points, rewards, and personalized experiences. Drive repeat business and increase customer lifetime value through engaging loyalty programs.",
      image: "/img/Details.png",
      link: "/about/loyalty",
      color: "purple-600",
    },
  ];

  return (
    <section ref={featuresRef} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section - Question on left, description on right */}
        <div className="grid lg:grid-cols-2 gap-8 items-start mb-16">
          <div className="scroll-animate">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight">
              How would you like to grow?
            </h2>
          </div>
          <div className="flex flex-col items-end lg:items-start lg:pl-8">
            <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed max-w-lg scroll-animate delay-100">
              All your payment tools in one platform. Accept payments, manage
              gift cards, and build customer loyalty—all from a single
              dashboard.
            </p>
            <a
              href={merchantPortalUrl}
              className="inline-flex items-center gap-2 bg-otto-blue text-white px-6 py-3 rounded-lg hover:bg-black transition-all duration-300 font-medium text-base scroll-animate delay-200"
            >
              Start now
            </a>
          </div>
        </div>

        {/* Product Cards - Horizontal Layout */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group relative rounded-2xl overflow-hidden h-96 border border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all duration-300 scroll-animate flex flex-col"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Title Container - Top */}
              <div className="relative z-20 px-6 pt-6 pb-4">
                <h3 className="text-base md:text-lg font-medium text-gray-900 group-hover:text-otto-blue transition-colors">
                  {feature.title}
                  <span className="inline-block ml-2 transform group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </h3>
              </div>

              {/* Image - Right Side, Fills Height with Offset */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Background Pattern - Behind Images */}
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                  style={{
                    backgroundImage: `url('/img/background.png')`,
                  }}
                ></div>

                {/* Image Container */}
                <div className="absolute right-0 -top-10 -bottom-10 w-3/4">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-contain transform translate-x-8 translate-y-4 rotate-12 group-hover:rotate-3 transition-transform duration-300 opacity-70"
                    style={{ backgroundColor: "transparent" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />

                  {/* Overlay on Image - Fills the Box */}
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-white/40"></div>
                </div>
              </div>

              {/* Description Box - Bottom with Shadow and Spacing */}
              <div className="relative z-20 mx-4 mb-4 mt-auto bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  {/* Description Text */}
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
