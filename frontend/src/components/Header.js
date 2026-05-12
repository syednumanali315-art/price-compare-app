import React from "react";
import "./Header.css";

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">
            PriceCompare<span className="logo-accent">Hub</span>
          </span>
        </div>

        <nav className="nav">
          <button
            className={`nav-btn ${activeTab === "search" ? "active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            🔍 Search
          </button>
          <button
            className={`nav-btn ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => setActiveTab("admin")}
          >
            ⚙️ Admin
          </button>
        </nav>

        <div className="header-badges">
          <span className="platform-dot amazon">Amazon</span>
          <span className="platform-dot flipkart">Flipkart</span>
          <span className="platform-dot myntra">Myntra</span>
        </div>
      </div>
    </header>
  );
}
