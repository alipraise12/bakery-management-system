import { useEffect, useState } from "react";
import axios from "axios";
import "./Customers.css";

function Customers() {

  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");

  // ================= FETCH CUSTOMERS =================
  const fetchCustomers = () => {
    axios.get("http://127.0.0.1:8000/api/customers/")
      .then(res => {
        console.log("CUSTOMERS API:", res.data); // debug
        setCustomers(res.data || []);
      })
      .catch(err => {
        console.log("FETCH ERROR:", err);
        setCustomers([]);
      });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ================= ADD CUSTOMER =================
  const addCustomer = () => {
    if (!name || !phone) {
      alert("Fill all fields");
      return;
    }

    axios.post("http://127.0.0.1:8000/api/customers/register/", {
      name,
      phone
    })
    .then(() => {
      setName("");
      setPhone("");
      fetchCustomers(); // refresh list
    })
    .catch(err => {
      console.log("ADD ERROR:", err);
      alert(err.response?.data?.error || "Error adding customer");
    });
  };

  // ================= SAFE FILTER =================
  const filteredCustomers = (customers || []).filter(c => {
    const phone = c.phone || "";
    const name = c.name || "";

    return (
      phone.includes(search) ||
      name.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="customers-container">

      <h2>Customers</h2>

      {/* ================= ADD FORM ================= */}
      <div className="add-box">

        <input
          placeholder="Customer Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button onClick={addCustomer}>
          Add Customer
        </button>

      </div>

      {/* ================= SEARCH ================= */}
      <input
        className="search-box"
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ================= TABLE ================= */}
      <table className="customers-table">

        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
          </tr>
        </thead>

        <tbody>
          {filteredCustomers.map((c) => (
            <tr key={c.id}>
              <td>{c.name || "N/A"}</td>
              <td>{c.phone || "N/A"}</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}

export default Customers;
