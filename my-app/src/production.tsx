import { useState, useEffect } from "react";
import axios from "axios";
import "./production.css";
import API_URL from "./api";

function Production() {

  /* ===========================
      STATES
  =========================== */

  const [standards, setStandards] = useState<any[]>([]);
  const [bags, setBags] = useState<any>({});
  const [actual, setActual] = useState<any>({});
  const [packaged, setPackaged] = useState<any>({});
  const [messages, setMessages] = useState<any[]>([]);

  /* ===========================
      FORMAT TYPE
  =========================== */

  const formatType = (type: string) =>
    type.toLowerCase().trim();

  /* ===========================
      REMOVE DUPLICATE MESSAGES
  =========================== */

  const uniqueMessages = messages.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        (m) => m.comment === item.comment
      )
  );

  /* ===========================
      FETCH DATA
  =========================== */

  const fetchData = async () => {

    try {

      const yieldRes =
        await axios.get(
          `${API_URL}/api/yields/`
        );

      setStandards(yieldRes.data);

      const productionRes =
        await axios.get(
          `${API_URL}/api/latest-production/`
        );

      const bagsData: any = {};
      const actualData: any = {};
      const packagedData: any = {};

      productionRes.data.forEach((item: any) => {

        const type = formatType(item.bread_type);

        bagsData[type] =
          Number(item.bags) || 0;

        actualData[type] =
          Number(item.actual_yield) || 0;

        packagedData[type] =
          Number(item.packaged) || 0;

      });

      setBags(bagsData);
      setActual(actualData);
      setPackaged(packagedData);
      setMessages(productionRes.data);

    } catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {

    fetchData();

  }, []);

  /* ===========================
      EXPECTED LOAVES
  =========================== */

  const getExpected = (breadType: string) => {

    const type = formatType(breadType);

    const standard =
      standards.find(
        (s) =>
          formatType(s.bread_type) === type
      )?.standard || 0;

    return (
      (Number(bags[type]) || 0) *
      standard
    );

  };

  /* ===========================
      PRODUCTION DIFFERENCE
  =========================== */

  const getDifference = (breadType: string) => {

    const type = formatType(breadType);

    return (
      getExpected(breadType) -
      (Number(actual[type]) || 0)
    );

  };

  /* ===========================
      DISPATCH DIFFERENCE
  =========================== */

  const getDispatchDiff = (breadType: string) => {

    const type = formatType(breadType);

    return (
      (Number(actual[type]) || 0) -
      (Number(packaged[type]) || 0)
    );

  };

  /* ===========================
      TOTALS
  =========================== */

  const total = (callback: any) =>
    standards.reduce(
      (sum, item) =>
        sum + callback(item.bread_type),
      0
    );

  /* ===========================
      CONFIRM PRODUCTION
  =========================== */

  const confirmProduction = async () => {

    try {

      await axios.post(
        `${API_URL}/api/confirm-production/`
      );

      alert(
        "Production Confirmed Successfully"
      );

      fetchData();

    } catch (error) {

      console.log(error);

      alert(
        "Failed to confirm production."
      );

    }

  };

  /* ===========================
      RETURN
  =========================== */

  return (
    <div className="production-page">

  {/* ========================= */}
  {/* PAGE HEADER */}
  {/* ========================= */}

  <div className="title-row">

    <h1 className="production-title">
      Production Report
    </h1>

    <div className="message-wrapper">

      {uniqueMessages.length > 0 && (
        <div className="notification-dot"></div>
      )}

      <div className="message-icon">

        💬

        <div className="message-dropdown">

          <h3>Production Messages</h3>

          {uniqueMessages.length > 0 ? (

            uniqueMessages.map((msg, index) => (

              <div
                className="message-card"
                key={index}
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

            ))

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

    <h2 className="section-title">

      Production

    </h2>

    {/* ========================= */}
    {/* DESKTOP TABLE */}
    {/* ========================= */}

    <div className="desktop-production">

      <div className="production-table-wrapper">

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

            {/* Bags */}

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
                      readOnly
                      value={
                        bags[type] || 0
                      }
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
                      (
                        Number(
                          bags[type]
                        ) || 0
                      )
                    );

                  },
                  0
                )}

              </td>

            </tr>

            {/* Expected */}

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

                {total(
                  getExpected
                )}

              </td>

            </tr>

            {/* Actual */}

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
                      readOnly
                      value={
                        actual[type] || 0
                      }
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

            {/* Difference */}

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
                    ) < 0
                      ? "negative"
                      : "positive"
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

    </div>

    {/* ========================= */}
    {/* MOBILE CARDS */}
    {/* ========================= */}

    <div className="mobile-production">

      {standards.map((s) => {

        const type =
          formatType(
            s.bread_type
          );

        return (

          <div
            className="bread-card"
            key={s.id}
          >

            <h3>

              🍞 {s.bread_type}

            </h3>

            <div className="bread-row">

              <span>Bags Produced</span>

              <strong>

                {bags[type] || 0}

              </strong>

            </div>

            <div className="bread-row">

              <span>Expected</span>

              <strong>

                {getExpected(
                  s.bread_type
                )}

              </strong>

            </div>

            <div className="bread-row">

              <span>Actual</span>

              <strong>

                {actual[type] || 0}

              </strong>

            </div>

            <div className="bread-row">

              <span>Difference</span>

              <strong
                className={
                  getDifference(
                    s.bread_type
                  ) < 0
                    ? "negative"
                    : "positive"
                }
              >

                {getDifference(
                  s.bread_type
                )}

              </strong>

            </div>

          </div>

        );

      })}

    </div>

  </div>

  {/* ========================= */}
{/* PACKAGING */}
{/* ========================= */}

