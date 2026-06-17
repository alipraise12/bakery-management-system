import { useState } from "react"
import axios from "axios"
import "./Productions.css"

interface RowData {
  id: number
  bags: number
  breads: (number | string)[]
}

function Productions() {

  // ================= DEFAULT BREAD TYPES =================
  const defaultColumns = [
    "Small Bread",
    "Family Bread",
    "Chocolate Bread",
  ]

  // ================= CREATE ROW =================
  const createDefaultRow = (): RowData => ({
    id: Date.now(),
    bags: 1,
    breads: ["", "", ""],
  })

  // ================= STATES =================
  const [columns, setColumns] =
    useState<string[]>(defaultColumns)

  const [rows, setRows] =
    useState<RowData[]>([
      createDefaultRow(),
    ])

  const [packaged, setPackaged] =
    useState<number[]>(
      Array(defaultColumns.length).fill(0)
    )

  const [comment, setComment] =
    useState("")

  // ================= ADD ROW =================
  const addRow = () => {

    setRows([
      ...rows,
      {
        id: Date.now(),
        bags: 1,
        breads: Array(columns.length).fill(""),
      },
    ])
  }

  // ================= REMOVE ROW =================
  const removeRow = (id: number) => {

    setRows(
      rows.filter((row) => row.id !== id)
    )
  }

  // ================= ADD COLUMN =================
  const addColumn = () => {

    const newColumn =
      `Bread Type ${columns.length + 1}`

    setColumns([
      ...columns,
      newColumn
    ])

    setRows(
      rows.map((row) => ({
        ...row,
        breads: [...row.breads, ""],
      }))
    )

    setPackaged([
      ...packaged,
      0
    ])
  }

  // ================= REMOVE COLUMN =================
  const removeColumn = (index: number) => {

    setColumns(
      columns.filter((_, i) => i !== index)
    )

    setRows(
      rows.map((row) => ({
        ...row,
        breads: row.breads.filter(
          (_, i) => i !== index
        ),
      }))
    )

    setPackaged(
      packaged.filter(
        (_, i) => i !== index
      )
    )
  }

  // ================= UPDATE COLUMN NAME =================
  const updateColumnName = (
    index: number,
    value: string
  ) => {

    const updated = [...columns]

    updated[index] = value

    setColumns(updated)
  }

  // ================= UPDATE TABLE CELLS =================
  const updateCell = (
    rowId: number,
    type: "bags" | "bread",
    value: number | string,
    colIndex?: number
  ) => {

    setRows(
      rows.map((row) => {

        if (row.id !== rowId)
          return row

        // UPDATE BAGS
        if (type === "bags") {

          return {
            ...row,
            bags: Number(value),
          }
        }

        // UPDATE BREADS
        const updatedBread = [...row.breads]

        if (colIndex !== undefined) {

          updatedBread[colIndex] = value
        }

        return {
          ...row,
          breads: updatedBread,
        }
      })
    )
  }

  // ================= UPDATE PACKAGED =================
  const updatePackaged = (
    index: number,
    value: number
  ) => {

    const updated = [...packaged]

    updated[index] = value

    setPackaged(updated)
  }

  // ================= RESET FORM =================
  const handleNew = () => {

    setColumns(defaultColumns)

    setRows([
      {
        id: Date.now(),
        bags: 1,
        breads: ["", "", ""],
      },
    ])

    setPackaged([0, 0, 0])

    setComment("")
  }

  // ================= TOTALS =================
  const breadTotals = columns.map((_, i) =>

    rows.reduce(
      (sum, row) =>
        sum + Number(row.breads[i] || 0),
      0
    )
  )

  // ================= BAGS PER BREAD TYPE =================
  const breadBags = columns.map((_, i) =>

    rows.reduce(
      (sum, row) => {

        const breadValue =
          Number(row.breads[i] || 0)

        if (breadValue > 0) {
          return sum + Number(row.bags || 0)
        }

        return sum
      },
      0
    )
  )

  const totalBreadProduced =
    breadTotals.reduce(
      (a, b) => a + b,
      0
    )

  const totalPackaged =
    packaged.reduce(
      (a, b) => a + b,
      0
    )

  const difference =
    totalBreadProduced -
    totalPackaged

  // ================= SAVE =================
  const handleSave = async () => {

    try {

      const payload = columns.map(
        (col, i) => ({

          bread_type: col,

          bags: breadBags[i],

          expected: 0,

          actual_yield:
            breadTotals[i],

          packaged:
            packaged[i],

          difference:
            breadTotals[i] -
            packaged[i],

          dispatch_difference:
            breadTotals[i] -
            packaged[i],

          comment: comment

        })
      )

      console.log(payload)

      await axios.post(
        "http://127.0.0.1:8000/api/daily-production/",
        payload
      )

      alert(
        "Production Saved Successfully"
      )

      handleNew()

    } catch (error) {

      console.log(error)

      alert("Failed to save")
    }
  }

  return (

    <div className="production-container">

      {/* ================= HEADER ================= */}
      <div className="top-bar">

        <h2>
          Daily Bread Production Report
        </h2>

        <div className="top-actions">

          <button
            className="btn success"
            onClick={handleSave}
          >
            Save
          </button>

          <button
            className="btn warning"
            onClick={handleNew}
          >
            New
          </button>

        </div>

      </div>

      {/* ================= ACTION BUTTONS ================= */}
      <div className="actions">

        <button
          className="btn primary"
          onClick={addRow}
        >
          + Add Row
        </button>

        <button
          className="btn secondary"
          onClick={addColumn}
        >
          + Add Bread Type
        </button>

      </div>

      {/* ================= TABLE ================= */}
      <div className="table-wrapper">

        <table className="production-table">

          <thead>

            <tr>

              <th>S/N</th>

              <th>Bags</th>

              {columns.map((col, i) => (

                <th key={i}>

                  <div className="column-header">

                    <input
                      className="column-input"
                      value={col}
                      onChange={(e) =>
                        updateColumnName(
                          i,
                          e.target.value
                        )
                      }
                    />

                    <span
                      className="remove-col"
                      onClick={() =>
                        removeColumn(i)
                      }
                    >
                      ✕
                    </span>

                  </div>

                </th>
              ))}

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {rows.map((row, index) => (

              <tr key={row.id}>

                <td>{index + 1}</td>

                {/* BAGS */}
                <td>

                  <input
                    type="number"
                    value={row.bags}
                    onChange={(e) =>
                      updateCell(
                        row.id,
                        "bags",
                        Number(
                          e.target.value
                        )
                      )
                    }
                  />

                </td>

                {/* BREADS */}
                {row.breads.map(
                  (bread, i) => (

                    <td key={i}>

                      <input
                        type="number"
                        value={bread || ""}
                        onChange={(e) =>
                          updateCell(
                            row.id,
                            "bread",
                            e.target.value,
                            i
                          )
                        }
                      />

                    </td>
                  )
                )}

                {/* REMOVE BUTTON */}
                <td>

                  <button
                    className="btn danger"
                    onClick={() =>
                      removeRow(row.id)
                    }
                  >
                    Remove
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

          {/* ================= FOOTER ================= */}
          <tfoot>

            <tr>

              <td>Total</td>

              <td>
                {breadBags.reduce(
                  (a, b) => a + b,
                  0
                )}
              </td>

              {breadTotals.map(
                (total, i) => (
                  <td key={i}>
                    {total}
                  </td>
                )
              )}

              <td>
                {totalBreadProduced}
              </td>

            </tr>

          </tfoot>

        </table>

      </div>

      {/* ================= PACKAGED ================= */}
      <div className="packaged-section">

        <h3>Packaged Bread</h3>

        <div className="packaged-grid">

          {columns.map((col, i) => (

            <div
              className="packaged-card"
              key={i}
            >

              <label>{col}</label>

              <input
                type="number"
                value={packaged[i]}
                onChange={(e) =>
                  updatePackaged(
                    i,
                    Number(
                      e.target.value
                    )
                  )
                }
              />

            </div>
          ))}

        </div>

      </div>

      {/* ================= DIFFERENCE ================= */}
      <div
        className={
          difference === 0
            ? "difference-card success-diff"
            : "difference-card danger-diff"
        }
      >

        <h3>
          Production Difference
        </h3>

        <div className="difference-content">

          <div>

            <span>
              Total Produced
            </span>

            <h2>
              {totalBreadProduced}
            </h2>

          </div>

          <div>

            <span>
              Total Packaged
            </span>

            <h2>
              {totalPackaged}
            </h2>

          </div>

          <div>

            <span>
              Difference
            </span>

            <h1>
              {difference}
            </h1>

          </div>

        </div>

      </div>

      {/* ================= COMMENT ================= */}
      <div className="comment-section">

        <h3>
          Production Comment
        </h3>

        <textarea
          placeholder="Explain why production and packaged bread do not tally..."
          value={comment}
          onChange={(e) =>
            setComment(
              e.target.value
            )
          }
        />

      </div>

    </div>
  )
}

export default Productions



// import { useState } from "react"
// import "./Productions.css"

// interface RowData {
//   id: number
//   bags: number
//   breads: number[]
// }

// function Productions() {
//   const defaultColumns = [
//     "Small Bread",
//     "Family Bread",
//     "Chocolate Bread",
//   ]

//   const createDefaultRow = () => ({
//     id: Date.now(),
//     bags: 0,
//     breads: [0, 0, 0],
//   })

//   const [columns, setColumns] = useState<string[]>(defaultColumns)

//   const [rows, setRows] = useState<RowData[]>([
//     createDefaultRow(),
//   ])

//   const [packaged, setPackaged] = useState<number[]>(
//     Array(defaultColumns.length).fill(0)
//   )

//   const [comment, setComment] = useState("")

//   // ================= ADD ROW =================
//   const addRow = () => {
//     setRows([
//       ...rows,
//       {
//         id: Date.now(),
//         bags: 0,
//         breads: Array(columns.length).fill(0),
//       },
//     ])
//   }

//   // ================= REMOVE ROW =================
//   const removeRow = (id: number) => {
//     setRows(rows.filter((row) => row.id !== id))
//   }

//   // ================= ADD COLUMN =================
//   const addColumn = () => {
//     const newColumn = `Bread Type ${columns.length + 1}`

//     setColumns([...columns, newColumn])

//     setRows(
//       rows.map((row) => ({
//         ...row,
//         breads: [...row.breads, 0],
//       }))
//     )

//     setPackaged([...packaged, 0])
//   }

//   // ================= REMOVE COLUMN =================
//   const removeColumn = (index: number) => {
//     setColumns(columns.filter((_, i) => i !== index))

//     setRows(
//       rows.map((row) => ({
//         ...row,
//         breads: row.breads.filter((_, i) => i !== index),
//       }))
//     )

//     setPackaged(packaged.filter((_, i) => i !== index))
//   }

//   // ================= UPDATE COLUMN NAME =================
//   const updateColumnName = (index: number, value: string) => {
//     const updated = [...columns]
//     updated[index] = value
//     setColumns(updated)
//   }

//   // ================= UPDATE TABLE CELL =================
//   const updateCell = (
//     rowId: number,
//     type: "bags" | "bread",
//     value: number,
//     colIndex?: number
//   ) => {
//     setRows(
//       rows.map((row) => {
//         if (row.id !== rowId) return row

//         if (type === "bags") {
//           return {
//             ...row,
//             bags: value,
//           }
//         }

//         const updatedBread = [...row.breads]

//         if (colIndex !== undefined) {
//           updatedBread[colIndex] = value
//         }

//         return {
//           ...row,
//           breads: updatedBread,
//         }
//       })
//     )
//   }

//   // ================= UPDATE PACKAGED =================
//   const updatePackaged = (
//     index: number,
//     value: number
//   ) => {
//     const updated = [...packaged]
//     updated[index] = value
//     setPackaged(updated)
//   }

//   // ================= NEW FORM =================
//   const handleNew = () => {
//     setColumns(defaultColumns)

//     setRows([
//       {
//         id: Date.now(),
//         bags: 0,
//         breads: [0, 0, 0],
//       },
//     ])

//     setPackaged([0, 0, 0])

//     setComment("")
//   }

//   // ================= SAVE =================
//   const handleSave = () => {
//     const productionData = {
//       columns,
//       rows,
//       packaged,
//       comment,
//       totalProduced: totalBreadProduced,
//       totalPackaged,
//       difference,
//     }

//     console.log("Saved Data:", productionData)

//     alert("Production Saved Successfully")
//   }

//   // ================= TOTALS =================
//   const totalBags = rows.reduce(
//     (sum, row) => sum + row.bags,
//     0
//   )

//   const breadTotals = columns.map((_, i) =>
//     rows.reduce(
//       (sum, row) => sum + (row.breads[i] || 0),
//       0
//     )
//   )

//   const totalBreadProduced = breadTotals.reduce(
//     (a, b) => a + b,
//     0
//   )

//   const totalPackaged = packaged.reduce(
//     (a, b) => a + b,
//     0
//   )

//   const difference =
//     totalBreadProduced - totalPackaged

//   return (
//     <div className="production-container">

//       {/* HEADER */}
//       <div className="top-bar">
//         <h2>Daily Bread Production Report</h2>

//         <div className="top-actions">
//           <button
//             className="btn success"
//             onClick={handleSave}
//           >
//             Save
//           </button>

//           <button
//             className="btn warning"
//             onClick={handleNew}
//           >
//             New
//           </button>
//         </div>
//       </div>

//       {/* ACTIONS */}
//       <div className="actions">
//         <button
//           className="btn primary"
//           onClick={addRow}
//         >
//           + Add Row
//         </button>

//         <button
//           className="btn secondary"
//           onClick={addColumn}
//         >
//           + Add Bread Type
//         </button>
//       </div>

//       {/* TABLE */}
//       <div className="table-wrapper">
//         <table className="production-table">
//           <thead>
//             <tr>
//               <th>S/N</th>
//               <th>Bags</th>

//               {columns.map((col, i) => (
//                 <th key={i}>
//                   <div className="column-header">
//                     <input
//                       className="column-input"
//                       value={col}
//                       onChange={(e) =>
//                         updateColumnName(
//                           i,
//                           e.target.value
//                         )
//                       }
//                     />

//                     <span
//                       className="remove-col"
//                       onClick={() =>
//                         removeColumn(i)
//                       }
//                     >
//                       ✕
//                     </span>
//                   </div>
//                 </th>
//               ))}

//               <th>Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map((row, index) => (
//               <tr key={row.id}>
//                 <td>{index + 1}</td>

//                 <td>
//                   <input
//                     type="number"
//                     value={row.bags}
//                     onChange={(e) =>
//                       updateCell(
//                         row.id,
//                         "bags",
//                         Number(e.target.value)
//                       )
//                     }
//                   />
//                 </td>

//                 {row.breads.map((bread, i) => (
//                   <td key={i}>
//                     <input
//                       type="number"
//                       value={bread}
//                       onChange={(e) =>
//                         updateCell(
//                           row.id,
//                           "bread",
//                           Number(e.target.value),
//                           i
//                         )
//                       }
//                     />
//                   </td>
//                 ))}

//                 <td>
//                   <button
//                     className="btn danger"
//                     onClick={() =>
//                       removeRow(row.id)
//                     }
//                   >
//                     Remove
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>

//           <tfoot>
//             <tr>
//               <td>Total</td>
//               <td>{totalBags}</td>

//               {breadTotals.map((total, i) => (
//                 <td key={i}>{total}</td>
//               ))}

//               <td>{totalBreadProduced}</td>
//             </tr>
//           </tfoot>
//         </table>
//       </div>

//       {/* SUMMARY */}
//       <div className="summary-section">
//         <h3>Production Summary</h3>

//         <div className="summary-grid">

//           <div className="summary-card">
//             <h4>Total Bags Used</h4>
//             <p>{totalBags}</p>
//           </div>

//           {columns.map((col, i) => (
//             <div
//               className="summary-card"
//               key={i}
//             >
//               <h4>{col}</h4>
//               <p>{breadTotals[i]}</p>
//             </div>
//           ))}

//           <div className="summary-card total-card">
//             <h4>Total Produced</h4>
//             <p>{totalBreadProduced}</p>
//           </div>

//         </div>
//       </div>

//       {/* PACKAGED */}
//       <div className="packaged-section">
//         <h3>Packaged Bread</h3>

//         <div className="packaged-grid">

//           {columns.map((col, i) => (
//             <div
//               className="packaged-card"
//               key={i}
//             >
//               <label>{col}</label>

//               <input
//                 type="number"
//                 value={packaged[i]}
//                 onChange={(e) =>
//                   updatePackaged(
//                     i,
//                     Number(e.target.value)
//                   )
//                 }
//               />
//             </div>
//           ))}

//           <div className="packaged-card packaged-total">
//             <label>Total Packaged</label>
//             <h2>{totalPackaged}</h2>
//           </div>

//         </div>
//       </div>

//       {/* DIFFERENCE */}
//       <div
//         className={
//           difference === 0
//             ? "difference-card success-diff"
//             : "difference-card danger-diff"
//         }
//       >
//         <h3>Production Difference</h3>

//         <div className="difference-content">
//           <div>
//             <span>Total Produced</span>
//             <h2>{totalBreadProduced}</h2>
//           </div>

//           <div>
//             <span>Total Packaged</span>
//             <h2>{totalPackaged}</h2>
//           </div>

//           <div>
//             <span>Difference</span>
//             <h1>{difference}</h1>
//           </div>
//         </div>
//       </div>

//       {/* COMMENT */}
//       <div className="comment-section">
//         <h3>Production Comment</h3>

//         <textarea
//           placeholder="Explain why production and packaged bread do not tally..."
//           value={comment}
//           onChange={(e) =>
//             setComment(e.target.value)
//           }
//         />
//       </div>
//     </div>
//   )
// }

// export default Productions























// import { useState } from "react"
// import "./Productions.css"

// interface RowData {
//   id: number
//   bags: number
//   breads: number[]
// }

// function Productions() {
//   const [columns, setColumns] = useState<string[]>([
//     "Small Bread",
//     "Family Bread",
//     "Chocolate Bread",
//   ])

//   const [rows, setRows] = useState<RowData[]>([
//     { id: 1, bags: 0, breads: [0, 0, 0] },
//   ])

//   // Packaged Bread
//   const [packaged, setPackaged] = useState<number[]>(
//     Array(columns.length).fill(0)
//   )

//   // Comment
//   const [comment, setComment] = useState("")

//   // ================= ADD ROW =================
//   const addRow = () => {
//     setRows([
//       ...rows,
//       {
//         id: Date.now(),
//         bags: 0,
//         breads: Array(columns.length).fill(0),
//       },
//     ])
//   }

//   // ================= REMOVE ROW =================
//   const removeRow = (id: number) => {
//     setRows(rows.filter((row) => row.id !== id))
//   }

//   // ================= ADD COLUMN =================
//   const addColumn = () => {
//     const newName = `Bread Type ${columns.length + 1}`

//     setColumns([...columns, newName])

//     setRows(
//       rows.map((row) => ({
//         ...row,
//         breads: [...row.breads, 0],
//       }))
//     )

//     setPackaged([...packaged, 0])
//   }

//   // ================= REMOVE COLUMN =================
//   const removeColumn = (index: number) => {
//     setColumns(columns.filter((_, i) => i !== index))

//     setRows(
//       rows.map((row) => ({
//         ...row,
//         breads: row.breads.filter((_, i) => i !== index),
//       }))
//     )

//     setPackaged(packaged.filter((_, i) => i !== index))
//   }

//   // ================= UPDATE COLUMN NAME =================
//   const updateColumnName = (index: number, value: string) => {
//     const updated = [...columns]
//     updated[index] = value
//     setColumns(updated)
//   }

//   // ================= UPDATE CELL =================
//   const updateCell = (
//     rowId: number,
//     type: "bags" | "bread",
//     value: number,
//     colIndex?: number
//   ) => {
//     setRows(
//       rows.map((row) => {
//         if (row.id !== rowId) return row

//         if (type === "bags") {
//           return { ...row, bags: value }
//         }

//         const updated = [...row.breads]

//         if (colIndex !== undefined) {
//           updated[colIndex] = value
//         }

//         return {
//           ...row,
//           breads: updated,
//         }
//       })
//     )
//   }

//   // ================= UPDATE PACKAGED =================
//   const updatePackaged = (index: number, value: number) => {
//     const updated = [...packaged]
//     updated[index] = value
//     setPackaged(updated)
//   }

//   // ================= TOTALS =================
//   const totalBags = rows.reduce((sum, row) => sum + row.bags, 0)

//   const breadTotals = columns.map((_, i) =>
//     rows.reduce((sum, row) => sum + (row.breads[i] || 0), 0)
//   )

//   const totalBreadProduced = breadTotals.reduce((a, b) => a + b, 0)

//   const totalPackaged = packaged.reduce((a, b) => a + b, 0)

//   return (
//     <div className="production-container">
//       <div className="header">
//         <h2>Daily Bread Production Report</h2>
//       </div>

//       {/* ACTION BUTTONS */}
//       <div className="actions">
//         <button className="btn primary" onClick={addRow}>
//           + Add Row
//         </button>

//         <button className="btn success" onClick={addColumn}>
//           + Add Bread Type
//         </button>
//       </div>

//       {/* MAIN TABLE */}
//       <div className="table-wrapper">
//         <table className="production-table">
//           <thead>
//             <tr>
//               <th>S/N</th>
//               <th>Bags</th>

//               {columns.map((col, i) => (
//                 <th key={i}>
//                   <div className="column-header">
//                     <input
//                       className="column-input"
//                       value={col}
//                       onChange={(e) =>
//                         updateColumnName(i, e.target.value)
//                       }
//                     />

//                     <span
//                       className="remove-col"
//                       onClick={() => removeColumn(i)}
//                     >
//                       ✕
//                     </span>
//                   </div>
//                 </th>
//               ))}

//               <th>Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map((row, index) => (
//               <tr key={row.id}>
//                 <td>{index + 1}</td>

//                 <td>
//                   <input
//                     type="number"
//                     value={row.bags}
//                     onChange={(e) =>
//                       updateCell(
//                         row.id,
//                         "bags",
//                         Number(e.target.value)
//                       )
//                     }
//                   />
//                 </td>

//                 {row.breads.map((bread, i) => (
//                   <td key={i}>
//                     <input
//                       type="number"
//                       value={bread}
//                       onChange={(e) =>
//                         updateCell(
//                           row.id,
//                           "bread",
//                           Number(e.target.value),
//                           i
//                         )
//                       }
//                     />
//                   </td>
//                 ))}

//                 <td>
//                   <button
//                     className="btn danger"
//                     onClick={() => removeRow(row.id)}
//                   >
//                     Remove
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>

//           <tfoot>
//             <tr>
//               <td>Total</td>
//               <td>{totalBags}</td>

//               {breadTotals.map((total, i) => (
//                 <td key={i}>{total}</td>
//               ))}

//               <td>{totalBreadProduced}</td>
//             </tr>
//           </tfoot>
//         </table>
//       </div>

//       {/* SUMMARY SECTION */}
//       <div className="summary-section">
//         <h3>Production Summary</h3>

//         <div className="summary-grid">
//           <div className="summary-card">
//             <h4>Total Bags Used</h4>
//             <p>{totalBags}</p>
//           </div>

//           {columns.map((col, i) => (
//             <div className="summary-card" key={i}>
//               <h4>{col}</h4>
//               <p>{breadTotals[i]}</p>
//             </div>
//           ))}

//           <div className="summary-card total-card">
//             <h4>Total Bread Produced</h4>
//             <p>{totalBreadProduced}</p>
//           </div>
//         </div>
//       </div>

//       {/* PACKAGED SECTION */}
//       <div className="packaged-section">
//         <h3>Packaged Bread</h3>

//         <div className="packaged-grid">
//           {columns.map((col, i) => (
//             <div className="packaged-card" key={i}>
//               <label>{col}</label>

//               <input
//                 type="number"
//                 value={packaged[i]}
//                 onChange={(e) =>
//                   updatePackaged(i, Number(e.target.value))
//                 }
//               />
//             </div>
//           ))}

//           <div className="packaged-card total-package">
//             <label>Total Packaged</label>
//             <h2>{totalPackaged}</h2>
//           </div>
//         </div>
//       </div>

//       {/* COMMENT BOX */}
//       <div className="comment-section">
//         <h3>Production Comment</h3>

//         <textarea
//           placeholder="State reason if total bread produced does not tally with total packaged..."
//           value={comment}
//           onChange={(e) => setComment(e.target.value)}
//         />
//       </div>
//     </div>
//   )
// }

// export default Productions













