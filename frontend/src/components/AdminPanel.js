import React, { useState, useEffect } from "react";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../utils/api";
import "./AdminPanel.css";

const EMPTY_FORM = {
  name: "",
  category: "",
  platform: "amazon",
  price: "",
  originalPrice: "",
  imageUrl: "",
  rating: "",
  reviewCount: "",
  delivery: "",
  productUrl: "",
  brand: "",
};

export default function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await getAllProducts();
      setProducts(res.data.items || []);
    } catch {
      showMessage("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        const prev = products.find((p) => p.productId === editId);
        await updateProduct(editId, {
          ...form,
          previousPrice: prev?.price,
        });
        showMessage("✅ Product updated successfully!");
      } else {
        await createProduct(form);
        showMessage("✅ Product created successfully!");
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      loadProducts();
    } catch (err) {
      showMessage("❌ " + (err.response?.data?.error || "Operation failed"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name || "",
      category: product.category || "",
      platform: product.platform || "amazon",
      price: product.price || "",
      originalPrice: product.originalPrice || "",
      imageUrl: product.imageUrl || "",
      rating: product.rating || "",
      reviewCount: product.reviewCount || "",
      delivery: product.delivery || "",
      productUrl: product.productUrl || "",
      brand: product.brand || "",
    });
    setEditId(product.productId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      showMessage("🗑️ Product deleted.");
      loadProducts();
    } catch {
      showMessage("❌ Delete failed", "error");
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.platform?.includes(searchFilter.toLowerCase())
  );

  return (
    <div className="admin-panel container">
      <div className="admin-header">
        <h2>⚙️ Admin Panel</h2>
        <p className="admin-subtitle">
          Manage products · {products.length} total
        </p>
      </div>

      {message && (
        <div className={`admin-message ${message.type}`}>{message.text}</div>
      )}

      {/* ─── Form ─────────────────────────────────────────── */}
      <div className="admin-form-card">
        <h3>{editId ? "✏️ Edit Product" : "➕ Add New Product"}</h3>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nike Air Max 270"
                required
              />
            </div>

            <div className="form-group">
              <label>Brand</label>
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="Nike"
              />
            </div>

            <div className="form-group">
              <label>Platform *</label>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
              >
                <option value="amazon">Amazon</option>
                <option value="flipkart">Flipkart</option>
                <option value="myntra">Myntra</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="shoes"
              />
            </div>

            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="8999"
                required
              />
            </div>

            <div className="form-group">
              <label>Original Price (₹)</label>
              <input
                type="number"
                value={form.originalPrice}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                placeholder="12999"
              />
            </div>

            <div className="form-group">
              <label>Rating (0-5)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                placeholder="4.5"
              />
            </div>

            <div className="form-group">
              <label>Review Count</label>
              <input
                type="number"
                value={form.reviewCount}
                onChange={(e) => setForm({ ...form, reviewCount: e.target.value })}
                placeholder="1234"
              />
            </div>

            <div className="form-group full-width">
              <label>Image URL</label>
              <input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="form-group full-width">
              <label>Product URL</label>
              <input
                value={form.productUrl}
                onChange={(e) => setForm({ ...form, productUrl: e.target.value })}
                placeholder="https://www.amazon.in/..."
              />
            </div>

            <div className="form-group full-width">
              <label>Delivery Info</label>
              <input
                value={form.delivery}
                onChange={(e) => setForm({ ...form, delivery: e.target.value })}
                placeholder="Free delivery by Tomorrow"
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : editId ? "Update Product" : "Add Product"}
            </button>
            {editId && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setForm(EMPTY_FORM); setEditId(null); }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ─── Product List ──────────────────────────────────── */}
      <div className="admin-list">
        <div className="admin-list-header">
          <h3>All Products</h3>
          <input
            className="filter-input"
            placeholder="Filter by name or platform..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="admin-loading">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">No products found.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Platform</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.productId}>
                    <td>
                      <div className="table-product">
                        {p.imageUrl && (
                          <img src={p.imageUrl} alt={p.name} className="table-img" />
                        )}
                        <div>
                          <div className="table-name">{p.name}</div>
                          <div className="table-brand">{p.brand} · {p.category}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${p.platform}`}>
                        {p.platform}
                      </span>
                    </td>
                    <td>
                      <span className="table-price">₹{Number(p.price).toLocaleString("en-IN")}</span>
                      {p.originalPrice && (
                        <span className="table-original">₹{Number(p.originalPrice).toLocaleString("en-IN")}</span>
                      )}
                    </td>
                    <td>⭐ {p.rating}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-ghost" onClick={() => handleEdit(p)}>✏️ Edit</button>
                        <button className="btn btn-danger" onClick={() => handleDelete(p.productId, p.name)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
