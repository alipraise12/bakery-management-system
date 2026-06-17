import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Dashboard.css"

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")

    if (!storedUser) {
      navigate("/")
    } else {
      setUser(JSON.parse(storedUser))
    }
  }, [navigate])

  // 🔴 LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

  // 🧠 ALL DEPARTMENTS
  const allDepartments = [
    { name: "Store Inventory", path: "/inventory", admin: true },
    { name: "Sales", path: "/sales", admin: true },
    { name: "Production", path: "/production", admin: true },
    { name: "Staff Report", path: "/staff-report", admin: false },
    { name: "Attendance", path: "/attendance", admin: false },
    { name: "Dispatch for Sale", path: "/dispatch", admin: false },
    { name: "Payroll", path: "/payroll", admin: true },
    { name: "Accounting", path: "/accounting", admin: true },
    { name: "Customers", path: "/customers", admin: true },
    {name:"Productions", path: "/productions", admin: false}
    
  ]

  if (!user) return null

  // ✅ FILTER BASED ON ROLE
  const departments = user.is_admin
    ? allDepartments
    : allDepartments.filter(dept => !dept.admin)

  return (
    <div className="dashboard">

      {/* 🔷 HEADER */}
      <div className="topbar">
        <h2 className="title">Dashboard</h2>

        <div className="user-info">

          {/* TEXT */}
          <div className="user-text">
            <span className="name">
              {user.first_name} {user.last_name}
            </span>
            <span className="phone">
              {user.phone || "No phone"}
            </span>
          </div>

          {/* PROFILE + DROPDOWN */}
          <div className="profile-wrapper">
            <img
              src={
                user.picture
                  ? `http://127.0.0.1:8000${user.picture}`
                  : "https://via.placeholder.com/80"
              }
              alt="profile"
              className="avatar"
              onClick={() => setShowMenu(!showMenu)}
            />

            {/* 🔽 DROPDOWN */}
            {showMenu && (
              <div className="dropdown">
                <p onClick={() => navigate("/profile")}>
                  Profile
                </p>
                <p onClick={handleLogout} className="logout">
                  Logout
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 🔷 CONTENT */}
      <div className="content">
        <h1 className="header">Select Department</h1>

        <div className="card-container">
          {departments.map((dept, index) => (
            <div
              key={index}
              className="card"
              onClick={() => navigate(dept.path)}
            >
              {dept.name}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Dashboard












// import { useEffect, useState } from "react"
// import { useNavigate } from "react-router-dom"
// import "./Dashboard.css"

// function Dashboard() {
//   const navigate = useNavigate()
//   const [user, setUser] = useState<any>(null)

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user")

//     if (!storedUser) {
//       navigate("/")
//     } else {
//       const parsedUser = JSON.parse(storedUser)

//       console.log("✅ Logged in user:", parsedUser) // 🔥 DEBUG (optional)

//       setUser(parsedUser)
//     }
//   }, [navigate])

//   const departments = [
//     { name: "Store Inventory", path: "/inventory" },
//     { name: "Sales", path: "/sales" },
//     { name: "Production", path: "/production" },
//     { name: "Staff Report", path: "/staff-report" },
//     { name: "Attendance", path: "/attendance" },
//     { name: "Dispatch for Sale", path: "/dispatch" },
//     { name: "Payroll", path: "/payroll" },
//     { name: "Accounting", path: "/accounting" } // ✅ added
//   ]

//   if (!user) return null

//   return (
//     <div className="dashboard">

//       {/* 🔷 HEADER */}
//       <div className="topbar">
//         <h2 className="title">Dashboard</h2>

//         <div className="user-info">

//           {/* 🔹 USER TEXT */}
//           <div className="user-text">
//             <span className="name">
//               {user.first_name} {user.last_name}
//             </span>

//             <span className="phone">
//               {user.phone ? user.phone : "No phone"}
//             </span>
//           </div>

//           {/* 🔹 PROFILE IMAGE */}
//           <img
//             src={
//               user.picture
//                 ? `http://127.0.0.1:8000${user.picture}`
//                 : "https://via.placeholder.com/80"
//             }
//             alt="profile"
//             className="avatar"
//           />

//         </div>
//       </div>

//       {/* 🔷 CONTENT */}
//       <div className="content">
//         <h1 className="header">Select Department</h1>

//         <div className="card-container">
//           {departments.map((dept, index) => (
//             <div
//               key={index}
//               className="card"
//               onClick={() => navigate(dept.path)}
//             >
//               {dept.name}
//             </div>
//           ))}
//         </div>
//       </div>

//     </div>
//   )
// }

// export default Dashboard










// import { useEffect, useState } from "react"
// import { useNavigate } from "react-router-dom"
// import "./Dashboard.css"

// function Dashboard() {
//   const navigate = useNavigate()
//   const [user, setUser] = useState<any>(null)

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user")

//     if (!storedUser) {
//       navigate("/")
//     } else {
//       setUser(JSON.parse(storedUser))
//     }
//   }, [navigate])

//   const departments = [
//     { name: "Store Inventory", path: "/inventory" },
//     { name: "Sales", path: "/sales" },
//     { name: "Production", path: "/production" },
//     { name: "Staff Report", path: "/staff-report" },
//     { name: "Attendance", path: "/attendance" },
//     { name: "Dispatch for Sale", path: "/dispatch" },
//     { name: "Payroll", path: "/payroll" },
//     { name: "Accounting", path: "/accounting" } // ✅ NEW CARD
//   ]

//   if (!user) return null

//   return (
//     <div className="dashboard">

//       {/* HEADER */}
//       <div className="topbar">
//         <h2 className="title">Dashboard</h2>

//         <div className="user-info">
//           <div className="user-text">
//             {/* ✅ FIXED FIELD NAMES */}
//             <span className="name">
//               {user.first_name} {user.last_name}
//             </span>
//             <span className="phone">
//               {user.phone || "No phone"}
//             </span>
//           </div>

//           {/* ✅ FIXED IMAGE FIELD + FALLBACK */}
//           <img
//             src={
//               user.picture
//                 ? `http://127.0.0.1:8000${user.picture}`
//                 : "https://via.placeholder.com/80"
//             }
//             alt="profile"
//             className="avatar"
//           />
//         </div>
//       </div>

//       {/* CONTENT */}
//       <div className="content">
//         <h1 className="header">Select Department</h1>

//         <div className="card-container">
//           {departments.map((dept, index) => (
//             <div
//               key={index}
//               className="card"
//               onClick={() => navigate(dept.path)}
//             >
//               {dept.name}
//             </div>
//           ))}
//         </div>
//       </div>

//     </div>
//   )
// }

// export default Dashboard











// import { useEffect, useState } from "react"
// import { useNavigate } from "react-router-dom"
// import "./Dashboard.css"

// function Dashboard() {
//   const navigate = useNavigate()
//   const [user, setUser] = useState<any>(null)

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user")

//     if (!storedUser) {
//       navigate("/")
//     } else {
//       setUser(JSON.parse(storedUser))
//     }
//   }, [navigate]) // ✅ added dependency (best practice)

//   const departments = [
//     { name: "Store Inventory", path: "/inventory" },
//     { name: "Sales", path: "/sales" },
//     { name: "Production", path: "/production" },
//     { name: "Staff Report", path: "/staff-report" },
//     { name: "Attendance", path: "/attendance" },
//     { name: "Dispatch for Sale", path: "/dispatch" },
//     { name: "Payroll", path: "/payroll" }
//   ]

//   if (!user) return null

//   return (
//     <div className="dashboard"> {/* ✅ ROOT WRAPPER */}

//       {/* HEADER */}
//       <div className="topbar">
//         <h2 className="title">Dashboard</h2>

//         <div className="user-info">
//           <div className="user-text">
//             <span className="name">{user.name}</span>
//             <span className="phone">{user.phone}</span>
//           </div>

//           <img
//             src={`http://127.0.0.1:8000${user.image}`}
//             alt="profile"
//             className="avatar"
//           />
//         </div>
//       </div>

//       {/* CONTENT */}
//       <div className="content">
//         <h1 className="header">Select Department</h1>

//         <div className="card-container">
//           {departments.map((dept, index) => (
//             <div
//               key={index}
//               className="card"
//               onClick={() => navigate(dept.path)}
//             >
//               {dept.name}
//             </div>
//           ))}
//         </div>
//       </div>

//     </div>
//   )
// }

// export default Dashboard