import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./dispatch.css";

function Dispatch() {

  // =========================
  // STATES
  // =========================

  const navigate = useNavigate();

  const [packagedBread, setPackagedBread] =
    useState<any[]>([]);

  const [originalPackagedBread, setOriginalPackagedBread] =
    useState<any[]>([]);

  const [pendingSales, setPendingSales] =
    useState<any[]>([]);

  const [selectedSale, setSelectedSale] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [customerOrders, setCustomerOrders] =
    useState<any[]>([]);

  const [summary, setSummary] =
    useState({
      total_received: 0,
      total_given: 0,
      total_remaining: 0,
    });

  // =========================
  // FILTER SALES
  // =========================

  const filteredSales =
    pendingSales.filter((sale: any) => {

      const search =
        searchTerm.toLowerCase();

      return (

        sale.customer
          .toLowerCase()
          .includes(search)

        ||

        sale.invoice_number
          .toLowerCase()
          .includes(search)

        ||

        (
          sale.phone &&
          sale.phone.includes(search)
        )

      );

    });

  // =========================
  // FETCH SUMMARY
  // =========================

  const fetchSummary = async () => {

    try {

      const res =
        await axios.get(
          "http://159.65.94.152/api/dispatch-summary/"
        );

      setSummary(res.data);

    } catch (err) {

      console.log(err);

    }

  };

  // =========================
  // FETCH PACKAGED BREAD
  // =========================

  const fetchPackagedBread = async () => {

    try {

      const res =
        await axios.get(
          "http://159.65.94.152/api/packaged-bread/"
        );

      const merged: any = {};

      res.data.forEach((item: any) => {

        const bread =
          item.bread_type;

        if (!merged[bread]) {

          merged[bread] = {

            bread_type: bread,

            packaged:
              Number(item.packaged),

            confirmed:
              item.confirmed,

          };

        } else {

          merged[bread].packaged +=
            Number(item.packaged);

        }

      });

      const mergedArray =
        Object.values(merged);

      setPackagedBread(
        mergedArray
      );

      setOriginalPackagedBread(

        JSON.parse(
          JSON.stringify(
            mergedArray
          )
        )

      );

    } catch (err) {

      console.log(err);

    }

  };

  // =========================
  // FETCH PENDING SALES
  // =========================

  const fetchPendingSales = async () => {

    try {

      const res =
        await axios.get(
          "http://159.65.94.152/api/pending-dispatches/"
        );

      setPendingSales(
        res.data
      );

    } catch (err) {

      console.log(err);

    }

  };

  // =========================
  // FETCH CUSTOMER ORDER
  // =========================

  const fetchCustomerOrder = async (
    saleId: string
  ) => {

    if (!saleId) {

      setCustomerOrders([]);

      return;

    }

    try {

      const res =
        await axios.get(
          `http://159.65.94.152/api/customer-order/${saleId}/`
        );

      const formatted =
        res.data.map((item: any) => ({

          ...item,

          giving: 0,

          owing:
            Number(item.ordered),

          status:
            item.status || "Pending",

        }));

      setCustomerOrders(
        formatted
      );

    } catch (err) {

      console.log(err);

    }

  };


    // =========================
  // CONFIRM PACKAGED BREAD
  // =========================

  const confirmPackagedBread = async (
    item: any
  ) => {

    try {

      await axios.post(
        "http://159.65.94.152/api/confirm-packaged-bread/",
        {

          bread_type:
            item.bread_type,

          quantity:
            item.packaged

        }
      );

      alert(
        `${item.bread_type} confirmed`
      );

      await fetchPackagedBread();

      await fetchSummary();

    } catch (err: any) {

      console.log(err);

      if (err.response) {

        alert(

          err.response.data.error ||

          err.response.data.message ||

          "Confirmation failed"

        );

      } else {

        alert("Confirmation failed");

      }

    }

  };

  // =========================
  // HANDLE GIVING
  // =========================

  const handleGivingChange = (
    index: number,
    value: string
  ) => {

    const updated =
      [...customerOrders];

    const giving =
      Number(value) || 0;

    const ordered =
      Number(updated[index].ordered);

    if (giving > ordered) {

      alert(
        "Cannot exceed ordered quantity"
      );

      return;

    }

    updated[index].giving =
      giving;

    updated[index].owing =
      ordered - giving;

    const totalGiving =
      updated.reduce(

        (sum: number, item: any) =>

          sum +
          Number(item.giving || 0),

        0

      );

    setSummary((prev) => ({

      ...prev,

      total_given:
        totalGiving,

      total_remaining:
        prev.total_received -
        totalGiving

    }));

    let refreshedBread =
      JSON.parse(
        JSON.stringify(
          originalPackagedBread
        )
      );

    updated.forEach((order: any) => {

      const giveQty =
        Number(order.giving || 0);

      refreshedBread =
        refreshedBread.map(
          (bread: any) => {

            if (
              bread.bread_type ===
              order.bread_type
            ) {

              return {

                ...bread,

                packaged:
                  Math.max(

                    0,

                    Number(
                      bread.packaged
                    ) - giveQty

                  )

              };

            }

            return bread;

          }
        );

    });

    setPackagedBread(
      refreshedBread
    );

    setCustomerOrders(
      updated
    );

  };

  // =========================
  // NEXT CUSTOMER
  // =========================

  const nextCustomer =
    async () => {

      try {

        if (!selectedSale) {

          alert(
            "Select customer invoice"
          );

          return;

        }

        const validOrders =
          customerOrders.filter(
            (item) =>
              Number(item.giving) > 0
          );

        if (validOrders.length === 0) {

          alert(
            "Enter quantity to give"
          );

          return;

        }

        const currentSale =
          pendingSales.find(
            (sale) =>
              String(sale.sale_id) ===
              selectedSale
          );

        if (!currentSale) {

          alert(
            "Customer not found"
          );

          return;

        }

        for (const item of validOrders) {

          await axios.post(
            "http://159.65.94.152/api/give-bread/",
            {

              sale_item_id:
                item.sale_item_id,

              quantity:
                Number(item.giving),

              receiver:
                "Customer"

            }
          );

        }

        const dispatchItems =
          customerOrders.map(
            (item: any) => ({

              bread_type:
                item.bread_type,

              quantity_bought:
                Number(item.ordered),

              quantity_given:
                Number(item.giving),

              quantity_owing:
                Number(item.owing)

            }))


                    const saveRes =
          await axios.post(
            "http://159.65.94.152/api/save-dispatch/",
            {

              customer:
                currentSale.customer_id,

              invoice_number:
                currentSale.invoice_number,

              items:
                dispatchItems

            }
          );

        localStorage.setItem(
          "latest_dispatch_id",
          saveRes.data.id
        );

        await Promise.all([

          fetchSummary(),

          fetchPackagedBread(),

          fetchPendingSales()

        ]);

        alert(
          "Customer dispatch completed"
        );

      } catch (err: any) {

        console.log(err);

        if (err.response) {

          alert(

            err.response.data.error ||

            err.response.data.message ||

            "Dispatch failed"

          );

        } else {

          alert(
            "Dispatch failed"
          );

        }

      }

    };

  // =========================
  // COMPLETE DAY DISPATCH
  // =========================

  const completeDispatch =
    async () => {

      try {

        if (
          !window.confirm(
            "This will clear ALL dispatch data for today. Continue?"
          )
        ) {

          return;

        }

        await axios.post(
          "http://159.65.94.152/api/complete-day-dispatch/"
        );

        setCustomerOrders([]);

        setSelectedSale("");

        setPackagedBread([]);

        setOriginalPackagedBread([]);

        setPendingSales([]);

        setSummary({

          total_received: 0,

          total_given: 0,

          total_remaining: 0

        });

        alert(
          "Dispatch day completed successfully"
        );

      } catch (err: any) {

        console.log(err);

        if (err.response) {

          alert(

            err.response.data.error ||

            err.response.data.message ||

            "Failed to complete dispatch day"

          );

        } else {

          alert(
            "Failed to complete dispatch day"
          );

        }

      }

    };

  // =========================
  // CUSTOMER INFO
  // =========================

  const customerInfo =
    () => {

      const dispatchId =
        localStorage.getItem(
          "latest_dispatch_id"
        );

      if (!dispatchId) {

        alert(
          "No customer dispatch found"
        );

        return;

      }

      navigate("/customer-info");

    };

  // =========================
  // LOAD PAGE
  // =========================

  useEffect(() => {

    fetchPackagedBread();

    fetchPendingSales();

    fetchSummary();

  }, []);

  return (


        <div className="dispatch-page">

      {/* HEADER */}

      <div className="dispatch-header">

        <h1>
          Dispatch Department
        </h1>

        <p>
          Manage packaged bread
          and customer dispatch
        </p>

      </div>

      {/* SUMMARY */}

      <div className="summary-grid">

        <div className="summary-card">

          <h2>
            Pending Orders
          </h2>

          <h1>

            {
              pendingSales.filter(
                (sale: any) =>
                  !sale.received
              ).length
            }

          </h1>

        </div>

        <div className="summary-card">

          <h2>
            Total Packaged
          </h2>

          <h1>
            {summary.total_received}
          </h1>

        </div>

        <div className="summary-card">

          <h2>
            Total Given Out
          </h2>

          <h1>
            {summary.total_given}
          </h1>

        </div>

        <div className="summary-card">

          <h2>
            Total Remaining
          </h2>

          <h1>
            {summary.total_remaining}
          </h1>

        </div>

      </div>

      {/* PACKAGED BREAD */}

      <div className="dispatch-card">

        <div className="card-header">

          <h2>
            Packaged Bread Received
          </h2>

        </div>

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

                <th>
                  Bread Type
                </th>

                <th>
                  Quantity Received
                </th>

                <th>
                  Confirm
                </th>

              </tr>

            </thead>

            <tbody>

              {packagedBread.map(
                (item, index) => (

                  <tr key={index}>

                    <td>
                      {item.bread_type}
                    </td>

                    <td>
                      {item.packaged}
                    </td>

                    <td>

                      <button

                        disabled={
                          item.confirmed
                        }

                        className={
                          item.confirmed
                            ? "confirmed-btn"
                            : "confirm-btn"
                        }

                        onClick={() =>
                          confirmPackagedBread(item)
                        }

                      >

                        {
                          item.confirmed
                            ? "Confirmed"
                            : "Confirm"
                        }

                      </button>

                    </td>

                  </tr>

                ))
              }

            </tbody>

          </table>

        </div>

      </div>

      {/* CUSTOMER ORDER */}

      <div className="dispatch-card">

        <div className="card-header">

          <h2>
            Customer Order
          </h2>

        </div>

        <div className="dispatch-select">

          <label>
            Select Customer Invoice
          </label>

          <input

            type="text"

            placeholder="Search customer, invoice or phone"

            value={searchTerm}

            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }

            className="search-input"

          />

          <select

            value={selectedSale}

            onChange={(e) => {

              const saleId =
                e.target.value;

              setSelectedSale(
                saleId
              );

              fetchCustomerOrder(
                saleId
              );

            }}

          >

            <option value="">
              -- Select Invoice --
            </option>

            {filteredSales.map((sale) => (

              <option

                key={sale.sale_id}

                value={sale.sale_id}

              >

                {sale.invoice_number}
                {" - "}
                {sale.customer}

                {
                  sale.received
                    ? " ✅ RECEIVED"
                    : ""
                }

              </option>

            ))}

          </select>

        </div>

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

                <th>Bread Type</th>

                <th>Ordered</th>

                <th>Giving</th>

                <th>Owing</th>

                <th>Status</th>

              </tr>

            </thead>

            <tbody>
                            {customerOrders.length === 0 ? (

                <tr>

                  <td
                    colSpan={5}
                    className="empty"
                  >
                    No customer order
                  </td>

                </tr>

              ) : (

                customerOrders.map(
                  (item, index) => (

                    <tr key={index}>

                      <td>
                        {item.bread_type}
                      </td>

                      <td>
                        {item.ordered}
                      </td>

                      <td>

                        <input

                          type="number"

                          min="0"

                          max={item.ordered}

                          value={item.giving}

                          onChange={(e) =>
                            handleGivingChange(
                              index,
                              e.target.value
                            )
                          }

                          className="qty-input"

                        />

                      </td>

                      <td>

                        <input

                          type="number"

                          value={item.owing}

                          readOnly

                          className={
                            item.owing > 0
                              ? "owing-input"
                              : "cleared-input"
                          }

                        />

                      </td>

                      <td>

                        {item.status === "Settled" ? (

                          <span className="settled-indicator">

                            ● Settled

                          </span>

                        ) : (

                          <span className="pending-indicator">

                            ● Pending

                          </span>

                        )}

                      </td>

                    </tr>

                  )

                )

              )}

            </tbody>

          </table>

        </div>

        {/* BUTTONS */}

        <div className="button-group">

          <button

            className="confirm-btn"

            onClick={completeDispatch}

          >

            Complete Day

          </button>

          <button

            className="confirm-btn"

            onClick={nextCustomer}

          >

            Next Customer

          </button>

          <button

            className="confirm-btn"

            onClick={customerInfo}

          >

            Customer Info

          </button>

        </div>

      </div>

    </div>

  );

}

