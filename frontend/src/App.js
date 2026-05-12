import React, { useState } from "react";
import "./index.css";
import Header from "./components/Header";
import SearchPage from "./pages/SearchPage";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [activeTab, setActiveTab] = useState("search");

  return (
    <div>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        {activeTab === "search" ? (
          <SearchPage />
        ) : (
          <AdminPanel />
        )}
      </main>
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "24px 20px",
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "13px"
      }}>
        PriceCompareHub — Powered by AWS DynamoDB · Built with React + Node.js · Hosted on EC2
      </footer>
    </div>
  );
}
