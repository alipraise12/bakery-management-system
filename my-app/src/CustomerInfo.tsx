import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "./customerinfo.css";

function CustomerInfo() {

  // =========================
  // STATES
  // =========================

  const [dispatches, setDispatches] =
    useState<any[]>([]);

  const [selectedDispatch, setSelectedDispatch] =
    useState("");

  const [customerData, setCustomerData] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  // =========================
  // LOAD DISPATCHES
  // =========================

  useEffect(() => {

    fetchDispatches();

  }, []);

  // =========================
  // FETCH DISPATCHES
  // =========================

  const fetchDispatches = async () => {

    try {

      const response = await axios.get(
        "http://127.0.0.1:8000/api/customer-dispatch-list/"
      );

      setDispatches(response.data);

    } catch (error) {

      console.log(error);

    }
  };

  // =========================
  // FETCH CUSTOMER INFO
  // =========================

  const fetchCustomerInfo = async (
    dispatchId: string
  ) => {

    try {

      setLoading(true);

      const response = await axios.get(
        `http://127.0.0.1:8000/api/customer-ledger/${dispatchId}/`
      );

      setCustomerData(response.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  };

  // =========================
  // HANDLE SELECT
  // =========================

  const handleSelect = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {

    const value = e.target.value;

    setSelectedDispatch(value);

    if (value) {

      fetchCustomerInfo(value);

    } else {

      setCustomerData(null);

    }
  };

  // =========================
  // SETTLE BREAD
  // =========================

  const settleBread = async (
    bread: any
  ) => {

    const confirmSettle =
      window.confirm(
        "Settle this bread?"
      );

    if (!confirmSettle) return;

    try {

      await axios.post(
        "http://127.0.0.1:8000/api/settle-customer-bread/",
        {

          customer_id:
            customerData.customer_id,

          bread_type:
            bread.bread_type,

          invoice_number:
            bread.invoice_number

        }
      );

      alert(
        "Bread Settled Successfully"
      );

      fetchCustomerInfo(
        selectedDispatch
      );

    } catch (error) {

      console.log(error);

      alert(
        "Failed To Settle Bread"
      );

    }
  };

  // =========================
  // DOWNLOAD PDF
  // =========================

  const downloadCustomerInfo = () => {

    if (!customerData) return;

    const doc = new jsPDF();

    let y = 20;

    // =========================
    // TITLE
    // =========================

    doc.setFontSize(18);

    doc.text(
      "CUSTOMER INFORMATION",
      20,
      y
    );

    y += 15;

    // =========================
    // CUSTOMER DETAILS
    // =========================

    doc.setFontSize(12);

    doc.text(
      `Customer: ${customerData.customer}`,
      20,
      y
    );

    y += 10;

    doc.text(
      `Invoice: ${customerData.invoice}`,
      20,
      y
    );

    y += 10;

    doc.text(
      `Date: ${new Date(
        customerData.date
      ).toLocaleString()}`,
      20,
      y
    );

    y += 20;

    // =========================
    // DISPATCH DETAILS
    // =========================

    doc.setFontSize(14);

    doc.text(
      "Dispatch Details",
      20,
      y
    );

    y += 12;

    doc.setFontSize(11);

    customerData.items.forEach(
      (item: any) => {

        doc.text(
          `Bread Type: ${item.bread_type}`,
          20,
          y
        );

        y += 8;

        doc.text(
          `Bought: ${item.bought}`,
          30,
          y
        );

        y += 8;

        doc.text(
          `Given: ${item.given}`,
          30,
          y
        );

        y += 8;

        doc.text(
          `Owed: ${item.owed}`,
          30,
          y
        );

        y += 12;

      }
    );

    // =========================
    // BREAD OWED
    // =========================

    doc.setFontSize(14);

    doc.text(
      "Bread Company Owes Customer",
      20,
      y
    );

    y += 12;

    doc.setFontSize(11);

    if (
      customerData.bread_owed.length > 0
    ) {

      customerData.bread_owed.forEach(
        (bread: any) => {

          doc.text(
            `Bread Type: ${bread.bread_type}`,
            20,
            y
          );

          y += 8;

          doc.text(
            `Quantity: ${bread.quantity}`,
            30,
            y
          );

          y += 8;

          doc.text(
            `Status: ${bread.status}`,
            30,
            y
          );

          y += 8;

          doc.text(
            `Settled Date: ${
              bread.cleared_at
                ? new Date(
                    bread.cleared_at
                  ).toLocaleString()
                : "----"
            }`,
            30,
            y
          );

          y += 12;

        }
      );

    } else {

      doc.text(
        "No Bread Owed",
        20,
        y
      );

    }

    // =========================
    // SAVE PDF
    // =========================

    doc.save(
      `${customerData.customer}_info.pdf`
    );
  };

  // =========================
  // FILTER DISPATCHES
  // =========================

  const filteredDispatches =
    dispatches.filter(
      (dispatch: any) => {

        const search =
          searchTerm.toLowerCase();

        return (

          dispatch.customer
            .toLowerCase()
            .includes(search)

          ||

          dispatch.invoice
            .toLowerCase()
            .includes(search)

          ||

          (
            dispatch.phone &&
            dispatch.phone
              .toLowerCase()
              .includes(search)
          )

        );

      }
    );

  // =========================
  // TOTAL BREAD OWED
  // =========================

  const totalBreadOwed =
    customerData?.bread_owed?.reduce(
      (
        total: number,
        item: any
      ) => total + item.quantity,
      0
    ) || 0;

  // =========================
  // UI
  // =========================

  return (

    <div className="customer-info-container">

      {/* HEADER */}

      <div className="header">

        <h1>
          CUSTOMER INFO
        </h1>

      </div>

      {/* SEARCH + DROPDOWN */}

      <div className="top-section">

        <label>
          Search Customer
        </label>

        <input
          type="text"
          placeholder="
          Search by name,
          phone or invoice"
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }
          className="search-input"
        />

        <label>
          Select Customer & Invoice
        </label>

        <select
          value={selectedDispatch}
          onChange={handleSelect}
        >

          <option value="">
            Select Customer & Invoice
          </option>

          {filteredDispatches.map(
            (dispatch) => (

            <option
              key={dispatch.id}
              value={dispatch.id}
            >

              {dispatch.customer}
              {" - "}
              {dispatch.invoice}

            </option>

          ))}

        </select>

      </div>

      {/* LOADING */}

      {loading && (

        <div className="loading-box">

          Loading Customer Info...

        </div>

      )}

      {/* CUSTOMER DATA */}

      {customerData && !loading && (

        <>

          {/* INFO CARD */}

          <div className="info-card">

            <div className="card-box">

              <h3>
                Customer
              </h3>

              <p>
                {customerData.customer}
              </p>

            </div>

            <div className="card-box">

              <h3>
                Invoice
              </h3>

              <p>
                {customerData.invoice}
              </p>

            </div>

            <div className="card-box">

              <h3>
                Date
              </h3>

              <p>
                {new Date(
                  customerData.date
                ).toLocaleString()}
              </p>

            </div>

            <div className="card-box owed-card">

              <h3>
                Total Bread Owed
              </h3>

              <p>
                {totalBreadOwed}
              </p>

            </div>

          </div>

          {/* DISPATCH DETAILS */}

          <div className="table-section">

            <h2>
              DISPATCH DETAILS
            </h2>

            <table>

              <thead>

                <tr>

                  <th>
                    Bread Type
                  </th>

                  <th>
                    Bought
                  </th>

                  <th>
                    Given
                  </th>

                  <th>
                    Owed
                  </th>

                </tr>

              </thead>

              <tbody>

                {customerData.items.length > 0 ? (

                  customerData.items.map(
                    (
                      item: any,
                      index: number
                    ) => (

                    <tr key={index}>

                      <td>
                        {item.bread_type}
                      </td>

                      <td>
                        {item.bought}
                      </td>

                      <td>
                        {item.given}
                      </td>

                      <td>
                        {item.owed}
                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center"
                      }}
                    >

                      No Dispatch Record Found

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* BREAD OWED */}

          <div className="table-section">

            <h2>
              BREAD COMPANY OWES CUSTOMER
            </h2>

            <table>

              <thead>

                <tr>

                  <th>
                    Bread Type
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Settled Date
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {customerData.bread_owed.length > 0 ? (

                  customerData.bread_owed.map(
                    (
                      bread: any,
                      index: number
                    ) => (

                    <tr key={index}>

                      <td>
                        {bread.bread_type}
                      </td>

                      <td>
                        {bread.quantity}
                      </td>

                      <td>
                        {bread.status}
                      </td>

                      <td>

                        {bread.cleared_at
                          ? new Date(
                              bread.cleared_at
                            ).toLocaleString()
                          : "----"}

                      </td>

                      <td>

                        {bread.status ===
                        "Pending" ? (

                          <button
                            className="settle-btn"
                            onClick={() =>
                              settleBread(
                                bread
                              )
                            }
                          >

                            SETTLE

                          </button>

                        ) : (

                          <span className="settled-text">

                            Settled

                          </span>

                        )}

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center"
                      }}
                    >

                      No Bread Owed

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* DOWNLOAD BUTTON */}

          <div className="button-section">

            <button
              className="download-btn"
              onClick={downloadCustomerInfo}
            >

              DOWNLOAD CUSTOMER INFO

            </button>

          </div>

        </>

      )}

    </div>
  );
}

export default CustomerInfo;













// import { useEffect, useState } from "react";
// import axios from "axios";
// import jsPDF from "jspdf";
// import "./customerinfo.css";

// function CustomerInfo() {

//   // =========================
//   // STATES
//   // =========================

//   const [dispatches, setDispatches] =
//     useState<any[]>([]);

//   const [selectedDispatch, setSelectedDispatch] =
//     useState("");

//   const [customerData, setCustomerData] =
//     useState<any>(null);

//   const [loading, setLoading] =
//     useState(false);

//   // =========================
//   // LOAD DISPATCHES
//   // =========================

//   useEffect(() => {

//     fetchDispatches();

//   }, []);

//   // =========================
//   // FETCH DISPATCHES
//   // =========================

//   const fetchDispatches = async () => {

//     try {

//       const response = await axios.get(
//         "http://127.0.0.1:8000/api/customer-dispatch-list/"
//       );

//       setDispatches(response.data);

//     } catch (error) {

//       console.log(error);

//     }
//   };

//   // =========================
//   // FETCH CUSTOMER INFO
//   // =========================

//   const fetchCustomerInfo = async (
//     dispatchId: string
//   ) => {

//     try {

//       setLoading(true);

//       const response = await axios.get(
//         `http://127.0.0.1:8000/api/customer-ledger/${dispatchId}/`
//       );

//       setCustomerData(response.data);

//     } catch (error) {

//       console.log(error);

//     } finally {

//       setLoading(false);

//     }
//   };

//   // =========================
//   // HANDLE SELECT
//   // =========================

//   const handleSelect = (
//     e: React.ChangeEvent<HTMLSelectElement>
//   ) => {

//     const value = e.target.value;

//     setSelectedDispatch(value);

//     if (value) {

//       fetchCustomerInfo(value);

//     } else {

//       setCustomerData(null);

//     }
//   };

//   // =========================
//   // SETTLE BREAD
//   // =========================

//   const settleBread = async (
//     bread: any
//   ) => {

//     const confirmSettle =
//       window.confirm(
//         "Settle this bread?"
//       );

//     if (!confirmSettle) return;

//     try {

//       await axios.post(
//         "http://127.0.0.1:8000/api/settle-customer-bread/",
//         {

//           customer_id:
//             customerData.customer_id,

//           bread_type:
//             bread.bread_type,

//           invoice_number:
//             bread.invoice_number

//         }
//       );

//       alert(
//         "Bread Settled Successfully"
//       );

//       fetchCustomerInfo(
//         selectedDispatch
//       );

//     } catch (error) {

//       console.log(error);

//       alert(
//         "Failed To Settle Bread"
//       );

//     }
//   };

//   // =========================
//   // DOWNLOAD PDF
//   // =========================

//   const downloadCustomerInfo = () => {

//     if (!customerData) return;

//     const doc = new jsPDF();

//     let y = 20;

//     // =========================
//     // TITLE
//     // =========================

//     doc.setFontSize(18);

//     doc.text(
//       "CUSTOMER INFORMATION",
//       20,
//       y
//     );

//     y += 15;

//     // =========================
//     // CUSTOMER DETAILS
//     // =========================

//     doc.setFontSize(12);

//     doc.text(
//       `Customer: ${customerData.customer}`,
//       20,
//       y
//     );

//     y += 10;

//     doc.text(
//       `Invoice: ${customerData.invoice}`,
//       20,
//       y
//     );

//     y += 10;

//     doc.text(
//       `Date: ${new Date(
//         customerData.date
//       ).toLocaleString()}`,
//       20,
//       y
//     );

//     y += 20;

//     // =========================
//     // DISPATCH DETAILS
//     // =========================

//     doc.setFontSize(14);

//     doc.text(
//       "Dispatch Details",
//       20,
//       y
//     );

//     y += 12;

//     doc.setFontSize(11);

//     customerData.items.forEach(
//       (item: any) => {

//         doc.text(
//           `Bread Type: ${item.bread_type}`,
//           20,
//           y
//         );

//         y += 8;

//         doc.text(
//           `Bought: ${item.bought}`,
//           30,
//           y
//         );

//         y += 8;

//         doc.text(
//           `Given: ${item.given}`,
//           30,
//           y
//         );

//         y += 8;

//         doc.text(
//           `Owed: ${item.owed}`,
//           30,
//           y
//         );

//         y += 12;

//       }
//     );

//     // =========================
//     // BREAD OWED
//     // =========================

//     doc.setFontSize(14);

//     doc.text(
//       "Bread Company Owes Customer",
//       20,
//       y
//     );

//     y += 12;

//     doc.setFontSize(11);

//     if (
//       customerData.bread_owed.length > 0
//     ) {

//       customerData.bread_owed.forEach(
//         (bread: any) => {

//           doc.text(
//             `Bread Type: ${bread.bread_type}`,
//             20,
//             y
//           );

//           y += 8;

//           doc.text(
//             `Quantity: ${bread.quantity}`,
//             30,
//             y
//           );

//           y += 8;

//           doc.text(
//             `Status: ${bread.status}`,
//             30,
//             y
//           );

//           y += 8;

//           doc.text(
//             `Settled Date: ${
//               bread.cleared_at
//                 ? new Date(
//                     bread.cleared_at
//                   ).toLocaleString()
//                 : "----"
//             }`,
//             30,
//             y
//           );

//           y += 12;

//         }
//       );

//     } else {

//       doc.text(
//         "No Bread Owed",
//         20,
//         y
//       );

//     }

//     // =========================
//     // SAVE PDF
//     // =========================

//     doc.save(
//       `${customerData.customer}_info.pdf`
//     );
//   };

//   // =========================
//   // TOTAL BREAD OWED
//   // =========================

//   const totalBreadOwed =
//     customerData?.bread_owed?.reduce(
//       (
//         total: number,
//         item: any
//       ) => total + item.quantity,
//       0
//     ) || 0;

//   // =========================
//   // UI
//   // =========================

//   return (

//     <div className="customer-info-container">

//       {/* HEADER */}

//       <div className="header">

//         <h1>
//           CUSTOMER INFO
//         </h1>

//       </div>

//       {/* DROPDOWN */}

//       <div className="top-section">

//         <label>
//           Select Customer & Invoice
//         </label>

//         <select
//           value={selectedDispatch}
//           onChange={handleSelect}
//         >

//           <option value="">
//             Select Customer & Invoice
//           </option>

//           {dispatches.map((dispatch) => (

//             <option
//               key={dispatch.id}
//               value={dispatch.id}
//             >

//               {dispatch.customer}
//               {" - "}
//               {dispatch.invoice}

//             </option>

//           ))}

//         </select>

//       </div>

//       {/* LOADING */}

//       {loading && (

//         <div className="loading-box">

//           Loading Customer Info...

//         </div>

//       )}

//       {/* CUSTOMER DATA */}

//       {customerData && !loading && (

//         <>

//           {/* INFO CARD */}

//           <div className="info-card">

//             <div className="card-box">

//               <h3>
//                 Customer
//               </h3>

//               <p>
//                 {customerData.customer}
//               </p>

//             </div>

//             <div className="card-box">

//               <h3>
//                 Invoice
//               </h3>

//               <p>
//                 {customerData.invoice}
//               </p>

//             </div>

//             <div className="card-box">

//               <h3>
//                 Date
//               </h3>

//               <p>
//                 {new Date(
//                   customerData.date
//                 ).toLocaleString()}
//               </p>

//             </div>

//             <div className="card-box owed-card">

//               <h3>
//                 Total Bread Owed
//               </h3>

//               <p>
//                 {totalBreadOwed}
//               </p>

//             </div>

//           </div>

//           {/* DISPATCH TABLE */}

//           <div className="table-section">

//             <h2>
//               DISPATCH DETAILS
//             </h2>

//             <table>

//               <thead>

//                 <tr>

//                   <th>
//                     Bread Type
//                   </th>

//                   <th>
//                     Bought
//                   </th>

//                   <th>
//                     Given
//                   </th>

//                   <th>
//                     Owed
//                   </th>

//                 </tr>

//               </thead>

//               <tbody>

//                 {customerData.items.length > 0 ? (

//                   customerData.items.map(
//                     (
//                       item: any,
//                       index: number
//                     ) => (

//                     <tr key={index}>

//                       <td>
//                         {item.bread_type}
//                       </td>

//                       <td>
//                         {item.bought}
//                       </td>

//                       <td>
//                         {item.given}
//                       </td>

//                       <td>
//                         {item.owed}
//                       </td>

//                     </tr>

//                   ))

//                 ) : (

//                   <tr>

//                     <td
//                       colSpan={4}
//                       style={{
//                         textAlign: "center"
//                       }}
//                     >

//                       No Dispatch Record Found

//                     </td>

//                   </tr>

//                 )}

//               </tbody>

//             </table>

//           </div>

//           {/* BREAD OWED */}

//           <div className="table-section">

//             <h2>
//               BREAD COMPANY OWES CUSTOMER
//             </h2>

//             <table>

//               <thead>

//                 <tr>

//                   <th>
//                     Bread Type
//                   </th>

//                   <th>
//                     Quantity
//                   </th>

//                   <th>
//                     Status
//                   </th>

//                   <th>
//                     Settled Date
//                   </th>

//                   <th>
//                     Action
//                   </th>

//                 </tr>

//               </thead>

//               <tbody>

//                 {customerData.bread_owed.length > 0 ? (

//                   customerData.bread_owed.map(
//                     (
//                       bread: any,
//                       index: number
//                     ) => (

//                     <tr key={index}>

//                       <td>
//                         {bread.bread_type}
//                       </td>

//                       <td>
//                         {bread.quantity}
//                       </td>

//                       <td>
//                         {bread.status}
//                       </td>

//                       <td>

//                         {bread.cleared_at
//                           ? new Date(
//                               bread.cleared_at
//                             ).toLocaleString()
//                           : "----"}

//                       </td>

//                       <td>

//                         {bread.status ===
//                         "Pending" ? (

//                           <button
//                             className="settle-btn"
//                             onClick={() =>
//                               settleBread(
//                                 bread
//                               )
//                             }
//                           >

//                             SETTLE

//                           </button>

//                         ) : (

//                           <span className="settled-text">

//                             Settled

//                           </span>

//                         )}

//                       </td>

//                     </tr>

//                   ))

//                 ) : (

//                   <tr>

//                     <td
//                       colSpan={5}
//                       style={{
//                         textAlign: "center"
//                       }}
//                     >

//                       No Bread Owed

//                     </td>

//                   </tr>

//                 )}

//               </tbody>

//             </table>

//           </div>

//           {/* DOWNLOAD BUTTON */}

//           <div className="button-section">

//             <button
//               className="download-btn"
//               onClick={downloadCustomerInfo}
//             >

//               DOWNLOAD CUSTOMER INFO

//             </button>

//           </div>

//         </>

//       )}

//     </div>
//   );
// }

// export default CustomerInfo;