export default Dispatch;
            
            

    

  

















// import { useEffect, useState } from "react"
// import { useNavigate } from "react-router-dom"
// import axios from "axios"
// import "./dispatch.css"

// function Dispatch() {

//   // =========================
//   // STATES
//   // =========================

//   const navigate = useNavigate()

//   const [packagedBread, setPackagedBread] =
//     useState<any[]>([])

//   const [originalPackagedBread, setOriginalPackagedBread] =
//     useState<any[]>([])

//   const [pendingSales, setPendingSales] =
//     useState<any[]>([])

//   const [selectedSale, setSelectedSale] =
//     useState("")

//   // =========================
//   // SEARCH STATE
//   // =========================

//   const [searchTerm, setSearchTerm] =
//     useState("")

//   const [customerOrders, setCustomerOrders] =
//     useState<any[]>([])

//   const [summary, setSummary] =
//     useState({

//       total_received: 0,

//       total_given: 0,

//       total_remaining: 0
//     })

//   // =========================
//   // FILTERED SALES
//   // =========================

//   const filteredSales =
//     pendingSales.filter((sale: any) => {

//       const search =
//         searchTerm.toLowerCase()

//       return (

//         sale.customer
//           .toLowerCase()
//           .includes(search)

//         ||

//         sale.invoice_number
//           .toLowerCase()
//           .includes(search)

