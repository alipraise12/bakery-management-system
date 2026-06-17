import axios from "axios"
import { useState } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import "./guarantor.css"

function Guarantor() {

  const location = useLocation()
  const navigate = useNavigate()

  const staffData = location.state

  const [gFirst, setGFirst] = useState("")
  const [gLast, setGLast] = useState("")
  const [gEmail, setGEmail] = useState("")
  const [gPhone, setGPhone] = useState("")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const submitAll = async (e: any) => {
    e.preventDefault()
    setError("")

    if (!gFirst || !gLast || !gEmail || !gPhone || !password || !confirmPassword) {
      setError("All fields are required")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()

      formData.append("first_name", staffData.first_name)
      formData.append("last_name", staffData.last_name)
      formData.append("phone", staffData.phone)
      formData.append("email", staffData.email)
      formData.append("picture", staffData.picture)

      formData.append("guarantor_first_name", gFirst)
      formData.append("guarantor_last_name", gLast)
      formData.append("guarantor_email", gEmail)
      formData.append("guarantor_phone", gPhone)

      formData.append("password", password)

      await axios.post(
  "http://127.0.0.1:8000/api/staff/register/",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
)

      alert("Registration Complete ✅")
      navigate("/")

    } catch (err) {
      console.log(err)
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // 🚨 Handle refresh case
  if (!staffData) {
    return (
      <div className="guarantor-container">
        <div className="guarantor-card">
          <p>No data found. Please start again.</p>
          <Link to="/register">Go Back</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="guarantor-container">

      <div className="guarantor-card">

        <h2>Guarantor Details</h2>

        {error && <p className="guarantor-error">{error}</p>}

        <form onSubmit={submitAll}>

          <input
            className="guarantor-input"
            type="text"
            placeholder="Guarantor First Name"
            value={gFirst}
            onChange={(e)=>setGFirst(e.target.value)}
          />

          <input
            className="guarantor-input"
            type="text"
            placeholder="Guarantor Last Name"
            value={gLast}
            onChange={(e)=>setGLast(e.target.value)}
          />

          <input
            className="guarantor-input"
            type="email"
            placeholder="Guarantor Email"
            value={gEmail}
            onChange={(e)=>setGEmail(e.target.value)}
          />

          <input
            className="guarantor-input"
            type="text"
            placeholder="Guarantor Phone"
            value={gPhone}
            onChange={(e)=>setGPhone(e.target.value)}
          />

          {/* 🔐 PASSWORD */}
          <div className="guarantor-password-wrapper">
            <input
              className="guarantor-input"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />

            <span onClick={()=>setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <input
            className="guarantor-input"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e)=>setConfirmPassword(e.target.value)}
          />

          {/* BUTTON WITH SPINNER */}
          <button className="guarantor-button" type="submit" disabled={loading}>
            {loading ? <div className="spinner"></div> : "Submit"}
          </button>

        </form>

        <p className="guarantor-back">
          <Link to="/register">Back</Link>
        </p>

      </div>
    </div>
  )
}

export default Guarantor


























// import axios from "axios"
// import { useState } from "react"
// import { useLocation, useNavigate, Link } from "react-router-dom"
// import "./App.css"

// function Guarantor() {

//   const location = useLocation()
//   const navigate = useNavigate()

//   const staffData = location.state

//   const [gFirst, setGFirst] = useState("")
//   const [gLast, setGLast] = useState("")
//   const [gEmail, setGEmail] = useState("")
//   const [gPhone, setGPhone] = useState("")

//   // ✅ PASSWORD STATES
//   const [password, setPassword] = useState("")
//   const [confirmPassword, setConfirmPassword] = useState("")
//   const [showPassword, setShowPassword] = useState(false)

//   const [error, setError] = useState("")

//   const submitAll = async (e) => {
//     e.preventDefault()

//     setError("")

//     // ✅ VALIDATION
//     if (!gFirst || !gLast || !gEmail || !gPhone || !password || !confirmPassword) {
//       setError("All fields are required")
//       return
//     }

//     if (password.length < 6) {
//       setError("Password must be at least 6 characters")
//       return
//     }

//     if (password !== confirmPassword) {
//       setError("Passwords do not match")
//       return
//     }

//     try {
//       const formData = new FormData()

//       // ✅ STAFF DATA
//       formData.append("first_name", staffData.first_name)
//       formData.append("last_name", staffData.last_name)
//       formData.append("phone", staffData.phone)
//       formData.append("email", staffData.email)
//       formData.append("picture", staffData.picture)

//       // ✅ GUARANTOR DATA
//       formData.append("guarantor_first_name", gFirst)
//       formData.append("guarantor_last_name", gLast)
//       formData.append("guarantor_email", gEmail)
//       formData.append("guarantor_phone", gPhone)

//       // ✅ PASSWORD
//       formData.append("password", password)

//       await axios.post("http://127.0.0.1:8000/api/register/", formData)

//       alert("Registration Complete ✅")

//       navigate("/")

//     } catch (err) {
//       console.log(err)
//       setError("Something went wrong")
//     }
//   }

//   // 🚨 IF USER REFRESHES
//   if (!staffData) {
//     return (
//       <div className="container">
//         <div className="card">
//           <p>No data found. Please start again.</p>
//           <Link to="/register">Go Back</Link>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="container">

//       <div className="card" style={{ width: "380px" }}>

//         <h2>Guarantor Details</h2>

//         {error && <p style={{ color: "red" }}>{error}</p>}

//         <form onSubmit={submitAll}>

//           <input
//             type="text"
//             placeholder="Guarantor First Name"
//             value={gFirst}
//             onChange={(e)=>setGFirst(e.target.value)}
//           />

//           <input
//             type="text"
//             placeholder="Guarantor Last Name"
//             value={gLast}
//             onChange={(e)=>setGLast(e.target.value)}
//           />

//           <input
//             type="email"
//             placeholder="Guarantor Email"
//             value={gEmail}
//             onChange={(e)=>setGEmail(e.target.value)}
//           />

//           <input
//             type="text"
//             placeholder="Guarantor Phone"
//             value={gPhone}
//             onChange={(e)=>setGPhone(e.target.value)}
//           />

//           {/* 🔐 PASSWORD */}
//           <div style={{ position: "relative" }}>
//             <input
//               type={showPassword ? "text" : "password"}
//               placeholder="Password"
//               value={password}
//               onChange={(e)=>setPassword(e.target.value)}
//             />

//             <span
//               onClick={()=>setShowPassword(!showPassword)}
//               style={{
//                 position: "absolute",
//                 right: "10px",
//                 top: "50%",
//                 transform: "translateY(-50%)",
//                 cursor: "pointer",
//                 fontSize: "12px",
//                 color: "gray"
//               }}
//             >
//               {showPassword ? "Hide" : "Show"}
//             </span>
//           </div>

//           {/* CONFIRM PASSWORD */}
//           <input
//             type="password"
//             placeholder="Confirm Password"
//             value={confirmPassword}
//             onChange={(e)=>setConfirmPassword(e.target.value)}
//           />

//           <button type="submit" style={{ marginTop: "10px" }}>
//             Submit
//           </button>

//         </form>

//         <p style={{ marginTop: "15px", textAlign: "center" }}>
//           <Link to="/register" style={{ color: "red" }}>
//             Back
//           </Link>
//         </p>

//       </div>

//     </div>
//   )
// }

// export default Guarantor