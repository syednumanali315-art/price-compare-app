import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import { searchProducts } from "../utils/api";
import "./SearchPage.css";

export default function SearchPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);

  const handleSearch = async (q, filters) => {
    setLoading(true);
    setError(null);
    setQuery(q);
    setSearched(true);
    try {
      const res = await searchProducts(q, filters);
      setResults(res.data.grouped || []);
    } catch (err) {
      setError("Search failed. Make sure the backend is running.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SearchBar onSearch={handleSearch} loading={loading} />

      <div className="container results-section">
        {loading && (
          <div className="results-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card skeleton-card">
                <div className="skeleton" style={{ height: 200 }} />
                <div style={{ padding: 18 }}>
                  <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 20, width: "80%", marginBottom: 16 }} />
                  <div className="skeleton" style={{ height: 60 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="error-box">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && !error && (
          <div className="no-results">
            <span className="no-results-icon">🔍</span>
            <h3>No results found for "{query}"</h3>
            <p>Try searching for: shoes, laptop, phone, headphones, watch</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="results-header">
              <h2>
                {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
                <span className="query-highlight">"{query}"</span>
              </h2>
              <p className="results-meta">
                Comparing prices across Amazon, Flipkart & Myntra
              </p>
            </div>
            <div className="results-grid">
              {results.map((product, i) => (
                <ProductCard key={i} product={product} />
              ))}
            </div>
          </>
        )}

        {!searched && !loading && (
          <div className="empty-state">
            <div className="platform-icons">
              <span className="pi amazon">A</span>
              <span className="pi flipkart">F</span>
              <span className="pi myntra">M</span>
            </div>
            <h3>Start comparing prices</h3>
            <p>Search for any product and instantly compare prices across 3 platforms</p>
            <div className="feature-list">
              <div className="feature">⚡ Real-time price comparison</div>
              <div className="feature">🏆 Best deal highlighted automatically</div>
              <div className="feature">🚚 Delivery info included</div>
              <div className="feature">⭐ Ratings & reviews</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
