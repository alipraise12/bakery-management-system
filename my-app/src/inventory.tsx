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
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Stock In</th>
              <th>Stock Out</th>
              <th>Available</th>
              <th>Delete</th>
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

                <td className="available">{row.available}</td>

                <td>
                  {!locked && (
                    <button onClick={() => deleteRow(i)}>🗑</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Inventory;







// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./inventory.css";

// function Inventory() {
//   const today = new Date().toISOString().split("T")[0];

//   const [rows, setRows] = useState([
//     { product: "", stockIn: "", stockOut: "", available: 0 }
//   ]);

//   const [history, setHistory] = useState([]);
//   const [locked, setLocked] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [date, setDate] = useState(today);

//   // 🔷 FETCH HISTORY
//   const fetchHistory = async () => {
//     try {
//       const res = await axios.get("http://159.65.94.152/api/inventory/");
//       setHistory(res.data);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   // 🔷 HANDLE INPUT
//   const handleChange = (index, field, value) => {
//     const updated = [...rows];
//     updated[index][field] = value;

//     const stockIn = Number(updated[index].stockIn) || 0;
//     const stockOut = Number(updated[index].stockOut) || 0;

//     let available = stockIn - stockOut;

//     // 🚫 PREVENT NEGATIVE
//     if (available < 0) {
//       alert("Stock cannot be negative!");
//       updated[index].stockOut = "";
//       available = stockIn;
//     }

//     updated[index].available = available;

//     setRows(updated);
//   };

//   // 🔷 ADD ROW
//   const addRow = () => {
//     setRows([
//       ...rows,
//       { product: "", stockIn: "", stockOut: "", available: 0 }
//     ]);
//   };

//   // 🔷 DELETE ROW
//   const deleteRow = (index) => {
//     setRows(rows.filter((_, i) => i !== index));
//   };

//   // 🔷 SAVE DATA (🔥 FIXED CARRY FORWARD)
//   const saveData = async () => {
//     try {
//       await axios.post("http://159.65.94.152/api/inventory/save/", {
//         date,
//         rows
//       });

//       alert("Saved!");
//       setLocked(true);

//       // 🔥 CARRY FORWARD (YOUR EXACT LOGIC)
//       const nextRows = rows.map(row => ({
//         product: row.product,
//         stockIn: row.available,   // ✅ available becomes next day stockIn
//         stockOut: "",
//         available: row.available
//       }));

//       setRows(nextRows);

//       // 🔥 MOVE TO NEXT DAY
//       const nextDay = new Date(date);
//       nextDay.setDate(nextDay.getDate() + 1);
//       setDate(nextDay.toISOString().split("T")[0]);

//       // 🔥 REFRESH HISTORY
//       fetchHistory();

//     } catch (err) {
//       alert("Error saving");
//       console.log(err);
//     }
//   };

//   // 🔷 ENABLE EDIT
//   const enableEdit = () => {
//     setLocked(false);
//   };

//   // 🔷 GROUP HISTORY
//   const groupedHistory = history
//     .sort((a, b) => new Date(b.date) - new Date(a.date))
//     .reduce((acc, item) => {
//       if (!acc[item.date]) acc[item.date] = [];
//       acc[item.date].push(item);
//       return acc;
//     }, {});

//   return (
//     <div className="inventory-page">
//       <div className="inventory-box">
//         <h2>Inventory</h2>

//         {/* DATE */}
//         <div className="date-box">
//           <label>Date:</label>
//           <input
//             type="date"
//             value={date}
//             disabled={locked}
//             onChange={(e) => setDate(e.target.value)}
//           />
//         </div>

//         {/* TABLE */}
//         <table>
//           <thead>
//             <tr>
//               <th>Product</th>
//               <th>Stock In</th>
//               <th>Stock Out</th>
//               <th>Available</th>
//               <th>Delete</th>
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map((row, i) => (
//               <tr key={i}>
//                 <td>
//                   <input
//                     value={row.product}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(i, "product", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td>
//                   <input
//                     type="number"
//                     value={row.stockIn}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(i, "stockIn", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td>
//                   <input
//                     type="number"
//                     value={row.stockOut}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(i, "stockOut", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td className="available">{row.available}</td>

//                 <td>
//                   {!locked && (
//                     <button onClick={() => deleteRow(i)}>🗑</button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* ADD */}
//         {!locked && (
//           <button className="add-btn" onClick={addRow}>
//             ➕ Add Row
//           </button>
//         )}

//         {/* ACTIONS */}
//         <div className="bottom-actions">
//           <button onClick={saveData}>💾 Save</button>
//           <button onClick={enableEdit}>✏️ Edit</button>
//         </div>

//         {/* HISTORY */}
//         <div className="history">
//           <button onClick={() => setShowHistory(!showHistory)}>
//             📂 View History
//           </button>

//           {showHistory && (
//             <div className="history-box">
//               {Object.entries(groupedHistory).map(([dateKey, items], i) => (
//                 <div key={i} className="history-day">
//                   <h3 className="history-date">{dateKey}</h3>

//                   <table>
//                     <thead>
//                       <tr>
//                         <th>Product</th>
//                         <th>Stock In</th>
//                         <th>Stock Out</th>
//                         <th>Available</th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {items.map((item, j) => (
//                         <tr key={j}>
//                           <td>{item.product}</td>
//                           <td>{item.stockIn}</td>
//                           <td>{item.stockOut}</td>
//                           <td>{item.available}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }

// export default Inventory;















// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./inventory.css";

// function Inventory() {
//   const today = new Date().toISOString().split("T")[0];

//   const [rows, setRows] = useState([
//     { product: "", stockIn: "", stockOut: "", available: 0 }
//   ]);

//   const [history, setHistory] = useState([]);
//   const [locked, setLocked] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [date, setDate] = useState(today);

//   // 🔷 FETCH HISTORY
//   const fetchHistory = async () => {
//     const res = await axios.get("http://159.65.94.152/api/inventory/");
//     setHistory(res.data);
//   };

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   // 🔷 HANDLE INPUT (FIXED LOGIC)
//   const handleChange = (index, field, value) => {
//     const updated = [...rows];
//     updated[index][field] = value;

//     const previousAvailable = Number(updated[index].available) || 0;
//     const stockIn = Number(updated[index].stockIn) || 0;
//     const stockOut = Number(updated[index].stockOut) || 0;

//     // 🔥 FIX: MATCH BACKEND LOGIC
//     updated[index].available = previousAvailable + stockIn - stockOut;

//     setRows(updated);
//   };

//   // 🔷 ADD ROW
//   const addRow = () => {
//     setRows([
//       ...rows,
//       { product: "", stockIn: "", stockOut: "", available: 0 }
//     ]);
//   };

//   // 🔷 DELETE ROW
//   const deleteRow = (index) => {
//     setRows(rows.filter((_, i) => i !== index));
//   };

//   // 🔷 SAVE DATA
//   const saveData = async () => {
//     try {
//       await axios.post("http://159.65.94.152/api/inventory/save/", {
//         date,
//         rows
//       });

//       alert("Saved!");
//       setLocked(true);

//       // 🔥 CARRY FORWARD (VERY IMPORTANT)
//       const nextRows = rows.map(row => ({
//         product: row.product,
//         stockIn: "",
//         stockOut: "",
//         available: row.available // carry forward
//       }));

//       setRows(nextRows);

//       // 🔥 MOVE TO NEXT DAY
//       const nextDay = new Date(date);
//       nextDay.setDate(nextDay.getDate() + 1);
//       setDate(nextDay.toISOString().split("T")[0]);

//       fetchHistory();

//     } catch (err) {
//       alert("Error saving");
//       console.log(err);
//     }
//   };

//   // 🔷 ENABLE EDIT
//   const enableEdit = () => {
//     setLocked(false);
//   };

//   // 🔷 GROUP HISTORY BY DATE (FIXED SORT)
//   const groupedHistory = history
//     .sort((a, b) => new Date(b.date) - new Date(a.date))
//     .reduce((acc, item) => {
//       if (!acc[item.date]) acc[item.date] = [];
//       acc[item.date].push(item);
//       return acc;
//     }, {});

//   return (
//     <div className="inventory-page">
//       <div className="inventory-box">
//         <h2>Inventory</h2>

//         {/* DATE */}
//         <div className="date-box">
//           <label>Date:</label>
//           <input
//             type="date"
//             value={date}
//             disabled={locked}
//             onChange={(e) => setDate(e.target.value)}
//           />
//         </div>

//         {/* TABLE */}
//         <table>
//           <thead>
//             <tr>
//               <th>Product</th>
//               <th>Stock In</th>
//               <th>Stock Out</th>
//               <th>Available</th>
//               <th>Delete</th>
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map((row, i) => (
//               <tr key={i}>
//                 <td>
//                   <input
//                     value={row.product}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(i, "product", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td>
//                   <input
//                     type="number"
//                     value={row.stockIn}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(i, "stockIn", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td>
//                   <input
//                     type="number"
//                     value={row.stockOut}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(i, "stockOut", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td className="available">{row.available}</td>

//                 <td>
//                   {!locked && (
//                     <button onClick={() => deleteRow(i)}>🗑</button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* ADD */}
//         {!locked && (
//           <button className="add-btn" onClick={addRow}>
//             ➕ Add Row
//           </button>
//         )}

//         {/* ACTIONS */}
//         <div className="bottom-actions">
//           <button onClick={saveData}>💾 Save</button>
//           <button onClick={enableEdit}>✏️ Edit</button>
//         </div>

//         {/* HISTORY */}
//         <div className="history">
//           <button onClick={() => setShowHistory(!showHistory)}>
//             📂 View History
//           </button>

//           {showHistory && (
//             <div className="history-box">
//               {Object.entries(groupedHistory).map(([dateKey, items], i) => (
//                 <div key={i} className="history-day">
//                   <h3 className="history-date">{dateKey}</h3>

//                   <table>
//                     <thead>
//                       <tr>
//                         <th>Product</th>
//                         <th>Stock In</th>
//                         <th>Stock Out</th>
//                         <th>Available</th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {items.map((item, j) => (
//                         <tr key={j}>
//                           <td>{item.product}</td>
//                           <td>{item.stockIn}</td>
//                           <td>{item.stockOut}</td>
//                           <td>{item.available}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }

// export default Inventory;



// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./inventory.css";

// function Inventory() {
//   const today = new Date().toISOString().split("T")[0];

//   const [rows, setRows] = useState([
//     { product: "", stockIn: "", stockOut: "", available: "" }
//   ]);

//   const [history, setHistory] = useState([]);
//   const [locked, setLocked] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [date, setDate] = useState(today);

//   // 🔷 FETCH HISTORY
//   const fetchHistory = async () => {
//     const res = await axios.get("http://159.65.94.152/api/inventory/");
//     setHistory(res.data);
//   };

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   // 🔷 HANDLE INPUT
//   const handleChange = (index, field, value) => {
//     const updated = [...rows];
//     updated[index][field] = value;

//     const stockIn = Number(updated[index].stockIn) || 0;
//     const stockOut = Number(updated[index].stockOut) || 0;

//     updated[index].available = stockIn - stockOut;

//     setRows(updated);
//   };

//   // 🔷 ADD ROW
//   const addRow = () => {
//     setRows([
//       ...rows,
//       { product: "", stockIn: "", stockOut: "", available: "" }
//     ]);
//   };

//   // 🔷 DELETE ROW
//   const deleteRow = (index) => {
//     setRows(rows.filter((_, i) => i !== index));
//   };

//   // 🔷 SAVE (FIXED LOGIC)
//   const saveData = async () => {
//     try {
//       await axios.post("http://159.65.94.152/api/inventory/save/", {
//         date,
//         rows
//       });

//       alert("Saved!");
//       setLocked(true);

//       // 🔥 KEEP TABLE, JUST MOVE AVAILABLE → NEXT DAY STOCK IN
//       const nextRows = rows.map(row => ({
//         product: row.product,
//         stockIn: row.available,   // carry forward
//         stockOut: "",
//         available: row.available
//       }));

//       setRows(nextRows);

//       // 🔥 MOVE DATE TO NEXT DAY
//       const nextDay = new Date(date);
//       nextDay.setDate(nextDay.getDate() + 1);
//       setDate(nextDay.toISOString().split("T")[0]);

//       fetchHistory();

//     } catch (err) {
//       alert("Error saving");
//       console.log(err);
//     }
//   };

//   // 🔷 ENABLE EDIT
//   const enableEdit = () => {
//     setLocked(false);
//   };

//   // 🔷 GROUP BY DATE
//   const groupedHistory = history.reduce((acc, item) => {
//     if (!acc[item.date]) acc[item.date] = [];
//     acc[item.date].push(item);
//     return acc;
//   }, {});

//   return (
//     <div className="inventory-page">
//       <div className="inventory-box">
//         <h2>Inventory</h2>

//         {/* DATE */}
//         <div className="date-box">
//           <label>Date:</label>
//           <input
//             type="date"
//             value={date}
//             disabled={locked}
//             onChange={(e) => setDate(e.target.value)}
//           />
//         </div>

//         {/* TABLE */}
//         <table>
//           <thead>
//             <tr>
//               <th>Product</th>
//               <th>Stock In</th>
//               <th>Stock Out</th>
//               <th>Available</th>
//               <th>Delete</th>
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map((row, i) => (
//               <tr key={i}>
//                 <td>
//                   <input
//                     value={row.product}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(i, "product", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td>
//                   <input
//                     type="number"
//                     value={row.stockIn}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(i, "stockIn", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td>
//                   <input
//                     type="number"
//                     value={row.stockOut}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(i, "stockOut", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td className="available">{row.available}</td>

//                 <td>
//                   {!locked && (
//                     <button onClick={() => deleteRow(i)}>🗑</button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* ADD */}
//         {!locked && (
//           <button className="add-btn" onClick={addRow}>
//             ➕ Add Row
//           </button>
//         )}

//         {/* ACTIONS */}
//         <div className="bottom-actions">
//           <button onClick={saveData}>💾 Save</button>
//           <button onClick={enableEdit}>✏️ Edit</button>
//         </div>

//         {/* HISTORY */}
//         <div className="history">
//           <button onClick={() => setShowHistory(!showHistory)}>
//             📂 View History
//           </button>

//           {showHistory && (
//             <div className="history-box">

//               {Object.keys(groupedHistory).map((dateKey, i) => (
//                 <div key={i} className="history-day">

//                   {/* 🔥 DATE ABOVE EACH TABLE */}
//                   <h3 className="history-date">{dateKey}</h3>

//                   <table>
//                     <thead>
//                       <tr>
//                         <th>Product</th>
//                         <th>Stock In</th>
//                         <th>Stock Out</th>
//                         <th>Available</th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {groupedHistory[dateKey].map((item, j) => (
//                         <tr key={j}>
//                           <td>{item.product}</td>
//                           <td>{item.stockIn}</td>
//                           <td>{item.stockOut}</td>
//                           <td>{item.available}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>

//                 </div>
//               ))}

//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }

// export default Inventory;









// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./inventory.css";

// function Inventory() {
//   const today = new Date().toISOString().split("T")[0];

//   const [rows, setRows] = useState([
//     { product: "", stockIn: "", stockOut: "", available: "" }
//   ]);

//   const [history, setHistory] = useState([]);
//   const [locked, setLocked] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [date, setDate] = useState(today);

//   // 🔷 FETCH HISTORY
//   const fetchHistory = async () => {
//     try {
//       const res = await axios.get("http://159.65.94.152/api/inventory/");
//       setHistory(res.data);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   // 🔷 HANDLE INPUT
//   const handleChange = (index, field, value) => {
//     const updated = [...rows];
//     updated[index][field] = value;

//     const stockIn = Number(updated[index].stockIn) || 0;
//     const stockOut = Number(updated[index].stockOut) || 0;

//     updated[index].available = stockIn - stockOut;

//     setRows(updated);
//   };

//   // 🔷 ADD ROW
//   const addRow = () => {
//     setRows([
//       ...rows,
//       { product: "", stockIn: "", stockOut: "", available: "" }
//     ]);
//   };

//   // 🔷 DELETE ROW
//   const deleteRow = (index) => {
//     const updated = rows.filter((_, i) => i !== index);
//     setRows(updated);
//   };

//   // 🔷 SAVE
//   const saveData = async () => {
//     try {
//       await axios.post("http://159.65.94.152/api/inventory/save/", {
//         date: date,
//         rows: rows
//       });

//       alert("Saved to database!");
//       setLocked(true);

//       // 🔥 CLEAR INPUT (backend handles carry-forward)
//       setRows([
//         { product: "", stockIn: "", stockOut: "", available: "" }
//       ]);

//       fetchHistory();

//     } catch (error) {
//       alert("Error saving data");
//       console.log(error);
//     }
//   };

//   // 🔷 ENABLE EDIT
//   const enableEdit = () => {
//     setLocked(false);
//   };

//   // 🔷 GROUP HISTORY BY DATE
//   const groupByDate = () => {
//     const grouped = {};

//     history.forEach(item => {
//       if (!grouped[item.date]) {
//         grouped[item.date] = [];
//       }
//       grouped[item.date].push(item);
//     });

//     return grouped;
//   };

//   const groupedHistory = groupByDate();

//   return (
//     <div className="inventory-page">

//       <div className="inventory-box">
//         <h2>Inventory</h2>

//         {/* DATE */}
//         <div className="date-box">
//           <label>Date:</label>
//           <input
//             type="date"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             disabled={locked}
//           />
//         </div>

//         {/* TABLE */}
//         <table>
//           <thead>
//             <tr>
//               <th>Product Name</th>
//               <th>Stock In</th>
//               <th>Stock Out</th>
//               <th>Available Stock</th>
//               <th>Delete</th>
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map((row, index) => (
//               <tr key={index}>
//                 <td>
//                   <input
//                     value={row.product}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(index, "product", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td>
//                   <input
//                     type="number"
//                     value={row.stockIn}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(index, "stockIn", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td>
//                   <input
//                     type="number"
//                     value={row.stockOut}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(index, "stockOut", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td className="available">
//                   {row.available}
//                 </td>

//                 <td>
//                   {!locked && (
//                     <button
//                       className="delete-btn"
//                       onClick={() => deleteRow(index)}
//                     >
//                       🗑
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* ADD ROW */}
//         {!locked && (
//           <button className="add-btn" onClick={addRow}>
//             ➕ Add Row
//           </button>
//         )}

//         {/* ACTIONS */}
//         <div className="bottom-actions">
//           <button className="save-btn" onClick={saveData}>
//             💾 Save
//           </button>
//           <button className="edit-btn" onClick={enableEdit}>
//             ✏️ Edit
//           </button>
//         </div>

//         {/* HISTORY */}
//         <div className="history">
//           <button
//             className="history-toggle"
//             onClick={() => setShowHistory(!showHistory)}
//           >
//             📂 View History
//           </button>

//           {showHistory && (
//             <div className="history-box">

//               {Object.keys(groupedHistory).map((dateKey, i) => (
//                 <div key={i} className="history-group">

//                   {/* 🔥 DATE HEADER */}
//                   <h4 className="history-date">{dateKey}</h4>

//                   <table>
//                     <thead>
//                       <tr>
//                         <th>Product</th>
//                         <th>Stock In</th>
//                         <th>Stock Out</th>
//                         <th>Available</th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {groupedHistory[dateKey].map((item, j) => (
//                         <tr key={j}>
//                           <td>{item.product}</td>
//                           <td>{item.stockIn}</td>
//                           <td>{item.stockOut}</td>
//                           <td>{item.available}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>

//                 </div>
//               ))}

//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }

// export default Inventory;















// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./inventory.css";

// function Inventory() {
//   const today = new Date().toISOString().split("T")[0];

//   const [rows, setRows] = useState([
//     { product: "", stockIn: "", stockOut: "", available: "" }
//   ]);

//   const [history, setHistory] = useState([]);
//   const [locked, setLocked] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [date, setDate] = useState(today);

//   // 🔷 FETCH HISTORY FROM BACKEND
//   const fetchHistory = async () => {
//     try {
//       const res = await axios.get("http://159.65.94.152/api/inventory/");
//       setHistory(res.data);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   // 🔷 HANDLE INPUT
//   const handleChange = (index, field, value) => {
//     const updated = [...rows];
//     updated[index][field] = value;

//     const stockIn = Number(updated[index].stockIn) || 0;
//     const stockOut = Number(updated[index].stockOut) || 0;

//     updated[index].available = stockIn - stockOut;

//     setRows(updated);
//   };

//   // 🔷 ADD ROW
//   const addRow = () => {
//     setRows([
//       ...rows,
//       { product: "", stockIn: "", stockOut: "", available: "" }
//     ]);
//   };

//   // 🔷 DELETE ROW
//   const deleteRow = (index) => {
//     const updated = rows.filter((_, i) => i !== index);
//     setRows(updated);
//   };

//   // 🔷 SAVE TO BACKEND
//   const saveData = async () => {
//     try {
//       await axios.post("http://159.65.94.152/api/inventory/save/", {
//         date: date,
//         rows: rows
//       });

//       alert("Saved to database!");
//       setLocked(true);

//       // CLEAR INPUT AFTER SAVE
//       setRows([
//         { product: "", stockIn: "", stockOut: "", available: "" }
//       ]);

//       fetchHistory();

//     } catch (error) {
//       alert("Error saving data");
//       console.log(error);
//     }
//   };

//   // 🔷 ENABLE EDIT
//   const enableEdit = () => {
//     setLocked(false);
//   };

//   // 🔷 SEARCH BY DATE
//   const searchByDate = async () => {
//     try {
//       const res = await axios.get(
//         `http://159.65.94.152/api/inventory/?date=${date}`
//       );
//       setHistory(res.data);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   return (
//     <div className="inventory-page">

//       <div className="inventory-box">
//         <h2>Inventory</h2>

//         {/* DATE + SEARCH */}
//         <div className="date-box">
//           <label>Date:</label>
//           <input
//             type="date"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             disabled={locked}
//           />
//           <button onClick={searchByDate}>Search</button>
//         </div>

//         {/* TABLE */}
//         <table>
//           <thead>
//             <tr>
//               <th>Product Name</th>
//               <th>Stock In</th>
//               <th>Stock Out</th>
//               <th>Available Stock</th>
//               <th>Delete</th>
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map((row, index) => (
//               <tr key={index}>
//                 <td>
//                   <input
//                     value={row.product}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(index, "product", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td>
//                   <input
//                     type="number"
//                     value={row.stockIn}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(index, "stockIn", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td>
//                   <input
//                     type="number"
//                     value={row.stockOut}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(index, "stockOut", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td className="available">
//                   {row.available}
//                 </td>

//                 <td>
//                   {!locked && (
//                     <button
//                       className="delete-btn"
//                       onClick={() => deleteRow(index)}
//                     >
//                       🗑
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* ADD ROW */}
//         {!locked && (
//           <button className="add-btn" onClick={addRow}>
//             ➕ Add Row
//           </button>
//         )}

//         {/* ACTION BUTTONS */}
//         <div className="bottom-actions">
//           <button className="save-btn" onClick={saveData}>
//             💾 Save
//           </button>
//           <button className="edit-btn" onClick={enableEdit}>
//             ✏️ Edit
//           </button>
//         </div>

//         {/* HISTORY */}
//         <div className="history">
//           <button
//             className="history-toggle"
//             onClick={() => setShowHistory(!showHistory)}
//           >
//             📂 View History
//           </button>

//           {showHistory && (
//             <div className="history-box">

//               <table>
//                 <thead>
//                   <tr>
//                     <th>Product</th>
//                     <th>Stock In</th>
//                     <th>Stock Out</th>
//                     <th>Available</th>
//                     <th>Date</th>
//                     <th>Time</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {history.map((item, i) => (
//                     <tr key={i}>
//                       <td>{item.product}</td>
//                       <td>{item.stockIn}</td>
//                       <td>{item.stockOut}</td>
//                       <td>{item.available}</td>
//                       <td>{item.date}</td>
//                       <td>{item.time}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>

//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }

// export default Inventory;



















// import React, { useState } from "react";
// import "./inventory.css";

// function Inventory() {
//   const today = new Date().toISOString().split("T")[0];

//   const [rows, setRows] = useState([
//     { product: "", stockIn: "", stockOut: "", available: "" }
//   ]);

//   const [savedData, setSavedData] = useState([]);
//   const [locked, setLocked] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [date, setDate] = useState(today);

//   // HANDLE INPUT
//   const handleChange = (index, field, value) => {
//     const updated = [...rows];
//     updated[index][field] = value;

//     const stockIn = Number(updated[index].stockIn) || 0;
//     const stockOut = Number(updated[index].stockOut) || 0;

//     updated[index].available = stockIn - stockOut;

//     setRows(updated);
//   };

//   // ADD ROW
//   const addRow = () => {
//     setRows([
//       ...rows,
//       { product: "", stockIn: "", stockOut: "", available: "" }
//     ]);
//   };

//   // DELETE ROW
//   const deleteRow = (index) => {
//     const updated = rows.filter((_, i) => i !== index);
//     setRows(updated);
//   };

//   // SAVE DATA
//   const saveData = () => {
//     const newEntry = {
//       date,
//       data: rows
//     };

//     setSavedData([newEntry, ...savedData]);
//     setLocked(true);

//     // DAILY CARRY FORWARD
//     const nextRows = rows.map(row => ({
//       product: row.product,
//       stockIn: row.available,
//       stockOut: "",
//       available: row.available
//     }));

//     setRows(nextRows);
//   };

//   // ENABLE EDIT
//   const enableEdit = () => {
//     setLocked(false);
//   };

//   return (
//     <div className="inventory-page">

//       <div className="inventory-box">
//         <h2>Inventory</h2>

//         {/* DATE */}
//         <div className="date-box">
//           <label>Date:</label>
//           <input
//             type="date"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             disabled={locked}
//           />
//         </div>

//         {/* TABLE */}
//         <table>
//           <thead>
//             <tr>
//               <th>Product Name</th>
//               <th>Stock In</th>
//               <th>Stock Out</th>
//               <th>Available Stock</th>
//               <th>Delete</th>
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map((row, index) => (
//               <tr key={index}>
//                 <td>
//                   <input
//                     value={row.product}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(index, "product", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td>
//                   <input
//                     type="number"
//                     value={row.stockIn}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(index, "stockIn", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td>
//                   <input
//                     type="number"
//                     value={row.stockOut}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(index, "stockOut", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td className="available">
//                   {row.available}
//                 </td>

//                 <td>
//                   {!locked && (
//                     <button className="delete-btn" onClick={() => deleteRow(index)}>
//                       🗑
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* ADD ROW */}
//         {!locked && (
//           <button className="add-btn" onClick={addRow}>
//             ➕ Add Row
//           </button>
//         )}

//         {/* ACTION BUTTONS */}
//         <div className="bottom-actions">
//           <button className="save-btn" onClick={saveData}>💾 Save</button>
//           <button className="edit-btn" onClick={enableEdit}>✏️ Edit</button>
//         </div>

//         {/* HISTORY */}
//         <div className="history">
//           <button
//             className="history-toggle"
//             onClick={() => setShowHistory(!showHistory)}
//           >
//             📂 View History
//           </button>

//           {showHistory && (
//             <div className="history-box">
//               {savedData.map((entry, i) => (
//                 <div key={i} className="history-item">
//                   <strong>{entry.date}</strong>

//                   <table>
//                     <tbody>
//                       {entry.data.map((row, j) => (
//                         <tr key={j}>
//                           <td>{row.product}</td>
//                           <td>{row.stockIn}</td>
//                           <td>{row.stockOut}</td>
//                           <td>{row.available}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>

//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }

// export default Inventory;













// import React, { useState } from "react";
// import "./inventory.css";

// function Inventory() {

//   const today = new Date().toISOString().split("T")[0];

//   const [rows, setRows] = useState([
//     { product: "", stockIn: "", stockOut: "", available: "" }
//   ]);

//   const [savedData, setSavedData] = useState([]);
//   const [locked, setLocked] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [date, setDate] = useState(today);

//   // HANDLE INPUT
//   const handleChange = (index, field, value) => {
//     const updated = [...rows];
//     updated[index][field] = value;

//     const stockIn = Number(updated[index].stockIn) || 0;
//     const stockOut = Number(updated[index].stockOut) || 0;

//     updated[index].available = stockIn - stockOut;

//     setRows(updated);
//   };

//   // ADD ROW
//   const addRow = () => {
//     setRows([
//       ...rows,
//       { product: "", stockIn: "", stockOut: "", available: "" }
//     ]);
//   };

//   // DELETE ROW
//   const deleteRow = (index) => {
//     const updated = rows.filter((_, i) => i !== index);
//     setRows(updated);
//   };

//   // SAVE DATA
//   const saveData = () => {
//     const newEntry = {
//       date,
//       data: rows
//     };

//     setSavedData([newEntry, ...savedData]);
//     setLocked(true);

//     // 🔥 DAILY CARRY FORWARD
//     const nextRows = rows.map(row => ({
//       product: row.product,
//       stockIn: row.available, // carry forward
//       stockOut: "",
//       available: row.available
//     }));

//     setRows(nextRows);
//   };

//   // EDIT MODE
//   const enableEdit = () => {
//     setLocked(false);
//   };

//   return (
//     <div className="inventory-page">

//       <div className="inventory-box">
//         <h2>Inventory</h2>

//         {/* DATE */}
//         <div className="date-box">
//           <label>Date:</label>
//           <input
//             type="date"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             disabled={locked}
//           />
//         </div>

//         {/* TABLE */}
//         <table>
//           <thead>
//             <tr>
//               <th>Product Name</th>
//               <th>Stock In</th>
//               <th>Stock Out</th>
//               <th>Available Stock</th>
//               <th>Delete</th>
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map((row, index) => (
//               <tr key={index}>
//                 <td>
//                   <input
//                     value={row.product}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(index, "product", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td>
//                   <input
//                     type="number"
//                     value={row.stockIn}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(index, "stockIn", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td>
//                   <input
//                     type="number"
//                     value={row.stockOut}
//                     disabled={locked}
//                     onChange={(e) =>
//                       handleChange(index, "stockOut", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td className="available">
//                   {row.available}
//                 </td>

//                 <td>
//                   {!locked && (
//                     <button onClick={() => deleteRow(index)}>🗑</button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* ADD ROW BUTTON */}
//         {!locked && (
//           <button className="add-btn" onClick={addRow}>➕ Add Row</button>
//         )}

//         {/* FLOATING BUTTONS */}
//         <div className="bottom-actions">
//           <button onClick={saveData}>💾 Save</button>
//           <button onClick={enableEdit}>✏️ Edit</button>
//         </div>

//         {/* DROPDOWN HISTORY */}
//         <div className="history">
//           <button onClick={() => setShowHistory(!showHistory)}>
//             📂 View History
//           </button>

//           {showHistory && (
//             <div className="history-box">
//               {savedData.map((entry, i) => (
//                 <div key={i} className="history-item">
//                   <strong>{entry.date}</strong>

//                   <table>
//                     <tbody>
//                       {entry.data.map((row, j) => (
//                         <tr key={j}>
//                           <td>{row.product}</td>
//                           <td>{row.stockIn}</td>
//                           <td>{row.stockOut}</td>
//                           <td>{row.available}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>

//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }

// export default Inventory;












// import React, { useState } from "react";
// import "./inventory.css";

// function Inventory() {
//   const [rows, setRows] = useState([
//     { product: "", stockIn: 0, stockOut: 0, available: 0 }
//   ]);

//   // HANDLE INPUT CHANGE
//   const handleChange = (index, field, value) => {
//     const updated = [...rows];
//     updated[index][field] = field === "product" ? value : Number(value);

//     // AUTO CALCULATE AVAILABLE
//     const stockIn = updated[index].stockIn || 0;
//     const stockOut = updated[index].stockOut || 0;
//     updated[index].available = stockIn - stockOut;

//     setRows(updated);
//   };

//   // ADD NEW ROW
//   const addRow = () => {
//     setRows([
//       ...rows,
//       { product: "", stockIn: 0, stockOut: 0, available: 0 }
//     ]);
//   };

//   // SAVE (you will connect to backend later)
//   const saveData = () => {
//     console.log(rows);
//     alert("Data saved!");
//   };

//   // EDIT (for now just alert)
//   const editRow = (index) => {
//     alert("Edit row " + index);
//   };

//   return (
//     <div className="inventory-page">

//       <div className="inventory-box">
//         <h2>Inventory</h2>

//         <table>
//           <thead>
//             <tr>
//               <th>Product Name</th>
//               <th>Stock In</th>
//               <th>Stock Out</th>
//               <th>Available Stock</th>
//               <th>Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map((row, index) => (
//               <tr key={index}>
//                 <td>
//                   <input
//                     value={row.product}
//                     onChange={(e) =>
//                       handleChange(index, "product", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td>
//                   <input
//                     type="number"
//                     value={row.stockIn}
//                     onChange={(e) =>
//                       handleChange(index, "stockIn", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td>
//                   <input
//                     type="number"
//                     value={row.stockOut}
//                     onChange={(e) =>
//                       handleChange(index, "stockOut", e.target.value)
//                     }
//                   />
//                 </td>

//                 <td className="available">
//                   {row.available}
//                 </td>

//                 <td className="actions">
//                   <button onClick={addRow}>➕</button>
//                   <button onClick={saveData}>💾</button>
//                   <button onClick={() => editRow(index)}>✏️</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//       </div>
//     </div>
//   );
// }

// export default Inventory;