//         ||

//         (
//           sale.phone &&
//           sale.phone.includes(search)
//         )
//       )
//     })

//   // =========================
//   // FETCH SUMMARY
//   // =========================

//   const fetchSummary = async () => {

//     try {

//       const res = await axios.get(
//         "/api/dispatch-summary/"
//       )

//       setSummary(res.data)

//     } catch (err) {

//       console.log(err)
//     }
//   }

//   // =========================
//   // FETCH PACKAGED BREAD
//   // =========================

//   const fetchPackagedBread = async () => {

//     try {

//       const res = await axios.get(
//         "http://159.65.94.152/api/packaged-bread/"
//       )

//       const merged: any = {}

//       res.data.forEach((item: any) => {

//         const bread =
//           item.bread_type

//         if (!merged[bread]) {

//           merged[bread] = {

//             bread_type: bread,

//             packaged:
//               Number(item.packaged),

//             confirmed:
//               item.confirmed
//           }

//         } else {

//           merged[bread].packaged +=
//             Number(item.packaged)
//         }
//       })

//       const mergedArray =
//         Object.values(merged)

//       setPackagedBread(
//         mergedArray
//       )

//       setOriginalPackagedBread(
//         JSON.parse(
//           JSON.stringify(
//             mergedArray
//           )
//         )
//       )

