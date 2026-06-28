import { useState, useEffect } from "react";
import axios from "axios";
import "./production.css";

function Production() {

  const [standards, setStandards] =
    useState<any[]>([]);

  const [bags, setBags] =
    useState<any>({});

  const [actual, setActual] =
    useState<any>({});

  const [packaged, setPackaged] =
    useState<any>({});

  const [messages, setMessages] =
    useState<any[]>([]);

  // =========================
  // FORMAT TYPE
  // =========================
  const formatType = (
    type: string
  ) => {
    return type
      .toLowerCase()
      .trim();
  };

  // =========================
  // UNIQUE MESSAGES
  // =========================
  const uniqueMessages = messages.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        (m) =>
          m.comment === item.comment
      )
  );

  // =========================
  // FETCH DATA
  // =========================
  const fetchData = async () => {

    try {

      // FETCH YIELDS
      const yieldRes =
        await axios.get(
          "http://159.65.94.152/api/yields/"
        );

      setStandards(yieldRes.data);

      // FETCH PRODUCTION
      const productionRes =
        await axios.get(
          "http://159.65.94.152/api/latest-production/"
        );

      const data =
        productionRes.data;

      const bagsData: any = {};
      const actualData: any = {};
      const packagedData: any = {};

      data.forEach((item: any) => {

        const type =
          formatType(
            item.bread_type
          );

        bagsData[type] =
          Number(item.bags) || 0;

        actualData[type] =
          Number(
            item.actual_yield
          ) || 0;

        packagedData[type] =
          Number(
            item.packaged
          ) || 0;
      });

      setBags(bagsData);
      setActual(actualData);
      setPackaged(packagedData);
      setMessages(data);

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // EXPECTED
  // =========================
  const getExpected = (
    type: string
  ) => {

    const formatted =
      formatType(type);

    const standard =
      standards.find(
        (s) =>
          formatType(
            s.bread_type
          ) === formatted
      )?.standard || 0;

    return (
      (Number(
        bags[formatted]
      ) || 0) * standard
    );
  };

  // =========================
  // PRODUCTION DIFFERENCE
  // =========================
  const getDifference = (
    type: string
  ) => {

    const formatted =
      formatType(type);

    return (
      getExpected(type) -
      (Number(
        actual[formatted]
      ) || 0)
    );
  };

  // =========================
  // PACKAGING DIFFERENCE
  // =========================
  const getDispatchDiff = (
    type: string
  ) => {

    const formatted =
      formatType(type);

    return (
      (Number(
        actual[formatted]
      ) || 0) -
      (Number(
        packaged[formatted]
      ) || 0)
    );
  };

  // =========================
  // TOTALS
  // =========================
  const total = (fn: any) =>
    standards.reduce(
      (sum, s) =>
        sum + fn(s.bread_type),
      0
    );

  // =========================
  // CONFIRM PRODUCTION
  // =========================
  const confirmProduction =
    async () => {

      try {

        await axios.post(
          "http://159.65.94.152/api/confirm-production/"
        );

        alert(
          "Production Confirmed Successfully"
        );

        // CLEAR STATES
        setBags({});
        setActual({});
        setPackaged({});
        setMessages([]);

        // REFRESH DATA
        fetchData();

      } catch (error) {

        console.log(error);

        alert(
          "Failed to confirm production"
        );
      }
    };

  return (

    <div className="production-page">

      {/* ========================= */}
      {/* TITLE */}
      {/* ========================= */}
      <div className="title-row">

        <h1 className="production-title">
          Production Report
        </h1>

        {/* ========================= */}
        {/* MESSAGE BOX */}
        {/* ========================= */}
        <div className="message-wrapper">

          {uniqueMessages.length >
            0 && (
            <div className="notification-dot"></div>
          )}

          <div className="message-icon">

            💬

            <div className="message-dropdown">

              <h3>
                Production Messages
              </h3>

              {uniqueMessages.length >
              0 ? (

                uniqueMessages.map(
                  (
                    msg,
                    index
                  ) => (

                    <div
                      key={index}
                      className="message-card"
                    >

                      <div className="message-header">

                        <strong>
                          Production Report
                        </strong>

                        <span>
                          {new Date(
                            msg.created_at
                          ).toLocaleDateString()}
                        </span>

                      </div>

                      <p>
                        {msg.comment ||
                          "No Comment"}
                      </p>

                    </div>
                  )
                )

              ) : (

                <div className="empty-message">
                  No Messages
                </div>

              )}

            </div>

          </div>

        </div>

      </div>

      {/* ========================= */}
      {/* PRODUCTION */}
      {/* ========================= */}
      <div className="production-card">

        <h3 className="section-title">
          Production
        </h3>

        <table className="production-table">

          <thead>

            <tr>

              {standards.map((s) => (
                <th key={s.id}>
                  {s.bread_type}
                </th>
              ))}

              <th>Total</th>

            </tr>

          </thead>

          <tbody>

            {/* ========================= */}
            {/* BAGS */}
            {/* ========================= */}
            <tr>
              <td
                className="row-title"
                colSpan={
                  standards.length + 1
                }
              >
                Total Bags Produced
              </td>
            </tr>

            <tr>

              {standards.map((s) => {

                const type =
                  formatType(
                    s.bread_type
                  );

                return (

                  <td key={s.id}>

                    <input
                      className="production-input"
                      type="number"
                      value={
                        bags[type] || 0
                      }
                      readOnly
                    />

                  </td>
                );
              })}

              <td className="total-cell">

                {standards.reduce(
                  (sum, s) => {

                    const type =
                      formatType(
                        s.bread_type
                      );

                    return (
                      sum +
                      (Number(
                        bags[type]
                      ) || 0)
                    );
                  },
                  0
                )}

              </td>

            </tr>

            {/* ========================= */}
            {/* EXPECTED */}
            {/* ========================= */}
            <tr>
              <td
                className="row-title"
                colSpan={
                  standards.length + 1
                }
              >
                Expected Loaves
              </td>
            </tr>

            <tr className="expected-row">

              {standards.map((s) => (
                <td key={s.id}>
                  {getExpected(
                    s.bread_type
                  )}
                </td>
              ))}

              <td className="total-cell">
                {total(getExpected)}
              </td>

            </tr>

            {/* ========================= */}
            {/* ACTUAL */}
            {/* ========================= */}
            <tr>
              <td
                className="row-title"
                colSpan={
                  standards.length + 1
                }
              >
                Actual Yield
              </td>
            </tr>

            <tr className="actual-row">

              {standards.map((s) => {

                const type =
                  formatType(
                    s.bread_type
                  );

                return (

                  <td key={s.id}>

                    <input
                      className="production-input"
                      type="number"
                      value={
                        actual[type] || 0
                      }
                      readOnly
                    />

                  </td>
                );
              })}

              <td className="total-cell">

                {total(
                  (t: string) =>
                    actual[
                      formatType(t)
                    ] || 0
                )}

              </td>

            </tr>

            {/* ========================= */}
            {/* DIFFERENCE */}
            {/* ========================= */}
            <tr>
              <td
                className="row-title"
                colSpan={
                  standards.length + 1
                }
              >
                Difference
              </td>
            </tr>

            <tr className="difference-row">

              {standards.map((s) => (

                <td
                  key={s.id}
                  className={
                    getDifference(
                      s.bread_type
                    ) !== 0
                      ? "negative"
                      : ""
                  }
                >

                  {getDifference(
                    s.bread_type
                  )}

                </td>

              ))}

              <td className="total-cell">

                {total(
                  getDifference
                )}

              </td>

            </tr>

          </tbody>

        </table>

      </div>

      {/* ========================= */}
      {/* PACKAGING */}
      {/* ========================= */}
      <div className="production-card">

        <h3 className="section-title">
          Packaging
        </h3>

        <table className="production-table">

          <thead>

            <tr>

              {standards.map((s) => (
                <th key={s.id}>
                  {s.bread_type}
                </th>
              ))}

              <th>Total</th>

            </tr>

          </thead>

          <tbody>

            {/* ========================= */}
            {/* PACKAGED */}
            {/* ========================= */}
            <tr>
              <td
                className="row-title"
                colSpan={
                  standards.length + 1
                }
              >
                Packaged
              </td>
            </tr>

            <tr>

              {standards.map((s) => {

                const type =
                  formatType(
                    s.bread_type
                  );

                return (

                  <td key={s.id}>

                    <input
                      className="production-input"
                      type="number"
                      value={
                        packaged[type] || 0
                      }
                      readOnly
                    />

                  </td>
                );
              })}

              <td className="total-cell">

                {total(
                  (t: string) =>
                    packaged[
                      formatType(t)
                    ] || 0
                )}

              </td>

            </tr>

            {/* ========================= */}
            {/* DISPATCH DIFFERENCE */}
            {/* ========================= */}
            <tr>
              <td
                className="row-title"
                colSpan={
                  standards.length + 1
                }
              >
                Dispatch Difference
              </td>
            </tr>

            <tr className="difference-row">

              {standards.map((s) => (

                <td
                  key={s.id}
                  className={
                    getDispatchDiff(
                      s.bread_type
                    ) !== 0
                      ? "negative"
                      : ""
                  }
                >

                  {getDispatchDiff(
                    s.bread_type
                  )}

                </td>

              ))}

              <td className="total-cell">

                {total(
                  getDispatchDiff
                )}

              </td>

            </tr>

          </tbody>

        </table>

        {/* ========================= */}
        {/* BUTTON */}
        {/* ========================= */}
        <div className="button-group">

          <button
            className="production-btn confirm-btn"
            onClick={
              confirmProduction
            }
          >
            Confirm Production
          </button>

        </div>

      </div>

    </div>
  );
}

export default Production;

// import { useState, useEffect } from "react";
// import axios from "axios";
// import "./production.css";

// function Production() {

//   const [standards, setStandards] = useState<any[]>([]);
//   const [bags, setBags] = useState<any>({});
//   const [actual, setActual] = useState<any>({});

//   // ================= FETCH STANDARDS =================
//   useEffect(() => {
//     axios.get("http://159.65.94.152/api/yields/")
//       .then(res => setStandards(res.data));
//   }, []);

//   // ================= CALCULATIONS =================
//   const getExpected = (type: string) => {
//     const std = standards.find(s => s.bread_type === type)?.standard || 0;
//     return (bags[type] || 0) * std;
//   };

//   const getDifference = (type: string) => {
//     return getExpected(type) - (actual[type] || 0);
//   };

//   return (
//     <div className="production-container">

//       <h2>Production Report</h2>

//       {/* ================= EXPECTED ================= */}
//       <h3>Expected Loaves Per Bag</h3>
//       <table className="table">
//         <thead>
//           <tr>
//             {standards.map(s => (
//               <th key={s.id}>{s.bread_type}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             {standards.map(s => (
//               <td key={s.id}>{s.standard}</td>
//             ))}
//           </tr>
//         </tbody>
//       </table>

//       {/* ================= PRODUCTION ================= */}
//       <h3>Production</h3>
//       <table className="table">

//         <thead>
//           <tr>
//             {standards.map(s => (
//               <th key={s.id}>{s.bread_type}</th>
//             ))}
//           </tr>
//         </thead>

//         <tbody>

//           {/* TOTAL BAGS */}
//           <tr>
//             <td colSpan={standards.length}><b>Total Bags Produced</b></td>
//           </tr>
//           <tr>
//             {standards.map(s => (
//               <td key={s.id}>
//                 <input
//                   type="number"
//                   value={bags[s.bread_type] || ""}
//                   onChange={(e) =>
//                     setBags({ ...bags, [s.bread_type]: Number(e.target.value) })
//                   }
//                 />
//               </td>
//             ))}
//           </tr>

//           {/* EXPECTED */}
//           <tr>
//             <td colSpan={standards.length}><b>Expected Loaves</b></td>
//           </tr>
//           <tr>
//             {standards.map(s => (
//               <td key={s.id}>{getExpected(s.bread_type)}</td>
//             ))}
//           </tr>

//           {/* ACTUAL */}
//           <tr>
//             <td colSpan={standards.length}><b>Actual Yield</b></td>
//           </tr>
//           <tr>
//             {standards.map(s => (
//               <td key={s.id}>
//                 <input
//                   type="number"
//                   value={actual[s.bread_type] || ""}
//                   onChange={(e) =>
//                     setActual({ ...actual, [s.bread_type]: Number(e.target.value) })
//                   }
//                 />
//               </td>
//             ))}
//           </tr>

//           {/* DIFFERENCE */}
//           <tr>
//             <td colSpan={standards.length}><b>Difference</b></td>
//           </tr>
//           <tr>
//             {standards.map(s => (
//               <td key={s.id} style={{ color: getDifference(s.bread_type) > 0 ? "red" : "green" }}>
//                 {getDifference(s.bread_type)}
//               </td>
//             ))}
//           </tr>

//         </tbody>
//       </table>

//     </div>
//   );
// }

// export default Production;















// import { useState, useEffect } from "react";
// import axios from "axios";
// import "./production.css";

// function Production() {
//   const [activeTab, setActiveTab] = useState("standard");

//   const user = JSON.parse(localStorage.getItem("user") || "null");
//   const isDirector = user?.role === "director";

//   const [standards, setStandards] = useState<any[]>([]);
//   const [editMode, setEditMode] = useState(false);

//   const [breadType, setBreadType] = useState("");
//   const [bags, setBags] = useState(0);
//   const [actual, setActual] = useState(0);
//   const [standard, setStandard] = useState(0);

//   const [packaged, setPackaged] = useState(0);
//   const [receiver, setReceiver] = useState("");

//   const [yieldHistory, setYieldHistory] = useState<any[]>([]);
//   const [dispatchHistory, setDispatchHistory] = useState<any[]>([]);

//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   // ================= FETCH DATA =================
//   const fetchAll = () => {
//     axios.get("http://159.65.94.152/api/yields/")
//       .then(res => setStandards(res.data));

//     axios.get("http://159.65.94.152/api/yield-records/")
//       .then(res => setYieldHistory(res.data));

//     axios.get("http://159.65.94.152/api/dispatch/")
//       .then(res => setDispatchHistory(res.data));
//   };

//   useEffect(() => {
//     fetchAll();
//   }, []);

//   // ================= GET STANDARD =================
//   useEffect(() => {
//     const found = standards.find(s => s.bread_type === breadType);
//     if (found) setStandard(found.standard);
//   }, [breadType, standards]);

//   // ================= CALCULATIONS =================
//   const expected = bags * standard;
//   const difference = expected - actual;
//   const dispatchDiff = actual - packaged;

//   // ================= SAVE ALL STANDARDS =================
//   const saveAllStandards = async () => {
//     try {
//       await Promise.all(
//         standards.map((item) =>
//           axios.put(`http://159.65.94.152/api/yields/${item.id}/`, {
//             standard: item.standard,
//           })
//         )
//       );

//       setMessage("✅ Standards updated");
//       setEditMode(false);
//     } catch {
//       setMessage("❌ Failed to update");
//     }
//   };

//   // ================= SAVE YIELD =================
//   const saveYield = async () => {
//     if (!breadType || bags <= 0 || actual <= 0) {
//       setMessage("❌ Fill all fields");
//       return;
//     }

//     setLoading(true);

//     try {
//       await axios.post("http://159.65.94.152/api/yield-records/", {
//         bread_type: breadType,
//         bags,
//         actual,
//         expected,
//         difference
//       });

//       setMessage("✅ Yield saved");
//       setBags(0);
//       setActual(0);
//       fetchAll();

//     } catch {
//       setMessage("❌ Failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ================= SAVE DISPATCH =================
//   const saveDispatch = async () => {
//     if (!breadType || actual <= 0 || packaged <= 0 || !receiver) {
//       setMessage("❌ Fill all fields");
//       return;
//     }

//     setLoading(true);

//     try {
//       await axios.post("http://159.65.94.152/api/dispatch/", {
//         bread_type: breadType,
//         actual,
//         packaged,
//         receiver,
//         difference: dispatchDiff
//       });

//       setMessage("✅ Dispatch saved");
//       setPackaged(0);
//       setReceiver("");
//       fetchAll();

//     } catch {
//       setMessage("❌ Failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ================= SUMMARY =================
//   const totalExpected = yieldHistory.reduce((sum, r) => sum + r.expected, 0);
//   const totalActual = yieldHistory.reduce((sum, r) => sum + r.actual, 0);
//   const totalPackaged = dispatchHistory.reduce((sum, r) => sum + r.packaged, 0);

//   const totalLoss = totalExpected - totalActual;
//   const dispatchLoss = totalActual - totalPackaged;

//   return (
//     <div className="production-container">

//       <h2>Production Department</h2>

//       {message && <p className="message">{message}</p>}

//       {/* ================= TABS ================= */}
//       <div className="tabs">
//         <button className={activeTab==="standard"?"active":""} onClick={() => setActiveTab("standard")}>Standard</button>
//         <button className={activeTab==="yield"?"active":""} onClick={() => setActiveTab("yield")}>Yield</button>
//         <button className={activeTab==="dispatch"?"active":""} onClick={() => setActiveTab("dispatch")}>Dispatch</button>
//         <button className={activeTab==="history"?"active":""} onClick={() => setActiveTab("history")}>History</button>
//       </div>

//       {/* ================= STANDARD ================= */}
//       {activeTab === "standard" && (
//         <div className="card">
//           <div className="header-row">
//             <h3>Expected Yields</h3>

//             {isDirector && (
//               <button onClick={() => setEditMode(!editMode)}>
//                 {editMode ? "Cancel" : "Edit"}
//               </button>
//             )}
//           </div>

//           {standards.map((item: any) => (
//             <div key={item.id} className="row">
//               <span>{item.bread_type}</span>

//               <input
//                 type="number"
//                 value={item.standard}
//                 disabled={!editMode}
//                 onChange={(e) => {
//                   const value = Number(e.target.value);

//                   setStandards(prev =>
//                     prev.map(s =>
//                       s.id === item.id ? { ...s, standard: value } : s
//                     )
//                   );
//                 }}
//               />
//             </div>
//           ))}

//           {isDirector && editMode && (
//             <button className="save-btn" onClick={saveAllStandards}>
//               Save All Changes
//             </button>
//           )}
//         </div>
//       )}

//       {/* ================= YIELD ================= */}
//       {activeTab === "yield" && (
//         <div className="card">
//           <h3>Yield Tracking</h3>

//           <select onChange={(e) => setBreadType(e.target.value)}>
//             <option value="">Select Bread</option>
//             {standards.map((s: any) => (
//               <option key={s.id}>{s.bread_type}</option>
//             ))}
//           </select>

//           <input type="number" placeholder="Bags" value={bags}
//             onChange={(e) => setBags(Number(e.target.value))} />

//           <input type="number" placeholder="Actual" value={actual}
//             onChange={(e) => setActual(Number(e.target.value))} />

//           <p>Expected: {expected}</p>
//           <p>Difference: {difference}</p>

//           {difference > 0 && <p className="error">⚠️ Shortfall</p>}

//           <button onClick={saveYield}>
//             {loading ? "Saving..." : "Save Yield"}
//           </button>
//         </div>
//       )}

//       {/* ================= DISPATCH ================= */}
//       {activeTab === "dispatch" && (
//         <div className="card">
//           <h3>Dispatch</h3>

//           <input placeholder="Bread Type"
//             onChange={(e) => setBreadType(e.target.value)} />

//           <input type="number" placeholder="Actual" value={actual}
//             onChange={(e) => setActual(Number(e.target.value))} />

//           <input type="number" placeholder="Packaged" value={packaged}
//             onChange={(e) => setPackaged(Number(e.target.value))} />

//           <input placeholder="Receiver" value={receiver}
//             onChange={(e) => setReceiver(e.target.value)} />

//           {dispatchDiff !== 0 && (
//             <p className="error">⚠️ Mismatch: {dispatchDiff}</p>
//           )}

//           <button onClick={saveDispatch}>
//             {loading ? "Saving..." : "Save Dispatch"}
//           </button>
//         </div>
//       )}

//       {/* ================= HISTORY ================= */}
//       {activeTab === "history" && (
//         <div>

//           <div className="summary">
//             <h3>Daily Summary</h3>
//             <p>Total Expected: {totalExpected}</p>
//             <p>Total Actual: {totalActual}</p>
//             <p>Total Packaged: {totalPackaged}</p>
//             <p className="error">Production Loss: {totalLoss}</p>
//             <p className="error">Dispatch Loss: {dispatchLoss}</p>
//           </div>

//         </div>
//       )}

//     </div>
//   );
// }

// export default Production;











// import { useState, useEffect } from "react";
// import axios from "axios";
// import "./production.css";

// function Production() {
//   const [activeTab, setActiveTab] = useState("standard");

//   const user = JSON.parse(localStorage.getItem("user") || "null");
//   const isDirector = user?.role === "director";

//   const [standards, setStandards] = useState<any[]>([]);

//   const [breadType, setBreadType] = useState("");
//   const [bags, setBags] = useState(0);
//   const [actual, setActual] = useState(0);
//   const [standard, setStandard] = useState(0);

//   const [packaged, setPackaged] = useState(0);
//   const [receiver, setReceiver] = useState("");

//   const [yieldHistory, setYieldHistory] = useState<any[]>([]);
//   const [dispatchHistory, setDispatchHistory] = useState<any[]>([]);

//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   // ================= FETCH DATA =================
//   const fetchAll = () => {
//     axios.get("http://159.65.94.152/api/yields/")
//       .then(res => setStandards(res.data));

//     axios.get("http://159.65.94.152/api/yield-records/")
//       .then(res => setYieldHistory(res.data));

//     axios.get("http://159.65.94.152/api/dispatch/")
//       .then(res => setDispatchHistory(res.data));
//   };

//   useEffect(() => {
//     fetchAll();
//   }, []);

//   // ================= GET STANDARD =================
//   useEffect(() => {
//     const found = standards.find(s => s.bread_type === breadType);
//     if (found) setStandard(found.standard);
//   }, [breadType, standards]);

//   // ================= CALCULATIONS =================
//   const expected = bags * standard;
//   const difference = expected - actual;
//   const dispatchDiff = actual - packaged;

//   // ================= SAVE YIELD =================
//   const saveYield = async () => {
//     if (!breadType || bags <= 0 || actual <= 0) {
//       setMessage("❌ Fill all fields correctly");
//       return;
//     }

//     setLoading(true);

//     try {
//       await axios.post("http://159.65.94.152/api/yield-records/", {
//         bread_type: breadType,
//         bags,
//         actual,
//         expected,
//         difference
//       });

//       setMessage("✅ Yield saved");
//       setBags(0);
//       setActual(0);
//       fetchAll();

//     } catch {
//       setMessage("❌ Failed to save yield");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ================= SAVE DISPATCH =================
//   const saveDispatch = async () => {
//     if (!breadType || actual <= 0 || packaged <= 0 || !receiver) {
//       setMessage("❌ Fill all dispatch fields");
//       return;
//     }

//     setLoading(true);

//     try {
//       await axios.post("http://159.65.94.152/api/dispatch/", {
//         bread_type: breadType,
//         actual,
//         packaged,
//         receiver,
//         difference: dispatchDiff
//       });

//       setMessage("✅ Dispatch saved");
//       setPackaged(0);
//       setReceiver("");
//       fetchAll();

//     } catch {
//       setMessage("❌ Failed to save dispatch");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ================= DAILY SUMMARY =================
//   const totalExpected = yieldHistory.reduce((sum, r) => sum + r.expected, 0);
//   const totalActual = yieldHistory.reduce((sum, r) => sum + r.actual, 0);
//   const totalPackaged = dispatchHistory.reduce((sum, r) => sum + r.packaged, 0);

//   const totalLoss = totalExpected - totalActual;
//   const dispatchLoss = totalActual - totalPackaged;

//   return (
//     <div className="production-container">

//       <h2>Production Department</h2>

//       {message && <p className="message">{message}</p>}

//       {/* ================= TABS ================= */}
//       <div className="tabs">
//         <button onClick={() => setActiveTab("standard")}>Standard</button>
//         <button onClick={() => setActiveTab("yield")}>Yield</button>
//         <button onClick={() => setActiveTab("dispatch")}>Dispatch</button>
//         <button onClick={() => setActiveTab("history")}>History</button>
//       </div>

//       {/* ================= YIELD ================= */}
//       {activeTab === "yield" && (
//         <div className="card">
//           <h3>Yield Tracking</h3>

//           <select onChange={(e) => setBreadType(e.target.value)}>
//             <option value="">Select Bread</option>
//             {standards.map((s: any) => (
//               <option key={s.id}>{s.bread_type}</option>
//             ))}
//           </select>

//           <input type="number" placeholder="Bags"
//             value={bags} onChange={(e) => setBags(Number(e.target.value))} />

//           <input type="number" placeholder="Actual"
//             value={actual} onChange={(e) => setActual(Number(e.target.value))} />

//           <p>Expected: {expected}</p>
//           <p>Difference: {difference}</p>

//           {difference > 0 && <p className="error">⚠️ Shortfall</p>}

//           <button onClick={saveYield}>
//             {loading ? "Saving..." : "Save Yield"}
//           </button>
//         </div>
//       )}

//       {/* ================= DISPATCH ================= */}
//       {activeTab === "dispatch" && (
//         <div className="card">
//           <h3>Dispatch</h3>

//           <input placeholder="Bread Type"
//             onChange={(e) => setBreadType(e.target.value)} />

//           <input type="number" placeholder="Actual"
//             value={actual} onChange={(e) => setActual(Number(e.target.value))} />

//           <input type="number" placeholder="Packaged"
//             value={packaged} onChange={(e) => setPackaged(Number(e.target.value))} />

//           <input placeholder="Receiver"
//             value={receiver} onChange={(e) => setReceiver(e.target.value)} />

//           {dispatchDiff !== 0 && (
//             <p className="error">⚠️ Mismatch: {dispatchDiff}</p>
//           )}

//           <button onClick={saveDispatch}>
//             {loading ? "Saving..." : "Save Dispatch"}
//           </button>
//         </div>
//       )}

//       {/* ================= HISTORY ================= */}
//       {activeTab === "history" && (
//         <div>

//           {/* ===== DAILY SUMMARY ===== */}
//           <div className="summary">
//             <h3>Daily Summary</h3>
//             <p>Total Expected: {totalExpected}</p>
//             <p>Total Actual: {totalActual}</p>
//             <p>Total Packaged: {totalPackaged}</p>
//             <p className="error">Production Loss: {totalLoss}</p>
//             <p className="error">Dispatch Loss: {dispatchLoss}</p>
//           </div>

//           {/* ===== YIELD HISTORY ===== */}
//           <div className="table-container">
//             <h3>Yield Records</h3>
//             <table>
//               <thead>
//                 <tr>
//                   <th>Bread</th>
//                   <th>Bags</th>
//                   <th>Expected</th>
//                   <th>Actual</th>
//                   <th>Diff</th>
//                   <th>Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {yieldHistory.map((r, i) => (
//                   <tr key={i}>
//                     <td>{r.bread_type}</td>
//                     <td>{r.bags}</td>
//                     <td>{r.expected}</td>
//                     <td>{r.actual}</td>
//                     <td>{r.difference}</td>
//                     <td>{new Date(r.created_at).toLocaleString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* ===== DISPATCH HISTORY ===== */}
//           <div className="table-container">
//             <h3>Dispatch Records</h3>
//             <table>
//               <thead>
//                 <tr>
//                   <th>Bread</th>
//                   <th>Actual</th>
//                   <th>Packaged</th>
//                   <th>Receiver</th>
//                   <th>Diff</th>
//                   <th>Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {dispatchHistory.map((r, i) => (
//                   <tr key={i}>
//                     <td>{r.bread_type}</td>
//                     <td>{r.actual}</td>
//                     <td>{r.packaged}</td>
//                     <td>{r.receiver}</td>
//                     <td>{r.difference}</td>
//                     <td>{new Date(r.created_at).toLocaleString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//         </div>
//       )}

//     </div>
//   );
// }

// export default Production;