<div className="production-card">

  <h2 className="section-title">
    Packaging
  </h2>

  {/* ========================= */}
  {/* DESKTOP TABLE */}
  {/* ========================= */}

  <div className="desktop-production">

    <div className="production-table-wrapper">

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
              colSpan={standards.length + 1}
            >
              Packaged Loaves
            </td>

          </tr>

          <tr>

            {standards.map((s) => {

              const type = formatType(s.bread_type);

              return (

                <td key={s.id}>

                  <input
                    className="production-input"
                    type="number"
                    readOnly
                    value={packaged[type] || 0}
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
              colSpan={standards.length + 1}
            >
              Dispatch Difference
            </td>

          </tr>

          <tr className="difference-row">

            {standards.map((s) => (

              <td
                key={s.id}
                className={
                  getDispatchDiff(s.bread_type) < 0
                    ? "negative"
                    : "positive"
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

    </div>

  </div>

  {/* ========================= */}
  {/* MOBILE CARDS */}
  {/* ========================= */}

  <div className="mobile-production">

    {standards.map((s) => {

      const type = formatType(s.bread_type);

      return (

        <div
          className="bread-card"
          key={s.id}
        >

          <h3>
            📦 {s.bread_type}
          </h3>

          <div className="bread-row">

            <span>Packaged</span>

            <strong>

              {packaged[type] || 0}

            </strong>

          </div>

          <div className="bread-row">

            <span>Dispatch Difference</span>

            <strong
              className={
                getDispatchDiff(
                  s.bread_type
                ) < 0
                  ? "negative"
                  : "positive"
              }
            >

              {getDispatchDiff(
                s.bread_type
              )}

            </strong>

          </div>

        </div>

      );

    })}

  </div>

</div>

{/* ========================= */}
{/* ACTION BUTTONS */}
{/* ========================= */}

<div className="production-card">

  <div className="button-group">

    <button
      className="production-btn save-btn"
      onClick={confirmProduction}
    >
      ✓ Confirm Production
    </button>

  </div>

</div>

{/* ========================= */}
{/* SUMMARY */}
{/* ========================= */}

<div className="summary-grid">

  <div className="summary-card">

    <h3>Total Bread Types</h3>

    <p>
      {standards.length}
    </p>

  </div>

  <div className="summary-card">

    <h3>Total Bags Produced</h3>

    <p>

      {standards.reduce((sum, s) => {

        const type = formatType(s.bread_type);

        return (
          sum +
          (Number(bags[type]) || 0)
        );

      }, 0)}

    </p>

  </div>

  <div className="summary-card">

    <h3>Total Expected Loaves</h3>

    <p>

      {total(getExpected)}

    </p>

  </div>

  <div className="summary-card">

    <h3>Total Actual Yield</h3>

    <p>

      {total(
        (t: string) =>
          actual[
            formatType(t)
          ] || 0
      )}

    </p>

  </div>

  <div className="summary-card">

    <h3>Total Packaged</h3>

    <p>

      {total(
        (t: string) =>
          packaged[
            formatType(t)
          ] || 0
      )}

    </p>

  </div>

  <div className="summary-card">

    <h3>Total Dispatch Difference</h3>

    <p
      className={
        total(getDispatchDiff) < 0
          ? "negative"
          : "positive"
      }
    >

      {total(getDispatchDiff)}

    </p>

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

//   const [standards, setStandards] =
//     useState<any[]>([]);

//   const [bags, setBags] =
//     useState<any>({});

//   const [actual, setActual] =
//     useState<any>({});

//   const [packaged, setPackaged] =
//     useState<any>({});

//   const [messages, setMessages] =
//     useState<any[]>([]);

//   // =========================
//   // FORMAT TYPE
//   // =========================
//   const formatType = (
//     type: string
//   ) => {
//     return type
//       .toLowerCase()
//       .trim();
//   };

//   // =========================
//   // UNIQUE MESSAGES
//   // =========================
//   const uniqueMessages = messages.filter(
//     (item, index, self) =>
//       index ===
//       self.findIndex(
//         (m) =>
//           m.comment === item.comment
//       )
//   );

//   // =========================
//   // FETCH DATA
//   // =========================
//   const fetchData = async () => {

//     try {

//       // FETCH YIELDS
//       const yieldRes =
//         await axios.get(
//           "http://159.65.94.152/api/yields/"
//         );

//       setStandards(yieldRes.data);

//       // FETCH PRODUCTION
//       const productionRes =
//         await axios.get(
//           "http://159.65.94.152/api/latest-production/"
//         );

//       const data =
//         productionRes.data;

//       const bagsData: any = {};
//       const actualData: any = {};
//       const packagedData: any = {};

//       data.forEach((item: any) => {

//         const type =
//           formatType(
//             item.bread_type
//           );

//         bagsData[type] =
//           Number(item.bags) || 0;

//         actualData[type] =
//           Number(
//             item.actual_yield
//           ) || 0;

//         packagedData[type] =
//           Number(
//             item.packaged
//           ) || 0;
//       });

//       setBags(bagsData);
//       setActual(actualData);
//       setPackaged(packagedData);
//       setMessages(data);

//     } catch (error) {

//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // =========================
//   // EXPECTED
//   // =========================
//   const getExpected = (
//     type: string
//   ) => {

//     const formatted =
//       formatType(type);

//     const standard =
//       standards.find(
//         (s) =>
//           formatType(
//             s.bread_type
//           ) === formatted
//       )?.standard || 0;

//     return (
//       (Number(
//         bags[formatted]
//       ) || 0) * standard
//     );
//   };

//   // =========================
//   // PRODUCTION DIFFERENCE
//   // =========================
//   const getDifference = (
//     type: string
//   ) => {

//     const formatted =
//       formatType(type);

//     return (
//       getExpected(type) -
//       (Number(
//         actual[formatted]
//       ) || 0)
//     );
//   };

//   // =========================
//   // PACKAGING DIFFERENCE
//   // =========================
//   const getDispatchDiff = (
//     type: string
//   ) => {

//     const formatted =
//       formatType(type);

//     return (
//       (Number(
//         actual[formatted]
//       ) || 0) -
//       (Number(
//         packaged[formatted]
//       ) || 0)
//     );
//   };

//   // =========================
//   // TOTALS
//   // =========================
//   const total = (fn: any) =>
//     standards.reduce(
//       (sum, s) =>
//         sum + fn(s.bread_type),
//       0
//     );

//   // =========================
//   // CONFIRM PRODUCTION
//   // =========================
//   const confirmProduction =
//     async () => {

//       try {

//         await axios.post(
//           "http://159.65.94.152/api/confirm-production/"
//         );

//         alert(
//           "Production Confirmed Successfully"
//         );

//         // CLEAR STATES
//         setBags({});
//         setActual({});
//         setPackaged({});
//         setMessages([]);

//         // REFRESH DATA
//         fetchData();

//       } catch (error) {

//         console.log(error);

//         alert(
//           "Failed to confirm production"
//         );
//       }
//     };

//   return (

//     <div className="production-page">

//       {/* ========================= */}
//       {/* TITLE */}
//       {/* ========================= */}
//       <div className="title-row">

//         <h1 className="production-title">
//           Production Report
//         </h1>

//         {/* ========================= */}
//         {/* MESSAGE BOX */}
//         {/* ========================= */}
//         <div className="message-wrapper">

//           {uniqueMessages.length >
//             0 && (
//             <div className="notification-dot"></div>
//           )}

//           <div className="message-icon">

//             💬

//             <div className="message-dropdown">

//               <h3>
//                 Production Messages
//               </h3>

//               {uniqueMessages.length >
//               0 ? (

//                 uniqueMessages.map(
//                   (
//                     msg,
//                     index
//                   ) => (

//                     <div
//                       key={index}
//                       className="message-card"
//                     >

//                       <div className="message-header">

//                         <strong>
//                           Production Report
//                         </strong>

//                         <span>
//                           {new Date(
//                             msg.created_at
//                           ).toLocaleDateString()}
//                         </span>

//                       </div>

//                       <p>
//                         {msg.comment ||
//                           "No Comment"}
//                       </p>

//                     </div>
//                   )
//                 )

//               ) : (

//                 <div className="empty-message">
//                   No Messages
//                 </div>

//               )}

//             </div>

//           </div>

//         </div>

//       </div>

//       {/* ========================= */}
//       {/* PRODUCTION */}
//       {/* ========================= */}
//     {/* ========================= */}
// {/* PRODUCTION */}
// {/* ========================= */}
// <div className="production-card">

//   <h3 className="section-title">
//     Production
//   </h3>

//   {/* ========================= */}
//   {/* DESKTOP TABLE */}
//   {/* ========================= */}
//   <div className="desktop-production">

//     <div className="production-table-wrapper">

//       <table className="production-table">

//         <thead>

//           <tr>

//             {standards.map((s) => (
//               <th key={s.id}>
//                 {s.bread_type}
//               </th>
//             ))}

//             <th>Total</th>

//           </tr>

//         </thead>

//         <tbody>

//           {/* ========================= */}
//           {/* TOTAL BAGS */}
//           {/* ========================= */}

//           <tr>

//             <td
//               className="row-title"
//               colSpan={standards.length + 1}
//             >
//               Total Bags Produced
//             </td>

//           </tr>

//           <tr>

//             {standards.map((s) => {

//               const type = formatType(s.bread_type);

//               return (

//                 <td key={s.id}>

//                   <input
//                     className="production-input"
//                     type="number"
//                     value={bags[type] || 0}
//                     readOnly
//                   />

//                 </td>

//               );

//             })}

//             <td className="total-cell">

//               {standards.reduce((sum, s) => {

//                 const type = formatType(s.bread_type);

//                 return sum + (Number(bags[type]) || 0);

//               }, 0)}

//             </td>

//           </tr>

//           {/* ========================= */}
//           {/* EXPECTED */}
//           {/* ========================= */}

//           <tr>

//             <td
//               className="row-title"
//               colSpan={standards.length + 1}
//             >
//               Expected Loaves
//             </td>

//           </tr>

//           <tr className="expected-row">

//             {standards.map((s) => (

//               <td key={s.id}>
//                 {getExpected(s.bread_type)}
//               </td>

//             ))}

//             <td className="total-cell">
//               {total(getExpected)}
//             </td>

//           </tr>

//           {/* ========================= */}
//           {/* ACTUAL */}
//           {/* ========================= */}

//           <tr>

//             <td
//               className="row-title"
//               colSpan={standards.length + 1}
//             >
//               Actual Yield
//             </td>

//           </tr>

//           <tr className="actual-row">

//             {standards.map((s) => {

//               const type = formatType(s.bread_type);

//               return (

//                 <td key={s.id}>

//                   <input
//                     className="production-input"
//                     type="number"
//                     value={actual[type] || 0}
//                     readOnly
//                   />

//                 </td>

//               );

//             })}

//             <td className="total-cell">

//               {total(
//                 (t: string) =>
//                   actual[formatType(t)] || 0
//               )}

//             </td>

//           </tr>

//           {/* ========================= */}
//           {/* DIFFERENCE */}
//           {/* ========================= */}

//           <tr>

//             <td
//               className="row-title"
//               colSpan={standards.length + 1}
//             >
//               Difference
//             </td>

//           </tr>

//           <tr className="difference-row">

//             {standards.map((s) => (

//               <td
//                 key={s.id}
//                 className={
//                   getDifference(s.bread_type) !== 0
//                     ? "negative"
//                     : ""
//                 }
//               >

//                 {getDifference(s.bread_type)}

//               </td>

//             ))}

//             <td className="total-cell">

//               {total(getDifference)}

//             </td>

//           </tr>

//         </tbody>

//       </table>

//     </div>

//   </div>

//   {/* ========================= */}
//   {/* MOBILE CARDS */}
//   {/* ========================= */}

//   <div className="mobile-production">

//     {standards.map((s) => {

//       const type = formatType(s.bread_type);

//       return (

//         <div
//           className="bread-card"
//           key={s.id}
//         >

//           <h3>{s.bread_type}</h3>

//           <div className="bread-row">
//             <span>Bags Produced</span>
//             <span>{bags[type] || 0}</span>
//           </div>

//           <div className="bread-row">
//             <span>Expected</span>
//             <span>{getExpected(s.bread_type)}</span>
//           </div>

//           <div className="bread-row">
//             <span>Actual</span>
//             <span>{actual[type] || 0}</span>
//           </div>

//           <div className="bread-row">

//             <span>Difference</span>

//             <span
//               className={
//                 getDifference(s.bread_type) < 0
//                   ? "negative"
//                   : "positive"
//               }
//             >

//               {getDifference(s.bread_type)}

//             </span>

//           </div>

//         </div>

//       );

//     })}

//   </div>

// </div>
//     {/* ========================= */}
// {/* PACKAGING */}
// {/* ========================= */}

// <div className="production-card">

//   <h3 className="section-title">
//     Packaging
//   </h3>

//   {/* ========================= */}
//   {/* DESKTOP TABLE */}
//   {/* ========================= */}

//   <div className="desktop-production">

//     <div className="production-table-wrapper">

//       <table className="production-table">

//         <thead>

//           <tr>

//             {standards.map((s) => (
//               <th key={s.id}>
//                 {s.bread_type}
//               </th>
//             ))}

//             <th>Total</th>

//           </tr>

//         </thead>

//         <tbody>

//           {/* ========================= */}
//           {/* PACKAGED */}
//           {/* ========================= */}

//           <tr>

//             <td
//               className="row-title"
//               colSpan={standards.length + 1}
//             >
//               Packaged
//             </td>

//           </tr>

//           <tr>

//             {standards.map((s) => {

//               const type = formatType(s.bread_type);

//               return (

//                 <td key={s.id}>

//                   <input
//                     className="production-input"
//                     type="number"
//                     value={packaged[type] || 0}
//                     readOnly
//                   />

//                 </td>

//               );

//             })}

//             <td className="total-cell">

//               {total(
//                 (t: string) =>
//                   packaged[formatType(t)] || 0
//               )}

//             </td>

//           </tr>

//           {/* ========================= */}
//           {/* DISPATCH DIFFERENCE */}
//           {/* ========================= */}

//           <tr>

//             <td
//               className="row-title"
//               colSpan={standards.length + 1}
//             >
//               Dispatch Difference
//             </td>

//           </tr>

//           <tr className="difference-row">

//             {standards.map((s) => (

//               <td
//                 key={s.id}
//                 className={
//                   getDispatchDiff(s.bread_type) < 0
//                     ? "negative"
//                     : "positive"
//                 }
//               >

//                 {getDispatchDiff(s.bread_type)}

//               </td>

//             ))}

//             <td className="total-cell">

//               {total(getDispatchDiff)}

//             </td>

//           </tr>

//         </tbody>

//       </table>

//     </div>

//   </div>

//   {/* ========================= */}
//   {/* MOBILE CARDS */}
//   {/* ========================= */}

//   <div className="mobile-production">

//     {standards.map((s) => {

//       const type = formatType(s.bread_type);

//       return (

//         <div
//           className="bread-card"
//           key={s.id}
//         >

//           <h3>{s.bread_type}</h3>

//           <div className="bread-row">

//             <span>Packaged</span>

//             <span>
//               {packaged[type] || 0}
//             </span>

//           </div>

//           <div className="bread-row">

//             <span>Dispatch Difference</span>

//             <span
//               className={
//                 getDispatchDiff(s.bread_type) < 0
//                   ? "negative"
//                   : "positive"
//               }
//             >

//               {getDispatchDiff(s.bread_type)}

//             </span>

//           </div>

//         </div>

//       );

//     })}

//   </div>

// </div>

   

        

//         {/* ========================= */}
//         {/* BUTTON */}
//         {/* ========================= */}
//         <div className="button-group">

//           <button
//             className="production-btn confirm-btn"
//             onClick={
//               confirmProduction
//             }
//           >
//             Confirm Production
//           </button>

//         </div>

//       </div>

//   );
// }

// export default Production;

