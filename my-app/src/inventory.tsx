import React, { useState, useEffect } from "react";
import axios from "axios";
import "./inventory.css";

function Inventory() {
  const today = new Date().toISOString().split("T")[0];

  const [rows, setRows] = useState([
    { product: "", stockIn: "", stockOut: "", available: 0 }
  ]);

  const [history, setHistory] = useState([]);
  const [locked, setLocked] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [date, setDate] = useState(today);

  // 🔷 FETCH HISTORY
  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://159.65.94.152/api/inventory/");
      
      // ✅ Force update (important)
      setHistory([...res.data]);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 🔷 HANDLE INPUT
  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;

    const stockIn = Number(updated[index].stockIn) || 0;
    const stockOut = Number(updated[index].stockOut) || 0;

    let available = stockIn - stockOut;

    // 🚫 PREVENT NEGATIVE
    if (available < 0) {
      alert("Stock cannot be negative!");
      updated[index].stockOut = "";
      available = stockIn;
    }

    updated[index].available = available;

    setRows(updated);
  };

  // 🔷 ADD ROW
  const addRow = () => {
    setRows([
      ...rows,
      { product: "", stockIn: "", stockOut: "", available: 0 }
    ]);
  };

  // 🔷 DELETE ROW
  const deleteRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  // 🔷 SAVE DATA (WITH DATE FIX)
  const saveData = async () => {
    try {
      // ✅ Ensure correct format
      const formattedDate = new Date(date).toISOString().split("T")[0];

      console.log("Saving date:", formattedDate);

      await axios.post("http://159.65.94.152/api/inventory/save/", {
        date: formattedDate,
        rows
      });

      alert("Saved!");
      setLocked(true);

      // 🔥 CARRY FORWARD
      const nextRows = rows.map(row => ({
        product: row.product,
        stockIn: row.available,
        stockOut: "",
        available: row.available
      }));

      setRows(nextRows);

      // 🔥 NEXT DAY
      const nextDay = new Date(formattedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setDate(nextDay.toISOString().split("T")[0]);

      fetchHistory();

    } catch (err) {
      alert("Error saving");
      console.log(err);
    }
  };

  // 🔷 ENABLE EDIT
  const enableEdit = () => {
    setLocked(false);
  };

  // 🔷 GROUP HISTORY
  const groupedHistory = history
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = [];
      acc[item.date].push(item);
      return acc;
    }, {});

  return (
    <div className="inventory-page">
      <div className="inventory-box">
        <h2>Inventory</h2>

        {/* DATE */}
        <div className="date-box">
          <label>Date:</label>
          <input
            type="date"
            value={date}
            disabled={locked}
            onChange={(e) => {
              const selected = new Date(e.target.value);
              const formatted = selected.toISOString().split("T")[0];
              setDate(formatted);
            }}
          />
        </div>

 {/* TABLE */}
<div className="table-wrapper">
  <table className="inventory-table">
    <thead>
      <tr>
        <th className="product-col">Product</th>
        <th className="stock-in-col">IN</th>
        <th className="stock-out-col">OUT</th>
        <th className="available-col">AVL</th>
        <th className="delete-col">DEL</th>
      </tr>
    </thead>

    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>
          <td>
            <input
              value={row.product}
              disabled={locked}
              onChange={(e) =>
                handleChange(i, "product", e.target.value)
              }
            />
          </td>

          <td>
            <input
              type="number"
              value={row.stockIn}
              disabled={locked}
              onChange={(e) =>
                handleChange(i, "stockIn", e.target.value)
              }
            />
          </td>

          <td>
            <input
              type="number"
              value={row.stockOut}
              disabled={locked}
              onChange={(e) =>
                handleChange(i, "stockOut", e.target.value)
              }
            />
          </td>

          <td className="available">
            {row.available}
          </td>

          <td>
            {!locked && (
              <button
                className="delete-btn"
                onClick={() => deleteRow(i)}
              >
                🗑
              </button>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>

</div>

        {/* ADD */}
        {!locked && (
          <button className="add-btn" onClick={addRow}>
            ➕ Add Row
          </button>
        )}

        {/* ACTIONS */}
        <div className="bottom-actions">
          <button onClick={saveData}>💾 Save</button>
          <button onClick={enableEdit}>✏️ Edit</button>
        </div>

        {/* HISTORY */}
        <div className="history">
          <button onClick={() => setShowHistory(!showHistory)}>
            📂 View History
          </button>

          {showHistory && (
            <div className="history-box">
              {Object.entries(groupedHistory).map(([dateKey, items], i) => (
                <div key={i} className="history-day">
                  
                  {/* ✅ NICE DATE FORMAT */}
                  <h3 className="history-date">
                    {new Date(dateKey).toLocaleDateString()}
                  </h3>

                  <div className="table-wrapper">

                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Stock In</th>
                        <th>Stock Out</th>
                        <th>Available</th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((item, j) => (
                        <tr key={j}>
                          <td>{item.product}</td>
                          <td>{item.stockIn}</td>
                          <td>{item.stockOut}</td>
                          <td>{item.available}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}


export default Inventory;