//     } catch (err) {

//       console.log(err)
//     }
//   }

//   // =========================
//   // FETCH PENDING SALES
//   // =========================

//   const fetchPendingSales = async () => {

//     try {

//       const res = await axios.get(
//         "http://159.65.94.152/api/pending-dispatches/"
//       )

//       setPendingSales(res.data)

//     } catch (err) {

//       console.log(err)
//     }
//   }

//   // =========================
//   // FETCH CUSTOMER ORDER
//   // =========================

//   const fetchCustomerOrder = async (
//     saleId: string
//   ) => {

//     if (!saleId) {

//       setCustomerOrders([])

//       return
//     }

//     try {

//       const res = await axios.get(
//         `http://159.65.94.152/api/customer-order/${saleId}/`
//       )

//       const formatted =
//         res.data.map((item: any) => ({

//           ...item,

//           giving: 0,

//           owing:
//             Number(item.ordered),

//           status:
//             item.status || "Pending"
//         }))

//       setCustomerOrders(formatted)

//     } catch (err) {

//       console.log(err)
//     }
//   }

//   // =========================
//   // CONFIRM PACKAGED BREAD
//   // =========================

//   const confirmPackagedBread = async (
//     item: any
//   ) => {

//     try {

//       await axios.post(
//         "http://159.65.94.152/api/confirm-packaged-bread/",
//         {

