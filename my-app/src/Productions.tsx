import { useState } from "react"
import axios from "axios"
import "./Productions.css"
import API_URL from "./api";

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

  const [isSaved, setIsSaved] = useState(false)

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
 // ================= RESET FORM =================
const handleNew = async () => {

  
  console.log("NEW BUTTON CLICKED");


  try {

    await axios.post(
      `${API_URL}/api/new-production/`,
      {}
    )

    // ================= RESET PAGE =================

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

    setIsSaved(false)

    alert("Production reset successfully.")

  } catch (error: any) {

    console.log(error)

    if (error.response?.data?.message) {

      alert(error.response.data.message)

    } else {

      alert("Unable to start a new production session.")

    }
  }
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
      if (isSaved) {
        alert("This production has already been saved.")
        return
    }

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
   `${API_URL}/api/daily-production/`,
    payload
)
      setIsSaved(true)

      alert("Production Saved Successfully")

    } catch (error: any) {

  console.log(error)

  if (error.response?.data?.message) {

    alert(error.response.data.message)

  } else if (error.response?.data?.error) {

    alert(error.response.data.error)

  } else {

    alert("Failed to save")

  }
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
            disabled={isSaved}
>
             {isSaved ? "Saved ✓" : "Save"}
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














