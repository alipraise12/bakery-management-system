import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "./api";
import "./Suppliers.css";

interface Supplier {
  id: number;
  name: string;
  phone: string;
  contact_person: string;
  alternative_phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  notes: string;
  is_active: boolean;
}

function Suppliers() {

  // ==========================
  // STATE
  // ==========================

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingSupplier, setEditingSupplier] =
    useState<number | null>(null);

  const emptyForm = {
    name: "",
    phone: "",
    contact_person: "",
    alternative_phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    notes: "",
  };

  const [formData, setFormData] = useState(emptyForm);


  // ==========================
  // LOAD SUPPLIERS
  // ==========================

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/suppliers/`
      );

      setSuppliers(response.data);

    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  // ==========================
  // SAVE / UPDATE SUPPLIER
  // ==========================

  const saveSupplier = async () => {

    if (!formData.name.trim()) {
      alert("Company Name is required.");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Phone Number is required.");
      return;
    }

    try {

      if (editingSupplier !== null) {

        // UPDATE SUPPLIER
        await axios.put(
          `${API_URL}/api/suppliers/${editingSupplier}/`,
          formData
        );

        alert("Supplier updated successfully.");

      } else {

        // CREATE SUPPLIER
        await axios.post(
          `${API_URL}/api/suppliers/`,
          formData
        );

        alert("Supplier added successfully.");

      }

      // Close popup
      setShowModal(false);

      // Reset edit mode
      setEditingSupplier(null);

      // Clear form
      setFormData(emptyForm);

      // Reload supplier list
      fetchSuppliers();

    } catch (error: any) {

      console.error(error);

      if (error.response) {
        alert(JSON.stringify(error.response.data));
      } else {
        alert("Failed to save supplier.");
      }

    }

  };

  // ==========================
  // EDIT SUPPLIER
  // ==========================

  const editSupplier = (supplier: Supplier) => {

    setEditingSupplier(supplier.id);

    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      contact_person: supplier.contact_person || "",
      alternative_phone: supplier.alternative_phone || "",
      email: supplier.email || "",
      website: supplier.website || "",
      address: supplier.address || "",
      city: supplier.city || "",
      state: supplier.state || "",
      country: supplier.country || "Nigeria",
      notes: supplier.notes || "",
    });

    setShowModal(true);

  };

  // ==========================
  // DELETE SUPPLIER
  // ==========================

  const deleteSupplier = async (id: number) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmDelete) return;

    try {

      await axios.delete(
        `${API_URL}/api/suppliers/${id}/`
      );

      alert("Supplier deleted successfully.");

      fetchSuppliers();

    } catch (error: any) {

      console.error(error);

      if (error.response) {
        alert(JSON.stringify(error.response.data));
      } else {
        alert("Failed to delete supplier.");
      }

    }

  };

  // ==========================
  // SEARCH FILTER
  // ==========================

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(search.toLowerCase())
  );


    return (

    <div className="supplier-container">

      {/* ==========================
          HEADER
      ========================== */}

      <div className="supplier-header">

        <h1>Supplier Management</h1>

        <button
          className="add-btn"
          onClick={() => {

            setEditingSupplier(null);
            setFormData(emptyForm);
            setShowModal(true);

          }}
        >
          + Add Supplier
        </button>

      </div>

      {/* ==========================
          SEARCH
      ========================== */}

      <input
        type="text"
        className="search-box"
        placeholder="Search supplier..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ==========================
          TABLE
      ========================== */}

      <table className="supplier-table">

        <thead>

          <tr>

            <th>Company</th>
            <th>Phone</th>
            <th>Contact Person</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {filteredSuppliers.length > 0 ? (

            filteredSuppliers.map((supplier) => (

              <tr key={supplier.id}>

                <td>{supplier.name}</td>

                <td>{supplier.phone}</td>

                <td>{supplier.contact_person}</td>

                <td>{supplier.email}</td>

                <td>

                  {supplier.is_active
                    ? "Active"
                    : "Inactive"}

                </td>

                <td>

                 <div className="action-buttons">

  <button
    className="edit-btn"
    onClick={() => editSupplier(supplier)}
  >
    ✏ Edit
  </button>

  <button
    className="delete-btn"
    onClick={() => deleteSupplier(supplier.id)}
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
                colSpan={6}
                style={{ textAlign: "center" }}
              >
                No suppliers found.
              </td>

            </tr>

          )}

        </tbody>

      </table>

      {/* ==========================================
    MOBILE SUPPLIER CARDS
========================================== */}

<div className="supplier-cards">

  {filteredSuppliers.map((supplier) => (

    <div
      className="supplier-card"
      key={supplier.id}
    >

      <h3>{supplier.name}</h3>

      <p>
        <strong>📞 Phone:</strong>{" "}
        {supplier.phone}
      </p>

      <p>
        <strong>👤 Contact:</strong>{" "}
        {supplier.contact_person || "-"}
      </p>

      <p>
        <strong>✉ Email:</strong>{" "}
        {supplier.email || "-"}
      </p>

      <p>

        <strong>Status:</strong>{" "}

        <span
          className={
            supplier.is_active
              ? "status-active"
              : "status-inactive"
          }
        >
          {supplier.is_active
            ? "Active"
            : "Inactive"}
        </span>

      </p>

      <div className="action-buttons">

        <button
          className="edit-btn"
          onClick={() => editSupplier(supplier)}
        >
          ✏ Edit
        </button>

        <button
          className="delete-btn"
          onClick={() => deleteSupplier(supplier.id)}
        >
          🗑 Delete
        </button>

      </div>

    </div>

  ))}

</div>


      {/* ==========================
          ADD / EDIT SUPPLIER MODAL
      ========================== */}

      {showModal && (

        <div className="modal-overlay">

          <div className="modal">

            <h2>
              {editingSupplier !== null
                ? "Edit Supplier"
                : "Add Supplier"}
            </h2>

            <div className="form-grid">

              <input
                type="text"
                placeholder="Company Name *"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Phone Number *"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Contact Person"
                value={formData.contact_person}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact_person: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Alternative Phone"
                value={formData.alternative_phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    alternative_phone: e.target.value,
                  })
                }
              />

              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Website"
                value={formData.website}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    website: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    city: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    state: e.target.value,
                  })
                }
              />

            </div>

            <textarea
              placeholder="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: e.target.value,
                })
              }
            />

            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notes: e.target.value,
                })
              }
            />

            <div className="modal-buttons">

              <button
                className="cancel-btn"
                onClick={() => {

                  setShowModal(false);
                  setEditingSupplier(null);
                  setFormData(emptyForm);

                }}
              >
                Cancel
              </button>

              <button
                className="save-btn"
                onClick={saveSupplier}
              >
                {editingSupplier !== null
                  ? "Update Supplier"
                  : "Save Supplier"}
              </button>

            </div>

          </div>

        </div>

      )}

        </div>

  );

}

export default Suppliers;