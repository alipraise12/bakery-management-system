import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "./api";
import "./ExpenseItems.css";

interface ExpenseItem {
  id: number;
  name: string;
  category: string;
  description: string;
  is_active: boolean;
}

function ExpenseItems() {

  // ==========================
  // STATE
  // ==========================

  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingItem, setEditingItem] =
    useState<number | null>(null);

  const emptyForm = {

    name: "",

    category: "DIRECT",

    description: "",

  };

  const [formData, setFormData] = useState(emptyForm);

    // ==========================
  // LOAD EXPENSE ITEMS
  // ==========================

  useEffect(() => {
    fetchExpenseItems();
  }, []);

  const fetchExpenseItems = async () => {

    try {

      const response = await axios.get(
        `${API_URL}/api/expense-items/`
      );

      setExpenseItems(response.data);

    } catch (error) {

      console.error("Error fetching expense items:", error);

    }

  };

  // ==========================
  // SAVE / UPDATE EXPENSE ITEM
  // ==========================

  const saveExpenseItem = async () => {

    if (!formData.name.trim()) {

      alert("Expense Item Name is required.");

      return;

    }

    if (!formData.category) {

      alert("Please select a category.");

      return;

    }

    try {

      if (editingItem !== null) {

        // UPDATE

        await axios.put(

          `${API_URL}/api/expense-items/${editingItem}/`,

          formData

        );

        alert("Expense Item updated successfully.");

      } else {

        // CREATE

        await axios.post(

          `${API_URL}/api/expense-items/`,

          formData

        );

        alert("Expense Item added successfully.");

      }

      setShowModal(false);

      setEditingItem(null);

      setFormData(emptyForm);

      fetchExpenseItems();

    } catch (error: any) {

      console.error(error);

      if (error.response) {

        alert(JSON.stringify(error.response.data));

      } else {

        alert("Failed to save expense item.");

      }

    }

  };


    // ==========================
  // EDIT EXPENSE ITEM
  // ==========================

  const editExpenseItem = (item: ExpenseItem) => {

    setEditingItem(item.id);

    setFormData({

      name: item.name,

      category: item.category,

      description: item.description || "",

    });

    setShowModal(true);

  };

  // ==========================
  // DELETE EXPENSE ITEM
  // ==========================

  const deleteExpenseItem = async (id: number) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense item?"
    );

    if (!confirmDelete) return;

    try {

      await axios.delete(
        `${API_URL}/api/expense-items/${id}/`
      );

      alert("Expense Item deleted successfully.");

      fetchExpenseItems();

    } catch (error: any) {

      console.error(error);

      if (error.response) {

        alert(JSON.stringify(error.response.data));

      } else {

        alert("Failed to delete expense item.");

      }

    }

  };

  // ==========================
  // SEARCH
  // ==========================

  const filteredExpenseItems = expenseItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );


    return (

    <div className="expense-item-container">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="expense-item-header">

        <h1>Expense Item Management</h1>

        <button
          className="add-btn"
          onClick={() => {

            setEditingItem(null);

            setFormData(emptyForm);

            setShowModal(true);

          }}
        >
          + Add Expense Item
        </button>

      </div>

      {/* ==========================================
          SEARCH
      ========================================== */}

      <input
        type="text"
        className="search-box"
        placeholder="Search expense item..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ==========================================
          TABLE
      ========================================== */}

      <table className="expense-item-table">

        <thead>

          <tr>

            <th>Expense Item</th>

            <th>Category</th>

            <th>Status</th>

            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {filteredExpenseItems.length > 0 ? (

            filteredExpenseItems.map((item) => (

              <tr key={item.id}>

                <td className="item-name">

                  {item.name}

                </td>

                <td>

                  {item.category === "DIRECT"
                    ? "Direct Cost"
                    : "Indirect Cost"}

                </td>

                <td>

                  <span
                    className={
                      item.is_active
                        ? "status-active"
                        : "status-inactive"
                    }
                  >
                    {item.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>

                </td>

                <td>

                  <div className="action-buttons">

                    <button
                      className="edit-btn"
                      onClick={() => editExpenseItem(item)}
                    >
                      ✏ Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteExpenseItem(item.id)
                      }
                    >
                      🗑 Delete
                    </button>

                  </div>

                </td>

              </tr>

            ))

          ) : (

            <tr>

              <td
                colSpan={4}
                style={{ textAlign: "center" }}
              >
                No expense items found.
              </td>

            </tr>

          )}

        </tbody>

      </table>

      {/* ==========================================
          MOBILE EXPENSE ITEM CARDS
      ========================================== */}

      <div className="expense-item-cards">

        {filteredExpenseItems.length > 0 ? (

          filteredExpenseItems.map((item) => (

            <div
              className="expense-item-card"
              key={item.id}
            >

              <h3>{item.name}</h3>

              <p>

                <strong>Category:</strong>{" "}

                {item.category === "DIRECT"
                  ? "Direct Cost"
                  : "Indirect Cost"}

              </p>

              <p>

                <strong>Description:</strong>{" "}

                {item.description
                  ? item.description
                  : "-"}

              </p>

              <p>

                <strong>Status:</strong>{" "}

                <span
                  className={
                    item.is_active
                      ? "status-active"
                      : "status-inactive"
                  }
                >
                  {item.is_active
                    ? "Active"
                    : "Inactive"}
                </span>

              </p>

              <div className="action-buttons">

                <button
                  className="edit-btn"
                  onClick={() =>
                    editExpenseItem(item)
                  }
                >
                  ✏ Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteExpenseItem(item.id)
                  }
                >
                  🗑 Delete
                </button>

              </div>

            </div>

          ))

        ) : (

          <div className="expense-item-card">

            <p style={{ textAlign: "center" }}>
              No expense items found.
            </p>

          </div>

        )}

      </div>


          {/* ==========================================
          ADD / EDIT EXPENSE ITEM MODAL
      ========================================== */}

      {showModal && (

        <div className="modal-overlay">

          <div className="modal">

            <h2>

              {editingItem !== null
                ? "Edit Expense Item"
                : "Add Expense Item"}

            </h2>

            <div className="form-group">

              <label>Expense Item Name *</label>

              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                placeholder="Enter expense item name"
              />

            </div>

            <div className="form-group">

              <label>Category *</label>

              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                  })
                }
              >
                <option value="DIRECT">
                  Direct Cost
                </option>

                <option value="INDIRECT">
                  Indirect Cost
                </option>

              </select>

            </div>

            <div className="form-group">

              <label>Description</label>

              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="Optional description"
              />

            </div>

            <div className="modal-buttons">

              <button
                className="cancel-btn"
                onClick={() => {

                  setShowModal(false);

                  setEditingItem(null);

                  setFormData(emptyForm);

                }}
              >
                Cancel
              </button>

              <button
                className="save-btn"
                onClick={saveExpenseItem}
              >
                {editingItem !== null
                  ? "Update Expense Item"
                  : "Save Expense Item"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

export default ExpenseItems;