//           bread_type:
//             item.bread_type,

//           quantity:
//             item.packaged
//         }
//       )

//       alert(
//         `${item.bread_type} confirmed`
//       )

//       await fetchPackagedBread()

//       await fetchSummary()

//     } catch (err: any) {

//       console.log(err)

//       if (err.response) {

//         alert(
//           err.response.data.error ||
//           err.response.data.message ||
//           "Confirmation failed"
//         )

//       } else {

//         alert("Confirmation failed")
//       }
//     }
//   }

//   // =========================
//   // HANDLE GIVING
//   // =========================

//   const handleGivingChange = (
//     index: number,
//     value: string
//   ) => {

//     const updated =
//       [...customerOrders]

//     const giving =
//       Number(value) || 0

//     const ordered =
//       Number(
//         updated[index].ordered
//       )

//     if (giving > ordered) {

//       alert(
//         "Cannot exceed ordered quantity"
//       )

//       return
//     }

//     updated[index].giving =
//       giving

//     updated[index].owing =
//       ordered - giving

//     const totalGiving =
//       updated.reduce(

//         (sum: number, item: any) =>

//           sum +
//           Number(item.giving || 0),

//         0
//       )

//     setSummary((prev) => ({

//       ...prev,

//       total_given:
//         totalGiving,

//       total_remaining:
//         prev.total_received -
//         totalGiving
//     }))

//     let refreshedBread =
//       JSON.parse(
//         JSON.stringify(
//           originalPackagedBread
//         )
//       )

//     updated.forEach((order: any) => {

//       const giveQty =
//         Number(order.giving || 0)

//       refreshedBread =
//         refreshedBread.map(
//           (bread: any) => {

//             if (
//               bread.bread_type ===
//               order.bread_type
//             ) {

//               return {

//                 ...bread,

//                 packaged:
//                   Math.max(
//                     0,
//                     Number(
//                       bread.packaged
//                     ) - giveQty
//                   )
//               }
//             }

//             return bread
//           }
//         )
//     })

//     setPackagedBread(
//       refreshedBread
//     )

//     setCustomerOrders(updated)
//   }

//   // =========================
//   // NEXT CUSTOMER
//   // =========================

//   const nextCustomer =
//     async () => {

//       try {

//         if (!selectedSale) {

//           alert(
//             "Select customer invoice"
//           )

//           return
//         }

//         const validOrders =
//           customerOrders.filter(
//             (item) =>
//               Number(item.giving) > 0
//           )

//         if (validOrders.length === 0) {

//           alert(
//             "Enter quantity to give"
//           )

//           return
//         }

//         const currentSale =
//           pendingSales.find(
//             (sale) =>
//               String(sale.sale_id) ===
//               selectedSale
//           )

//         if (!currentSale) {

//           alert(
//             "Customer not found"
//           )

//           return
//         }

//         for (const item of validOrders) {

//           await axios.post(
//             "http://159.65.94.152/api/give-bread/",
//             {

//               sale_item_id:
//                 item.sale_item_id,

//               quantity:
//                 Number(item.giving),

//               receiver:
//                 "Customer"
//             }
//           )
//         }

//         const dispatchItems =
//           customerOrders.map(
//             (item: any) => ({

//               bread_type:
//                 item.bread_type,

//               quantity_bought:
//                 Number(item.ordered),

//               quantity_given:
//                 Number(item.giving),

//               quantity_owing:
//                 Number(item.owing)
//             })
//           )

