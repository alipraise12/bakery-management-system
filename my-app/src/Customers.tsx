import { useEffect, useState } from "react";
import axios from "axios";
import "./customers.css";

function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");

  // ================= FETCH CUSTOMERS =================
  const fetchCustomers = () => {
    axios
      .get("http://159.65.94.152/api/customers/")
      .then((res) => {
        console.log("CUSTOMERS API:", res.data);

        if (Array.isArray(res.data)) {
          setCustomers(res.data);
        } else {
          setCustomers([]);
        }
      })
      .catch((err) => {
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

    axios
      .post("http://159.65.94.152/api/customers/register/", {
        name,
        phone,
      })
      .then(() => {
        setName("");
        setPhone("");
        fetchCustomers();
      })
      .catch((err) => {
        console.log("ADD ERROR:", err);
        alert(err.response?.data?.error || "Error adding customer");
      });
  };

  // ================= FILTER =================
  const filteredCustomers = customers.filter((customer: any) => {
    const customerName = customer.name || "";
    const customerPhone = customer.phone || "";

    return (
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      customerPhone.includes(search)
    );
  });

  return (
    <div className="customers-container">
      <h2>Customers</h2>

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

      <input
        className="search-box"
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="customers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
          </tr>
        </thead>

        <tbody>
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer: any) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.phone}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} style={{ textAlign: "center" }}>
                No customers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Customers;






// import { useEffect, useState } from "react";
// import axios from "axios";
// import "./customers.css";

// function Customers() {

//   const [customers, setCustomers] = useState([]);
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [search, setSearch] = useState("");

//   // ================= FETCH CUSTOMERS =================
//   const fetchCustomers = () => {
//     axios.get("/api/customers/")
//       .then(res => {
//         console.log("CUSTOMERS API:", res.data); // debug
//         setCustomers(res.data || []);
//       })
//       .catch(err => {
//         console.log("FETCH ERROR:", err);
//         setCustomers([]);
//       });
//   };

//   useEffect(() => {
//     fetchCustomers();
//   }, []);

//   // ================= ADD CUSTOMER =================
//   const addCustomer = () => {
//     if (!name || !phone) {
//       alert("Fill all fields");
//       return;
//     }

//     axios.post("http://159.65.94.152/api/customers/register/", {
//       name,
//       phone
//     })
//     .then(() => {
//       setName("");
//       setPhone("");
//       fetchCustomers(); // refresh list
//     })
//     .catch(err => {
//       console.log("ADD ERROR:", err);
//       alert(err.response?.data?.error || "Error adding customer");
//     });
//   };

//   // ================= SAFE FILTER =================
//   const filteredCustomers = (customers || []).filter(c => {
//     const phone = c.phone || "";
//     const name = c.name || "";

//     return (
//       phone.includes(search) ||
//       name.toLowerCase().includes(search.toLowerCase())
//     );
//   });

//   return (
//     <div className="customers-container">

//       <h2>Customers</h2>

//       {/* ================= ADD FORM ================= */}
//       <div className="add-box">

//         <input
//           placeholder="Customer Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />

//         <input
//           placeholder="Phone Number"
//           value={phone}
//           onChange={(e) => setPhone(e.target.value)}
//         />

//         <button onClick={addCustomer}>
//           Add Customer
//         </button>

//       </div>

//       {/* ================= SEARCH ================= */}
//       <input
//         className="search-box"
//         placeholder="Search by name or phone..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />

//       {/* ================= TABLE ================= */}
//       <table className="customers-table">

//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Phone</th>
//           </tr>
//         </thead>

//         <tbody>
//           {filteredCustomers.map((c) => (
//             <tr key={c.id}>
//               <td>{c.name || "N/A"}</td>
//               <td>{c.phone || "N/A"}</td>
//             </tr>
//           ))}
//         </tbody>

//       </table>

//     </div>
//   );
// }

// export default Customers;