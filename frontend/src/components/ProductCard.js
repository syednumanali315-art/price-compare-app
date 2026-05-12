import React, { useState } from "react";
import "./ProductCard.css";

const PLATFORM_COLORS = {
  amazon: { label: "Amazon", color: "#ff9900", emoji: "🛒" },
  flipkart: { label: "Flipkart", color: "#2874f0", emoji: "🔵" },
  myntra: { label: "Myntra", color: "#ff3f6c", emoji: "👗" },
};

function StarRating({ rating }) {
  return (
    <span className="star-rating">
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
      <span className="rating-num">{rating}</span>
    </span>
  );
}

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);

  const platforms = product.platforms || [];
  const bestPlatform = platforms[0]; // already sorted by price

  return (
    <div className="product-card fade-in">
      <div className="product-image-wrap">
        {!imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-image"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="product-image-placeholder">
            <span>📦</span>
          </div>
        )}
        {bestPlatform && (
          <div className="best-deal-badge">
            🏆 Best Deal
          </div>
        )}
      </div>

      <div className="product-info">
        <p className="product-brand">{product.brand}</p>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-category">{product.category}</p>

        <div className="price-range">
          <span className="price-low">₹{(product.lowestPrice || 0).toLocaleString("en-IN")}</span>
          {product.highestPrice && product.highestPrice !== product.lowestPrice && (
            <>
              <span className="price-dash">—</span>
              <span className="price-high">₹{product.highestPrice.toLocaleString("en-IN")}</span>
            </>
          )}
        </div>

        <div className="platforms-list">
          {platforms.map((p, i) => {
            const config = PLATFORM_COLORS[p.platform] || {};
            const isBest = i === 0;
            return (
              <div key={p.productId} className={`platform-row ${isBest ? "best" : ""}`}>
                <div className="platform-left">
                  <span
                    className="platform-name"
                    style={{ color: config.color }}
                  >
                    {config.emoji} {config.label}
                  </span>
                  {isBest && <span className="cheapest-tag">LOWEST</span>}
                </div>

                <div className="platform-middle">
                  <StarRating rating={p.rating} />
                  <span className="review-count">({p.reviewCount?.toLocaleString()})</span>
                </div>

                <div className="platform-right">
                  <div className="platform-price-block">
                    <span className="platform-price">
                      ₹{p.price.toLocaleString("en-IN")}
                    </span>
                    {p.originalPrice && p.originalPrice > p.price && (
                      <>
                        <span className="original-price">
                          ₹{p.originalPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="discount-tag">{p.discount}% OFF</span>
                      </>
                    )}
                  </div>
                  <span className="delivery-info">🚚 {p.delivery}</span>
                </div>

                <a
                  href={p.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="buy-btn"
                  style={{ background: config.color }}
                >
                  Buy Now ↗
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