//         const saveRes =
//           await axios.post(
//             "http://159.65.94.152/api/save-dispatch/",
//             {

//               customer:
//                 currentSale.customer_id,

//               invoice_number:
//                 currentSale.invoice_number,

//               items:
//                 dispatchItems
//             }
//           )

//         localStorage.setItem(
//           "latest_dispatch_id",
//           saveRes.data.id
//         )

//         await Promise.all([

//           fetchSummary(),

//           fetchPackagedBread(),

//           fetchPendingSales()
//         ])

//         alert(
//           "Customer dispatch completed"
//         )

//       } catch (err: any) {

//         console.log(err)

//         if (err.response) {

//           alert(

//             err.response.data.error ||

//             err.response.data.message ||

//             "Dispatch failed"
//           )

//         } else {

//           alert("Dispatch failed")
//         }
//       }
//     }

//   // =========================
//   // COMPLETE DAY DISPATCH
//   // =========================

//   const completeDispatch = async () => {

//     try {

//       if (
//         !window.confirm(
//           "This will clear ALL dispatch data for today. Continue?"
//         )
//       ) {

//         return
//       }

//       await axios.post(
//         "http://159.65.94.152/api/complete-day-dispatch/"
//       )

//       setCustomerOrders([])

//       setSelectedSale("")

//       setPackagedBread([])

//       setOriginalPackagedBread([])

//       setPendingSales([])

//       setSummary({

//         total_received: 0,

//         total_given: 0,

//         total_remaining: 0
//       })

//       alert(
//         "Dispatch day completed successfully"
//       )

//     } catch (err: any) {

//       console.log(err)

//       if (err.response) {

//         alert(

//           err.response.data.error ||

//           err.response.data.message ||

//           "Failed to complete dispatch day"
//         )

//       } else {

//         alert(
//           "Failed to complete dispatch day"
//         )
//       }
//     }
//   }

//   // =========================
//   // CUSTOMER INFO
//   // =========================

//   const customerInfo =
//     () => {

//       const dispatchId =
//         localStorage.getItem(
//           "latest_dispatch_id"
//         )

//       if (!dispatchId) {

//         alert(
//           "No customer dispatch found"
//         )

//         return
//       }

//       navigate("/customer-info")
//     }

//   // =========================
//   // LOAD PAGE
//   // =========================

//   useEffect(() => {

//     fetchPackagedBread()

//     fetchPendingSales()

//     fetchSummary()

//   }, [])

//   return (

//     <div className="dispatch-page">

//       {/* HEADER */}

//       <div className="dispatch-header">

//         <h1>
//           Dispatch Department
//         </h1>

//         <p>
//           Manage packaged bread
//           and customer dispatch
//         </p>

//       </div>

//       {/* SUMMARY */}

//       <div className="summary-grid">

//         <div className="summary-card">

//           <h2>
//             Pending Orders
//           </h2>

//           <h1>

//             {
//               pendingSales.filter(
//                 (sale: any) =>
//                   !sale.received
//               ).length
//             }

//           </h1>

//         </div>

//         <div className="summary-card">

//           <h2>
//             Total Packaged
//           </h2>

//           <h1>
//             {summary.total_received}
//           </h1>

//         </div>

//         <div className="summary-card">

//           <h2>
//             Total Given Out
//           </h2>

//           <h1>
//             {summary.total_given}
//           </h1>

//         </div>

//         <div className="summary-card">

//           <h2>
//             Total Remaining
//           </h2>

//           <h1>
//             {summary.total_remaining}
//           </h1>

//         </div>

//       </div>

//       {/* PACKAGED BREAD */}

//       <div className="dispatch-card">

//         <div className="card-header">

//           <h2>
//             Packaged Bread Received
//           </h2>

//         </div>

//         <div className="table-wrapper">

//           <table>

//             <thead>

//               <tr>

//                 <th>
//                   Bread Type
//                 </th>

//                 <th>
//                   Quantity Received
//                 </th>

//                 <th>
//                   Confirm
//                 </th>

//               </tr>

//             </thead>

//             <tbody>

//               {packagedBread.map(
//                 (item, index) => (

//                 <tr key={index}>

//                   <td>
//                     {item.bread_type}
//                   </td>

//                   <td>
//                     {item.packaged}
//                   </td>

