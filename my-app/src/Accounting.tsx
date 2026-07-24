import { useNavigate } from "react-router-dom";
import "./Accounting.css";

function Accounting() {
  const navigate = useNavigate();

  return (
    <div className="accounting-container">

      {/* Header */}
      <div className="accounting-header">
        <h1>Accounting Department</h1>
        <p>Manage suppliers, expenses and financial records.</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">

        <div className="summary-card">
          <h3>Today's Expenses</h3>
          <span>₦0.00</span>
        </div>

        <div className="summary-card">
          <h3>This Month</h3>
          <span>₦0.00</span>
        </div>

        <div className="summary-card">
          <h3>Suppliers</h3>
          <span>0</span>
        </div>

        <div className="summary-card">
          <h3>Expense Items</h3>
          <span>0</span>
        </div>

      </div>

      {/* Modules */}
      <h2 className="section-title">Accounting Modules</h2>

      <div className="module-grid">

        <div
          className="module-card"
          onClick={() => navigate("/suppliers")}
        >
          <h3>Suppliers</h3>
          <p>Manage supplier information.</p>
        </div>

        <div
          className="module-card"
          onClick={() => navigate("/expense-items")}
        >
          <h3>Expense Items</h3>
          <p>Manage goods and services.</p>
        </div>

        <div
          className="module-card"
          onClick={() => navigate("/expenses")}
        >
          <h3>Expenses</h3>
          <p>Record all expenses.</p>
        </div>

        <div
          className="module-card"
          onClick={() => navigate("/reports")}
        >
          <h3>Reports</h3>
          <p>Daily, monthly and yearly reports.</p>
        </div>

        <div
          className="module-card"
          onClick={() => navigate("/profit-loss")}
        >
          <h3>Profit & Loss</h3>
          <p>Financial analysis.</p>
        </div>

      </div>

    </div>
  );
}

export default Accounting;