import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import "./ledger.css";

function CustomerLedger() {

  // ================= ROUTE PARAM =================

  const { id } = useParams();

  // ================= STATES =================

  const [customers, setCustomers] = useState<any[]>([]);

  const [customer, setCustomer] = useState<any>(null);

  const [sales, setSales] = useState<any[]>([]);

  const [searchInvoice, setSearchInvoice] = useState("");

  const [paymentAmount, setPaymentAmount] = useState("");

  const [selectedSale, setSelectedSale] =
    useState<any>(null);

  // ================= FORMAT MONEY =================

  const formatMoney = (value: any) => {

    return Number(
      value || 0
    ).toLocaleString();

  };

  // ================= FETCH SALES =================

  const fetchCustomerSales = (
    customerId: any
  ) => {

    axios
      .get(
        `http://127.0.0.1:8000/api/customer-sales/${customerId}/`
      )
      .then((res) => {

        setSales(res.data);

      })
      .catch(() => {

        setSales([]);

      });

  };

  // ================= FETCH CUSTOMERS =================

  useEffect(() => {

    axios
      .get(
        "http://127.0.0.1:8000/api/customers/"
      )
      .then((res) => {

        setCustomers(res.data);

        // ================= AUTO SELECT CUSTOMER =================

        if (id) {

          const selected =
            res.data.find(
              (c: any) =>
                c.id == id
            );

          if (selected) {

            setCustomer(
              selected
            );

            fetchCustomerSales(
              selected.id
            );

          }
        }

      });

  }, [id]);

  // ================= SELECT CUSTOMER =================

  const handleCustomerSelect = (
    value: any
  ) => {

    const selected =
      customers.find(
        (c) =>
          c.id == value
      );

    setCustomer(selected);

    if (selected) {

      fetchCustomerSales(
        selected.id
      );

    }
  };

  // ================= TOTAL DEBT =================

  const totalDebt =
    sales.reduce(
      (sum, sale) =>
        sum +
        Number(
          sale.balance || 0
        ),
      0
    );

  // ================= SEARCH =================

  const filteredSales =
    sales.filter((sale) =>
      sale.invoice_number
        .toLowerCase()
        .includes(
          searchInvoice.toLowerCase()
        )
    );

  // ================= PAY DEBT =================

  const payDebt = async () => {

    if (!selectedSale) {

      alert(
        "Select invoice first"
      );

      return;

    }

    const amount =
      Number(paymentAmount);

    if (amount <= 0) {

      alert(
        "Enter valid amount"
      );

      return;

    }

    try {

      await axios.post(
        `http://127.0.0.1:8000/api/pay-debt/${selectedSale.id}/`,
        {
          amount,
        }
      );

      // ================= UPDATE SALES IMMEDIATELY =================

      const updatedSales =
        sales.map((sale: any) => {

          if (
            sale.id ===
            selectedSale.id
          ) {

            const updatedPaid =
              Number(sale.paid) +
              amount;

            const updatedBalance =
              Number(sale.balance) -
              amount;

            return {

              ...sale,

              paid:
                updatedPaid,

              balance:
                updatedBalance,

              payments: [

                ...(sale.payments || []),

                {
                  amount,
                  date:
                    new Date().toISOString(),
                },
              ],
            };
          }

          return sale;
        });

      // ================= UPDATE TABLE =================

      setSales(updatedSales);

      // ================= UPDATE SELECTED SALE =================

      const updatedSelected =
        updatedSales.find(
          (s: any) =>
            s.id ===
            selectedSale.id
        );

      setSelectedSale(
        updatedSelected
      );

      // ================= CLEAR INPUT =================

      setPaymentAmount("");

      alert(
        "✅ Payment recorded"
      );

      // ================= AUTO CLOSE IF FULLY PAID =================

      if (
        updatedSelected.balance <= 0
      ) {

        setTimeout(() => {

          setSelectedSale(
            null
          );

        }, 1000);

      }

    } catch (error) {

      alert(
        "Payment failed"
      );

    }

  };

  // ================= PDF =================

  const generateLedgerPDF = () => {

    if (!customer) {

      alert(
        "Select customer"
      );

      return;

    }

    const doc =
      new jsPDF();

    let y = 15;

    // TITLE

    doc.setFontSize(20);

    doc.text(
      "CUSTOMER LEDGER",
      65,
      y
    );

    y += 15;

    // CUSTOMER INFO

    doc.setFontSize(11);

    doc.text(
      `Customer: ${customer.name}`,
      15,
      y
    );

    y += 7;

    doc.text(
      `Phone: ${customer.phone}`,
      15,
      y
    );

    y += 7;

    doc.text(
      `Generated: ${new Date().toLocaleString()}`,
      15,
      y
    );

    y += 12;

    // TABLE HEADER

    doc.setFontSize(10);

    doc.text(
      "Invoice",
      15,
      y
    );

    doc.text(
      "Total",
      55,
      y
    );

    doc.text(
      "Paid",
      90,
      y
    );

    doc.text(
      "Balance",
      125,
      y
    );

    doc.text(
      "Date",
      160,
      y
    );

    y += 7;

    filteredSales.forEach(
      (sale: any) => {

        doc.text(
          sale.invoice_number,
          15,
          y
        );

        doc.text(
          `₦${formatMoney(
            sale.total
          )}`,
          55,
          y
        );

        doc.text(
          `₦${formatMoney(
            sale.paid
          )}`,
          90,
          y
        );

        doc.text(
          `₦${formatMoney(
            sale.balance
          )}`,
          125,
          y
        );

        doc.text(
          new Date(
            sale.created_at
          ).toLocaleDateString(),
          160,
          y
        );

        y += 8;

      }
    );

    y += 10;

    doc.setFontSize(12);

    doc.text(
      `Total Debt: ₦${formatMoney(totalDebt)}`,
      15,
      y
    );

    doc.save(
      `${customer.name}-ledger.pdf`
    );

  };

  return (

    <div className="ledger-container">

      <div className="ledger-header">

        <h1>
          📒 Customer Ledger
        </h1>

      </div>

      {/* CUSTOMER */}

      <div className="ledger-card">

        <label>
          Select Customer
        </label>

        <select
          value={
            customer?.id || ""
          }
          onChange={(e) =>
            handleCustomerSelect(
              e.target.value
            )
          }
        >

          <option value="">
            Select Customer
          </option>

          {customers.map(
            (c) => (

              <option
                key={c.id}
                value={c.id}
              >
                {c.name}
              </option>

            )
          )}

        </select>

      </div>

      {/* SEARCH */}

      {customer && (

        <div className="ledger-card">

          <label>
            Search Invoice
          </label>

          <input
            type="text"
            placeholder="Enter Invoice Number"
            value={
              searchInvoice
            }
            onChange={(e) =>
              setSearchInvoice(
                e.target.value
              )
            }
          />

        </div>

      )}

      {/* TOTAL DEBT */}

      {customer && (

        <div className="debt-box">

          <h2>
            Total Debt:
            {" "}
            ₦
            {formatMoney(
              totalDebt
            )}
          </h2>

        </div>

      )}

      {/* HISTORY */}

      {customer && (

        <div className="history-section">

          <h2>
            Purchase History
          </h2>

          {filteredSales.length ===
          0 ? (

            <div className="empty-box">
              No purchase yet
            </div>

          ) : (

            <table className="ledger-table">

              <thead>

                <tr>
                  <th>
                    Invoice
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Paid
                  </th>

                  <th>
                    Balance
                  </th>

                  <th>
                    Date & Payment History
                  </th>

                  <th>
                    Action
                  </th>
                </tr>

              </thead>

              <tbody>

                {filteredSales.map(
                  (
                    sale: any,
                    index: number
                  ) => (

                    <tr key={index}>

                      <td>
                        {
                          sale.invoice_number
                        }
                      </td>

                      <td>
                        ₦
                        {formatMoney(
                          sale.total
                        )}
                      </td>

                      <td>
                        ₦
                        {formatMoney(
                          sale.paid
                        )}
                      </td>

                      <td
                        className={
                          sale.balance >
                          0
                            ? "debt"
                            : "paid"
                        }
                      >
                        ₦
                        {formatMoney(
                          sale.balance
                        )}
                      </td>

                      <td>

                        <div>
                          {new Date(
                            sale.created_at
                          ).toLocaleString()}
                        </div>

                        {sale.payments?.map(
                          (
                            payment: any,
                            i: number
                          ) => (

                            <div
                              key={i}
                              className="payment-history"
                            >
                              Paid ₦
                              {formatMoney(
                                payment.amount
                              )}
                              {" "}
                              on{" "}
                              {new Date(
                                payment.date
                              ).toLocaleString()}
                            </div>

                          )
                        )}

                      </td>

                      <td>

                        {sale.balance >
                          0 && (

                          <button
                            className="pay-btn"
                            onClick={() =>
                              setSelectedSale(
                                sale
                              )
                            }
                          >
                            Pay Debt
                          </button>

                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </div>

      )}

      {/* PAYMENT BOX */}

      {selectedSale && (

        <div className="payment-box">

          <h3>
            Pay Debt -
            {" "}
            {
              selectedSale.invoice_number
            }
          </h3>

          <p>
            Remaining Debt:
            {" "}
            ₦
            {formatMoney(
              selectedSale.balance
            )}
          </p>

          <input
            type="number"
            placeholder="Enter amount"
            value={
              paymentAmount
            }
            onChange={(e) =>
              setPaymentAmount(
                e.target.value
              )
            }
          />

          <button
            className="confirm-btn"
            onClick={payDebt}
          >
            Confirm Payment
          </button>

          <button
            className="cancel-btn"
            onClick={() =>
              setSelectedSale(
                null
              )
            }
          >
            Cancel
          </button>

        </div>

      )}

      {/* PDF */}

      {customer && (

        <div className="pdf-section">

          <button
            className="pdf-btn"
            onClick={
              generateLedgerPDF
            }
          >
            📄 Download Ledger PDF
          </button>

        </div>

      )}

    </div>

  );
}

export default CustomerLedger;








// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import jsPDF from "jspdf";
// import "./ledger.css";

// function CustomerLedger() {

//   // ================= ROUTE PARAM =================

//   const { id } = useParams();

//   // ================= STATES =================

//   const [customers, setCustomers] = useState<any[]>([]);

//   const [customer, setCustomer] = useState<any>(null);

//   const [sales, setSales] = useState<any[]>([]);

//   const [searchInvoice, setSearchInvoice] = useState("");

//   const [paymentAmount, setPaymentAmount] = useState("");

//   const [selectedSale, setSelectedSale] =
//     useState<any>(null);

//   // ================= FORMAT MONEY =================

//   const formatMoney = (value: any) => {

//     return Number(
//       value || 0
//     ).toLocaleString();

//   };

//   // ================= FETCH SALES =================

//   const fetchCustomerSales = (
//     customerId: any
//   ) => {

//     axios
//       .get(
//         `http://127.0.0.1:8000/api/customer-sales/${customerId}/`
//       )
//       .then((res) => {

//         setSales(res.data);

//       })
//       .catch(() => {

//         setSales([]);

//       });

//   };

//   // ================= FETCH CUSTOMERS =================

//   useEffect(() => {

//     axios
//       .get(
//         "http://127.0.0.1:8000/api/customers/"
//       )
//       .then((res) => {

//         setCustomers(res.data);

//         // ================= AUTO SELECT CUSTOMER =================

//         if (id) {

//           const selected =
//             res.data.find(
//               (c: any) =>
//                 c.id == id
//             );

//           if (selected) {

//             setCustomer(
//               selected
//             );

//             fetchCustomerSales(
//               selected.id
//             );

//           }
//         }

//       });

//   }, [id]);

//   // ================= SELECT CUSTOMER =================

//   const handleCustomerSelect = (
//     value: any
//   ) => {

//     const selected =
//       customers.find(
//         (c) =>
//           c.id == value
//       );

//     setCustomer(selected);

//     if (selected) {

//       fetchCustomerSales(
//         selected.id
//       );

//     }
//   };

//   // ================= TOTAL DEBT =================

//   const totalDebt =
//     sales.reduce(
//       (sum, sale) =>
//         sum +
//         Number(
//           sale.balance || 0
//         ),
//       0
//     );

//   // ================= SEARCH =================

//   const filteredSales =
//     sales.filter((sale) =>
//       sale.invoice_number
//         .toLowerCase()
//         .includes(
//           searchInvoice.toLowerCase()
//         )
//     );

//   // ================= PAY DEBT =================

//   const payDebt = () => {

//     if (!selectedSale) {

//       alert(
//         "Select invoice first"
//       );

//       return;

//     }

//     axios
//       .post(
//         `http://127.0.0.1:8000/api/pay-debt/${selectedSale.id}/`,
//         {
//           amount: Number(
//             paymentAmount
//           ),
//         }
//       )
//       .then(() => {

//         alert(
//           "✅ Payment recorded"
//         );

//         setPaymentAmount("");

//         setSelectedSale(null);

//         fetchCustomerSales(
//           customer.id
//         );

//       });

//   };

//   // ================= PDF =================

//   const generateLedgerPDF = () => {

//     if (!customer) {

//       alert(
//         "Select customer"
//       );

//       return;

//     }

//     const doc =
//       new jsPDF();

//     let y = 15;

//     // TITLE

//     doc.setFontSize(20);

//     doc.text(
//       "CUSTOMER LEDGER",
//       65,
//       y
//     );

//     y += 15;

//     // CUSTOMER INFO

//     doc.setFontSize(11);

//     doc.text(
//       `Customer: ${customer.name}`,
//       15,
//       y
//     );

//     y += 7;

//     doc.text(
//       `Phone: ${customer.phone}`,
//       15,
//       y
//     );

//     y += 7;

//     doc.text(
//       `Generated: ${new Date().toLocaleString()}`,
//       15,
//       y
//     );

//     y += 12;

//     // TABLE HEADER

//     doc.setFontSize(10);

//     doc.text(
//       "Invoice",
//       15,
//       y
//     );

//     doc.text(
//       "Total",
//       55,
//       y
//     );

//     doc.text(
//       "Paid",
//       90,
//       y
//     );

//     doc.text(
//       "Balance",
//       125,
//       y
//     );

//     doc.text(
//       "Date",
//       160,
//       y
//     );

//     y += 7;

//     filteredSales.forEach(
//       (sale: any) => {

//         doc.text(
//           sale.invoice_number,
//           15,
//           y
//         );

//         doc.text(
//           `₦${formatMoney(
//             sale.total
//           )}`,
//           55,
//           y
//         );

//         doc.text(
//           `₦${formatMoney(
//             sale.paid
//           )}`,
//           90,
//           y
//         );

//         doc.text(
//           `₦${formatMoney(
//             sale.balance
//           )}`,
//           125,
//           y
//         );

//         doc.text(
//           new Date(
//             sale.created_at
//           ).toLocaleDateString(),
//           160,
//           y
//         );

//         y += 8;

//       }
//     );

//     y += 10;

//     doc.setFontSize(12);

//     doc.text(
//       `Total Debt: ₦${formatMoney(totalDebt)}`,
//       15,
//       y
//     );

//     doc.save(
//       `${customer.name}-ledger.pdf`
//     );

//   };

//   return (

//     <div className="ledger-container">

//       <div className="ledger-header">

//         <h1>
//           📒 Customer Ledger
//         </h1>

//       </div>

//       {/* CUSTOMER */}

//       <div className="ledger-card">

//         <label>
//           Select Customer
//         </label>

//         <select
//           value={
//             customer?.id || ""
//           }
//           onChange={(e) =>
//             handleCustomerSelect(
//               e.target.value
//             )
//           }
//         >

//           <option value="">
//             Select Customer
//           </option>

//           {customers.map(
//             (c) => (

//               <option
//                 key={c.id}
//                 value={c.id}
//               >
//                 {c.name}
//               </option>

//             )
//           )}

//         </select>

//       </div>

//       {/* SEARCH */}

//       {customer && (

//         <div className="ledger-card">

//           <label>
//             Search Invoice
//           </label>

//           <input
//             type="text"
//             placeholder="Enter Invoice Number"
//             value={
//               searchInvoice
//             }
//             onChange={(e) =>
//               setSearchInvoice(
//                 e.target.value
//               )
//             }
//           />

//         </div>

//       )}

//       {/* TOTAL DEBT */}

//       {customer && (

//         <div className="debt-box">

//           <h2>
//             Total Debt:
//             {" "}
//             ₦
//             {formatMoney(
//               totalDebt
//             )}
//           </h2>

//         </div>

//       )}

//       {/* HISTORY */}

//       {customer && (

//         <div className="history-section">

//           <h2>
//             Purchase History
//           </h2>

//           {filteredSales.length ===
//           0 ? (

//             <div className="empty-box">
//               No purchase yet
//             </div>

//           ) : (

//             <table className="ledger-table">

//               <thead>

//                 <tr>
//                   <th>
//                     Invoice
//                   </th>

//                   <th>
//                     Total
//                   </th>

//                   <th>
//                     Paid
//                   </th>

//                   <th>
//                     Balance
//                   </th>

//                   <th>
//                     Date & Payment
//                     History
//                   </th>

//                   <th>
//                     Action
//                   </th>
//                 </tr>

//               </thead>

//               <tbody>

//                 {filteredSales.map(
//                   (
//                     sale: any,
//                     index: number
//                   ) => (

//                     <tr key={index}>

//                       <td>
//                         {
//                           sale.invoice_number
//                         }
//                       </td>

//                       <td>
//                         ₦
//                         {formatMoney(
//                           sale.total
//                         )}
//                       </td>

//                       <td>
//                         ₦
//                         {formatMoney(
//                           sale.paid
//                         )}
//                       </td>

//                       <td
//                         className={
//                           sale.balance >
//                           0
//                             ? "debt"
//                             : "paid"
//                         }
//                       >
//                         ₦
//                         {formatMoney(
//                           sale.balance
//                         )}
//                       </td>

//                       <td>

//                         <div>
//                           {new Date(
//                             sale.created_at
//                           ).toLocaleString()}
//                         </div>

//                         {sale.payments?.map(
//                           (
//                             payment: any,
//                             i: number
//                           ) => (

//                             <div
//                               key={i}
//                               className="payment-history"
//                             >
//                               Paid ₦
//                               {formatMoney(
//                                 payment.amount
//                               )}
//                               {" "}
//                               on{" "}
//                               {new Date(
//                                 payment.date
//                               ).toLocaleString()}
//                             </div>

//                           )
//                         )}

//                       </td>

//                       <td>

//                         {sale.balance >
//                           0 && (

//                           <button
//                             className="pay-btn"
//                             onClick={() =>
//                               setSelectedSale(
//                                 sale
//                               )
//                             }
//                           >
//                             Pay Debt
//                           </button>

//                         )}

//                       </td>

//                     </tr>

//                   )
//                 )}

//               </tbody>

//             </table>

//           )}

//         </div>

//       )}

//       {/* PAYMENT BOX */}

//       {selectedSale && (

//         <div className="payment-box">

//           <h3>
//             Pay Debt -
//             {" "}
//             {
//               selectedSale.invoice_number
//             }
//           </h3>

//           <p>
//             Remaining Debt:
//             {" "}
//             ₦
//             {formatMoney(
//               selectedSale.balance
//             )}
//           </p>

//           <input
//             type="number"
//             placeholder="Enter amount"
//             value={
//               paymentAmount
//             }
//             onChange={(e) =>
//               setPaymentAmount(
//                 e.target.value
//               )
//             }
//           />

//           <button
//             className="confirm-btn"
//             onClick={payDebt}
//           >
//             Confirm Payment
//           </button>

//           <button
//             className="cancel-btn"
//             onClick={() =>
//               setSelectedSale(
//                 null
//               )
//             }
//             style={{
//               marginLeft:
//                 "10px",
//             }}
//           >
//             Cancel
//           </button>

//         </div>

//       )}

//       {/* PDF */}

//       {customer && (

//         <div className="pdf-section">

//           <button
//             className="pdf-btn"
//             onClick={
//               generateLedgerPDF
//             }
//           >
//             📄 Download Ledger
//             PDF
//           </button>

//         </div>

//       )}

//     </div>

//   );
// }

// export default CustomerLedger;








// import { useEffect, useState } from "react";
// import axios from "axios";
// import jsPDF from "jspdf";
// import "./ledger.css";

// function CustomerLedger() {
//   const [customers, setCustomers] = useState<any[]>([]);
//   const [customer, setCustomer] = useState<any>(null);
//   const [sales, setSales] = useState<any[]>([]);
//   const [searchInvoice, setSearchInvoice] = useState("");
//   const [paymentAmount, setPaymentAmount] = useState("");
//   const [selectedSale, setSelectedSale] = useState<any>(null);

//   // ================= FORMAT MONEY =================
//   const formatMoney = (value: any) => {
//     return Number(value || 0).toLocaleString();
//   };

//   // ================= FETCH CUSTOMERS =================
//   useEffect(() => {
//     axios
//       .get("http://127.0.0.1:8000/api/customers/")
//       .then((res) => setCustomers(res.data));
//   }, []);

//   // ================= FETCH SALES =================
//   const fetchCustomerSales = (customerId: any) => {
//     axios
//       .get(`http://127.0.0.1:8000/api/customer-sales/${customerId}/`)
//       .then((res) => {
//         setSales(res.data);
//       })
//       .catch(() => {
//         setSales([]);
//       });
//   };

//   // ================= SELECT CUSTOMER =================
//   const handleCustomerSelect = (value: any) => {
//     const selected = customers.find((c) => c.id == value);
//     setCustomer(selected);
//     if (selected) {
//       fetchCustomerSales(selected.id);
//     }
//   };

//   // ================= TOTAL DEBT =================
//   const totalDebt = sales.reduce(
//     (sum, sale) => sum + Number(sale.balance || 0),
//     0
//   );

//   // ================= SEARCH =================
//   const filteredSales = sales.filter((sale) =>
//     sale.invoice_number.toLowerCase().includes(searchInvoice.toLowerCase())
//   );

//   // ================= PAY DEBT =================
//   const payDebt = () => {
//     if (!selectedSale) {
//       alert("Select invoice first");
//       return;
//     }

//     axios
//       .post(`http://127.0.0.1:8000/api/pay-debt/${selectedSale.id}/`, {
//         amount: Number(paymentAmount),
//       })
//       .then(() => {
//         alert("✅ Payment recorded");
//         setPaymentAmount("");
//         setSelectedSale(null); // Clear selection after payment
//         fetchCustomerSales(customer.id);
//       });
//   };

//   // ================= PDF =================
//   const generateLedgerPDF = () => {
//     if (!customer) {
//       alert("Select customer");
//       return;
//     }

//     const doc = new jsPDF();
//     let y = 15;

//     // TITLE
//     doc.setFontSize(20);
//     doc.text("CUSTOMER LEDGER", 65, y);
//     y += 15;

//     // CUSTOMER INFO
//     doc.setFontSize(11);
//     doc.text(`Customer: ${customer.name}`, 15, y);
//     y += 7;
//     doc.text(`Phone: ${customer.phone}`, 15, y);
//     y += 7;
//     doc.text(`Generated: ${new Date().toLocaleString()}`, 15, y);
//     y += 12;

//     // TABLE HEADER
//     doc.setFontSize(10);
//     doc.text("Invoice", 15, y);
//     doc.text("Total", 55, y);
//     doc.text("Paid", 90, y);
//     doc.text("Balance", 125, y);
//     doc.text("Date", 160, y);
//     y += 7;

//     filteredSales.forEach((sale: any) => {
//       doc.text(sale.invoice_number, 15, y);
//       doc.text(`₦${formatMoney(sale.total)}`, 55, y);
//       doc.text(`₦${formatMoney(sale.paid)}`, 90, y);
//       doc.text(`₦${formatMoney(sale.balance)}`, 125, y);
//       doc.text(new Date(sale.created_at).toLocaleDateString(), 160, y);
//       y += 8;
//     });

//     y += 10;
//     doc.setFontSize(12);
//     doc.text(`Total Debt: ₦${formatMoney(totalDebt)}`, 15, y);
//     doc.save(`${customer.name}-ledger.pdf`);
//   };

//   return (
//     <div className="ledger-container">
//       <div className="ledger-header">
//         <h1>📒 Customer Ledger</h1>
//       </div>

//       {/* CUSTOMER */}
//       <div className="ledger-card">
//         <label>Select Customer</label>
//         <select
//           value={customer?.id || ""}
//           onChange={(e) => handleCustomerSelect(e.target.value)}
//         >
//           <option value="">Select Customer</option>
//           {customers.map((c) => (
//             <option key={c.id} value={c.id}>
//               {c.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* SEARCH */}
//       {customer && (
//         <div className="ledger-card">
//           <label>Search Invoice</label>
//           <input
//             type="text"
//             placeholder="Enter Invoice Number"
//             value={searchInvoice}
//             onChange={(e) => setSearchInvoice(e.target.value)}
//           />
//         </div>
//       )}

//       {/* TOTAL DEBT */}
//       {customer && (
//         <div className="debt-box">
//           <h2>Total Debt: ₦{formatMoney(totalDebt)}</h2>
//         </div>
//       )}

//       {/* HISTORY */}
//       {customer && (
//         <div className="history-section">
//           <h2>Purchase History</h2>
//           {filteredSales.length === 0 ? (
//             <div className="empty-box">No purchase yet</div>
//           ) : (
//             <table className="ledger-table">
//               <thead>
//                 <tr>
//                   <th>Invoice</th>
//                   <th>Total</th>
//                   <th>Paid</th>
//                   <th>Balance</th>
//                   <th>Date & Payment History</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredSales.map((sale: any, index: number) => (
//                   <tr key={index}>
//                     <td>{sale.invoice_number}</td>
//                     <td>₦{formatMoney(sale.total)}</td>
//                     <td>₦{formatMoney(sale.paid)}</td>
//                     <td className={sale.balance > 0 ? "debt" : "paid"}>
//                       ₦{formatMoney(sale.balance)}
//                     </td>
//                     {/* MODIFIED SECTION START */}
//                     <td>
//                       <div>{new Date(sale.created_at).toLocaleString()}</div>
//                       {sale.payments?.map((payment: any, i: number) => (
//                         <div key={i} className="payment-history">
//                           Paid ₦{formatMoney(payment.amount)} on{" "}
//                           {new Date(payment.date).toLocaleString()}
//                         </div>
//                       ))}
//                     </td>
//                     {/* MODIFIED SECTION END */}
//                     <td>
//                       {sale.balance > 0 && (
//                         <button
//                           className="pay-btn"
//                           onClick={() => setSelectedSale(sale)}
//                         >
//                           Pay Debt
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       )}

//       {/* PAYMENT BOX */}
//       {selectedSale && (
//         <div className="payment-box">
//           <h3>Pay Debt - {selectedSale.invoice_number}</h3>
//           <p>Remaining Debt: ₦{formatMoney(selectedSale.balance)}</p>
//           <input
//             type="number"
//             placeholder="Enter amount"
//             value={paymentAmount}
//             onChange={(e) => setPaymentAmount(e.target.value)}
//           />
//           <button className="confirm-btn" onClick={payDebt}>
//             Confirm Payment
//           </button>
//           <button className="cancel-btn" onClick={() => setSelectedSale(null)} style={{marginLeft: '10px'}}>
//             Cancel
//           </button>
//         </div>
//       )}

//       {/* PDF */}
//       {customer && (
//         <div className="pdf-section">
//           <button className="pdf-btn" onClick={generateLedgerPDF}>
//             📄 Download Ledger PDF
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default CustomerLedger;





// import { useEffect, useState } from "react";
// import axios from "axios";
// import jsPDF from "jspdf";
// import "./ledger.css";

// function CustomerLedger() {

//   const [customers, setCustomers] =
//     useState<any[]>([]);

//   const [customer, setCustomer] =
//     useState<any>(null);

//   const [sales, setSales] =
//     useState<any[]>([]);

//   const [searchInvoice, setSearchInvoice] =
//     useState("");

//   const [paymentAmount, setPaymentAmount] =
//     useState("");

//   const [selectedSale, setSelectedSale] =
//     useState<any>(null);

//   // ================= FORMAT MONEY =================

//   const formatMoney = (value: any) => {

//     return Number(
//       value || 0
//     ).toLocaleString();

//   };

//   // ================= FETCH CUSTOMERS =================

//   useEffect(() => {

//     axios
//       .get(
//         "http://127.0.0.1:8000/api/customers/"
//       )
//       .then((res) =>
//         setCustomers(res.data)
//       );

//   }, []);

//   // ================= FETCH SALES =================

//   const fetchCustomerSales = (
//     customerId: any
//   ) => {

//     axios
//       .get(
//         `http://127.0.0.1:8000/api/customer-sales/${customerId}/`
//       )
//       .then((res) => {

//         setSales(res.data);

//       })
//       .catch(() => {

//         setSales([]);

//       });

//   };

//   // ================= SELECT CUSTOMER =================

//   const handleCustomerSelect = (
//     value: any
//   ) => {

//     const selected =
//       customers.find(
//         (c) => c.id == value
//       );

//     setCustomer(selected);

//     if (selected) {

//       fetchCustomerSales(
//         selected.id
//       );

//     }

//   };

//   // ================= TOTAL DEBT =================

//   const totalDebt = sales.reduce(
//     (sum, sale) =>
//       sum +
//       Number(sale.balance || 0),
//     0
//   );

//   // ================= SEARCH =================

//   const filteredSales = sales.filter(
//     (sale) =>
//       sale.invoice_number
//         .toLowerCase()
//         .includes(
//           searchInvoice.toLowerCase()
//         )
//   );

//   // ================= PAY DEBT =================

//   const payDebt = () => {

//     if (!selectedSale) {

//       alert(
//         "Select invoice first"
//       );

//       return;

//     }

//     axios
//       .post(
//         `http://127.0.0.1:8000/api/pay-debt/${selectedSale.id}/`,
//         {
//           amount:
//             Number(paymentAmount),
//         }
//       )
//       .then(() => {

//         alert(
//           "✅ Payment recorded"
//         );

//         setPaymentAmount("");

//         fetchCustomerSales(
//           customer.id
//         );

//       });

//   };

//   // ================= PDF =================

//   const generateLedgerPDF = () => {

//     if (!customer) {

//       alert(
//         "Select customer"
//       );

//       return;

//     }

//     const doc = new jsPDF();

//     let y = 15;

//     // TITLE

//     doc.setFontSize(20);

//     doc.text(
//       "CUSTOMER LEDGER",
//       65,
//       y
//     );

//     y += 15;

//     // CUSTOMER INFO

//     doc.setFontSize(11);

//     doc.text(
//       `Customer: ${customer.name}`,
//       15,
//       y
//     );

//     y += 7;

//     doc.text(
//       `Phone: ${customer.phone}`,
//       15,
//       y
//     );

//     y += 7;

//     doc.text(
//       `Generated: ${new Date().toLocaleString()}`,
//       15,
//       y
//     );

//     y += 12;

//     // TABLE HEADER

//     doc.setFontSize(10);

//     doc.text(
//       "Invoice",
//       15,
//       y
//     );

//     doc.text(
//       "Total",
//       55,
//       y
//     );

//     doc.text(
//       "Paid",
//       90,
//       y
//     );

//     doc.text(
//       "Balance",
//       125,
//       y
//     );

//     doc.text(
//       "Date",
//       160,
//       y
//     );

//     y += 7;

//     filteredSales.forEach(
//       (sale: any) => {

//         doc.text(
//           sale.invoice_number,
//           15,
//           y
//         );

//         doc.text(
//           `₦${formatMoney(
//             sale.total
//           )}`,
//           55,
//           y
//         );

//         doc.text(
//           `₦${formatMoney(
//             sale.paid
//           )}`,
//           90,
//           y
//         );

//         doc.text(
//           `₦${formatMoney(
//             sale.balance
//           )}`,
//           125,
//           y
//         );

//         doc.text(
//           new Date(
//             sale.created_at
//           ).toLocaleDateString(),
//           160,
//           y
//         );

//         y += 8;

//       }
//     );

//     y += 10;

//     doc.setFontSize(12);

//     doc.text(
//       `Total Debt: ₦${formatMoney(
//         totalDebt
//       )}`,
//       15,
//       y
//     );

//     doc.save(
//       `${customer.name}-ledger.pdf`
//     );

//   };

//   return (

//     <div className="ledger-container">

//       <div className="ledger-header">

//         <h1>
//           📒 Customer Ledger
//         </h1>

//       </div>

//       {/* CUSTOMER */}

//       <div className="ledger-card">

//         <label>
//           Select Customer
//         </label>

//         <select
//           value={customer?.id || ""}
//           onChange={(e) =>
//             handleCustomerSelect(
//               e.target.value
//             )
//           }
//         >

//           <option value="">
//             Select Customer
//           </option>

//           {customers.map((c) => (

//             <option
//               key={c.id}
//               value={c.id}
//             >
//               {c.name}
//             </option>

//           ))}

//         </select>

//       </div>

//       {/* SEARCH */}

//       {customer && (

//         <div className="ledger-card">

//           <label>
//             Search Invoice
//           </label>

//           <input
//             type="text"
//             placeholder="Enter Invoice Number"
//             value={searchInvoice}
//             onChange={(e) =>
//               setSearchInvoice(
//                 e.target.value
//               )
//             }
//           />

//         </div>

//       )}

//       {/* TOTAL DEBT */}

//       {customer && (

//         <div className="debt-box">

//           <h2>
//             Total Debt:
//             {" "}
//             ₦
//             {formatMoney(
//               totalDebt
//             )}
//           </h2>

//         </div>

//       )}

//       {/* HISTORY */}

//       {customer && (

//         <div className="history-section">

//           <h2>
//             Purchase History
//           </h2>

//           {filteredSales.length ===
//           0 ? (

//             <div className="empty-box">

//               No purchase yet

//             </div>

//           ) : (

//             <table className="ledger-table">

//               <thead>

//                 <tr>
//                   <th>Invoice</th>
//                   <th>Total</th>
//                   <th>Paid</th>
//                   <th>Balance</th>
//                   <th>Date</th>
//                   <th>Action</th>
//                 </tr>

//               </thead>

//               <tbody>

//                 {filteredSales.map(
//                   (
//                     sale: any,
//                     index: number
//                   ) => (

//                     <tr key={index}>

//                       <td>
//                         {
//                           sale.invoice_number
//                         }
//                       </td>

//                       <td>
//                         ₦
//                         {formatMoney(
//                           sale.total
//                         )}
//                       </td>

//                       <td>
//                         ₦
//                         {formatMoney(
//                           sale.paid
//                         )}
//                       </td>

//                       <td
//                         className={
//                           sale.balance >
//                           0
//                             ? "debt"
//                             : "paid"
//                         }
//                       >
//                         ₦
//                         {formatMoney(
//                           sale.balance
//                         )}
//                       </td>

//                       <td>
//                         {new Date(
//                           sale.created_at
//                         ).toLocaleString()}
//                       </td>

//                       <td>

//                         {sale.balance >
//                           0 && (

//                           <button
//                             className="pay-btn"
//                             onClick={() =>
//                               setSelectedSale(
//                                 sale
//                               )
//                             }
//                           >
//                             Pay Debt
//                           </button>

//                         )}

//                       </td>

//                     </tr>

//                   )
//                 )}

//               </tbody>

//             </table>

//           )}

//         </div>

//       )}

//       {/* PAYMENT BOX */}

//       {selectedSale && (

//         <div className="payment-box">

//           <h3>
//             Pay Debt -
//             {" "}
//             {
//               selectedSale.invoice_number
//             }
//           </h3>

//           <p>
//             Remaining Debt:
//             {" "}
//             ₦
//             {formatMoney(
//               selectedSale.balance
//             )}
//           </p>

//           <input
//             type="number"
//             placeholder="Enter amount"
//             value={paymentAmount}
//             onChange={(e) =>
//               setPaymentAmount(
//                 e.target.value
//               )
//             }
//           />

//           <button
//             className="confirm-btn"
//             onClick={payDebt}
//           >
//             Confirm Payment
//           </button>

//         </div>

//       )}

//       {/* PDF */}

//       {customer && (

//         <div className="pdf-section">

//           <button
//             className="pdf-btn"
//             onClick={
//               generateLedgerPDF
//             }
//           >
//             📄 Download Ledger PDF
//           </button>

//         </div>

//       )}

//     </div>

//   );

// }

// export default CustomerLedger;