//                   <td>

//                     <button

//                       disabled={
//                         item.confirmed
//                       }

//                       className={
//                         item.confirmed

//                         ? "confirmed-btn"

//                         : "confirm-btn"
//                       }

//                       onClick={() =>
//                         confirmPackagedBread(item)
//                       }
//                     >

//                       {item.confirmed

//                         ? "Confirmed"

//                         : "Confirm"}
//                     </button>

//                   </td>

//                 </tr>
//               ))}

//             </tbody>

//           </table>

//         </div>

//       </div>

//       {/* CUSTOMER ORDER */}

//       <div className="dispatch-card">

//         <div className="card-header">

//           <h2>
//             Customer Order
//           </h2>

//         </div>

//         <div className="dispatch-select">

//           <label>
//             Select Customer Invoice
//           </label>

//           <input

//             type="text"

//             placeholder="Search customer, invoice or phone"

//             value={searchTerm}

//             onChange={(e) =>
//               setSearchTerm(
//                 e.target.value
//               )
//             }

//             className="search-input"
//           />

//           <select

//             value={selectedSale}

//             onChange={(e) => {

//               const saleId =
//                 e.target.value

//               setSelectedSale(
//                 saleId
//               )

//               fetchCustomerOrder(
//                 saleId
//               )
//             }}
//           >

//             <option value="">
//               -- Select Invoice --
//             </option>

//             {filteredSales.map((sale) => (

//               <option

//                 key={sale.sale_id}

//                 value={sale.sale_id}
//               >

//                 {sale.invoice_number}
//                 {" - "}
//                 {sale.customer}

//                 {sale.received
//                   ? " ✅ RECEIVED"
//                   : ""}

//               </option>
//             ))}

//           </select>

//         </div>

//         <div className="table-wrapper">

//           <table>

//             <thead>

//               <tr>

//                 <th>
//                   Bread Type
//                 </th>

//                 <th>
//                   Ordered
//                 </th>

//                 <th>
//                   Giving
//                 </th>

//                 <th>
//                   Owing
//                 </th>

//                 <th>
//                   Status
//                 </th>

//               </tr>

//             </thead>

//             <tbody>

//               {customerOrders.length === 0 ? (

//                 <tr>

//                   <td
//                     colSpan={5}
//                     className="empty"
//                   >

//                     No customer order

//                   </td>

//                 </tr>

//               ) : (

//                 customerOrders.map(
//                   (item, index) => (

//                     <tr key={index}>

//                       <td>
//                         {item.bread_type}
//                       </td>

//                       <td>
//                         {item.ordered}
//                       </td>

//                       <td>

//                         <input

//                           type="number"

//                           min="0"

//                           max={
//                             item.ordered
//                           }

//                           value={
//                             item.giving
//                           }

//                           onChange={(e) =>
//                             handleGivingChange(
//                               index,
//                               e.target.value
//                             )
//                           }

//                           className="qty-input"
//                         />

//                       </td>

//                       <td>

//                         <input

//                           type="number"

//                           value={
//                             item.owing
//                           }

//                           readOnly

//                           className={
//                             item.owing > 0

//                             ? "owing-input"

//                             : "cleared-input"
//                           }
//                         />

//                       </td>

//                       <td>

//                         {item.status ===
//                         "Settled" ? (

//                           <span className="settled-indicator">

//                             ● Settled

//                           </span>

//                         ) : (

//                           <span className="pending-indicator">

//                             ● Pending

//                           </span>

//                         )}

//                       </td>

//                     </tr>
//                   )
//                 )

//               )}

//             </tbody>

//           </table>

//         </div>

//         {/* BUTTONS */}

//         <div
//           className="button-group"
//         >

//           <button

//             className="confirm-btn"

//             onClick={
//               completeDispatch
//             }
//           >

//             Complete Day

//           </button>

//           <button

//             className="confirm-btn"

//             onClick={
//               nextCustomer
//             }
//           >

//             Next Customer

//           </button>

//           <button

//             className="confirm-btn"

//             onClick={
//               customerInfo
//             }
//           >

//             Customer Info

//           </button>

//         </div>

//       </div>

//     </div>
//   )
// }

// export default Dispatch


































