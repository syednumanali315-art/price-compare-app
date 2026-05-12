import React, { useState } from "react";
import "./SearchBar.css";

const SUGGESTIONS = ["shoes", "laptop", "phone", "headphones", "watch", "t-shirt"];

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("all");
  const [sort, setSort] = useState("price_asc");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim(), { platform, sort });
  };

  const handleSuggestion = (s) => {
    setQuery(s);
    onSearch(s, { platform, sort });
  };

  return (
    <div className="search-section">
      <div className="search-hero">
        <h1 className="search-title">
          Find the <span className="highlight">Best Price</span>
        </h1>
        <p className="search-subtitle">
          Compare Amazon, Flipkart & Myntra instantly
        </p>
      </div>

      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search for shoes, laptops, phones..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button className="search-btn" type="submit" disabled={loading || !query.trim()}>
            {loading ? <span className="spinner" /> : "Compare →"}
          </button>
        </div>

        <div className="search-filters">
          <div className="filter-group">
            <label>Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option value="all">All Platforms</option>
              <option value="amazon">Amazon</option>
              <option value="flipkart">Flipkart</option>
              <option value="myntra">Myntra</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="price_asc">Lowest Price First</option>
              <option value="price_desc">Highest Price First</option>
              <option value="rating">Best Rating</option>
            </select>
          </div>
        </div>
      </form>

      <div className="suggestions">
        <span className="suggestions-label">Try:</span>
        {SUGGESTIONS.map((s) => (
          <button key={s} className="suggestion-chip" onClick={() => handleSuggestion(s)}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
