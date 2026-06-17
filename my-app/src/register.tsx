import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./register.css"

function Register() {

  const [firstName,setFirstName] = useState("")
  const [lastName,setLastName] = useState("")
  const [phone,setPhone] = useState("")
  const [email,setEmail] = useState("")
  const [picture,setPicture] = useState(null)
  const [preview,setPreview] = useState(null)
  const [error,setError] = useState("")

  const navigate = useNavigate()

  const register = (e) => {
    e.preventDefault()
    setError("")

    if (!firstName || !lastName || !phone || !email) {
      setError("All fields are required")
      return
    }

    navigate("/guarantor", {
      state: {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        email: email,
        picture: picture
      }
    })
  }

  return (
    <div className="register-container">
      
      <div className="register-card">

        <h2 className="register-title">Staff Registration</h2>

        {error && <p className="register-error">{error}</p>}

        {/* PROFILE IMAGE */}
        <div className="register-image-section">

          <div className="register-avatar">
            {preview ? (
              <img src={preview} alt="preview" />
            ) : (
              <span>No Photo</span>
            )}
          </div>

          <input
            type="file"
            className="register-file"
            onChange={(e)=>{
              const file = e.target.files[0]
              setPicture(file)
              setPreview(URL.createObjectURL(file))
            }}
          />
        </div>

        <form onSubmit={register}>

          <input
            className="register-input"
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e)=>setFirstName(e.target.value)}
          />

          <input
            className="register-input"
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e)=>setLastName(e.target.value)}
          />

          <input
            className="register-input"
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e)=>setPhone(e.target.value)}
          />

          <input
            className="register-input"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <button className="register-button" type="submit">
            Next
          </button>

        </form>

        <p className="register-login">
          Already have an account?{" "}
          <Link to="/">Login</Link>
        </p>

        <p className="register-admin">
          <Link to="/admin-register">
            Register as an Admin
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register






















// import { useState } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import "./App.css"

// function Register() {

//   const [firstName,setFirstName] = useState("")
//   const [lastName,setLastName] = useState("")
//   const [phone,setPhone] = useState("")
//   const [email,setEmail] = useState("")
//   const [picture,setPicture] = useState(null)
//   const [preview,setPreview] = useState(null)
//   const [error,setError] = useState("")

//   const navigate = useNavigate()

//   const register = (e) => {
//     e.preventDefault()

//     setError("")

//     if (!firstName || !lastName || !phone || !email) {
//       setError("All fields are required")
//       return
//     }

//     navigate("/guarantor", {
//       state: {
//         first_name: firstName,
//         last_name: lastName,
//         phone: phone,
//         email: email,
//         picture: picture
//       }
//     })
//   }

//   return (
//     <div className="container">
      
//       <div 
//         className="card" 
//         style={{ 
//           width: "360px", 
//           padding: "15px"   // 🔻 reduced padding
//         }}
//       >

//         <h2 style={{ marginBottom: "10px" }}>Staff Registration</h2>

//         {error && <p style={{color: "red"}}>{error}</p>}

//         {/* PROFILE IMAGE */}
//         <div style={{ textAlign: "center", marginBottom: "10px" }}>

//           <div style={{
//             width: "60px",   // 🔻 smaller
//             height: "60px",
//             borderRadius: "50%",
//             background: "#ddd",
//             margin: "auto",
//             overflow: "hidden"
//           }}>
//             {preview ? (
//               <img 
//                 src={preview} 
//                 alt="preview"
//                 style={{ width: "100%", height: "100%", objectFit: "cover" }} 
//               />
//             ) : (
//               <span style={{ fontSize: "10px" }}>No Photo</span>
//             )}
//           </div>

//           <input
//             type="file"
//             style={{ marginTop: "5px" }}
//             onChange={(e)=>{
//               const file = e.target.files[0]
//               setPicture(file)
//               setPreview(URL.createObjectURL(file))
//             }}
//           />
//         </div>

//         <form onSubmit={register}>

//           <input
//             type="text"
//             placeholder="First Name"
//             value={firstName}
//             onChange={(e)=>setFirstName(e.target.value)}
//           />

//           <input
//             type="text"
//             placeholder="Last Name"
//             value={lastName}
//             onChange={(e)=>setLastName(e.target.value)}
//           />

//           <input
//             type="text"
//             placeholder="Phone Number"
//             value={phone}
//             onChange={(e)=>setPhone(e.target.value)}
//           />

//           <input
//             type="email"
//             placeholder="Email Address"
//             value={email}
//             onChange={(e)=>setEmail(e.target.value)}
//           />

//           {/* NEXT BUTTON */}
//           <div style={{ marginTop: "8px" }}>
//             <button type="submit">Next</button>
//           </div>

//         </form>

//         {/* LOGIN LINK */}
//         <p style={{ marginTop: "10px", textAlign: "center", fontSize: "14px" }}>
//           Already have an account?{" "}
//           <Link to="/" style={{ color: "red" }}>
//             Login
//           </Link>
//         </p>

//         {/* ✅ SIMPLE ADMIN LINK (NOT BUTTON) */}
//         <p style={{ textAlign: "center", marginTop: "5px", fontSize: "14px" }}>
//           <Link to="/admin-register" style={{ color: "blue" }}>
//             Register as an Admin
//           </Link>
//         </p>

//       </div>
//     </div>
//   )
// }

// export default Register















// import { useState } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import "./App.css"

// function Register() {

//   const [firstName,setFirstName] = useState("")
//   const [lastName,setLastName] = useState("")
//   const [phone,setPhone] = useState("")
//   const [email,setEmail] = useState("")
//   const [picture,setPicture] = useState(null)
//   const [preview,setPreview] = useState(null)
//   const [error,setError] = useState("")

//   const navigate = useNavigate()

//   const register = (e) => {
//     e.preventDefault()

//     setError("")

//     if (!firstName || !lastName || !phone || !email) {
//       setError("All fields are required")
//       return
//     }

//     // 🚀 PASS DATA TO NEXT PAGE (NO API YET)
//     navigate("/guarantor", {
//       state: {
//         first_name: firstName,
//         last_name: lastName,
//         phone: phone,
//         email: email,
//         picture: picture
//       }
//     })
//   }

//   return (
//     <div className="container">
      
//       <div className="card" style={{ width: "380px" }}>

//         <h2>Staff Registration</h2>

//         {error && <p style={{color: "red"}}>{error}</p>}

//         {/* PROFILE IMAGE */}
//         <div style={{ textAlign: "center", marginBottom: "20px" }}>

//           <div style={{
//             width: "80px",
//             height: "80px",
//             borderRadius: "50%",
//             background: "#ddd",
//             margin: "auto",
//             overflow: "hidden"
//           }}>
//             {preview ? (
//               <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//             ) : (
//               <span style={{ fontSize: "12px" }}>No Photo</span>
//             )}
//           </div>

//           <input
//             type="file"
//             style={{ marginTop: "10px" }}
//             onChange={(e)=>{
//               const file = e.target.files[0]
//               setPicture(file)
//               setPreview(URL.createObjectURL(file))
//             }}
//           />
//         </div>

//         <form onSubmit={register}>

//           <input
//             type="text"
//             placeholder="First Name"
//             value={firstName}
//             onChange={(e)=>setFirstName(e.target.value)}
//           />

//           <input
//             type="text"
//             placeholder="Last Name"
//             value={lastName}
//             onChange={(e)=>setLastName(e.target.value)}
//           />

//           <input
//             type="text"
//             placeholder="Phone Number"
//             value={phone}
//             onChange={(e)=>setPhone(e.target.value)}
//           />

//           <input
//             type="email"
//             placeholder="Email Address"
//             value={email}
//             onChange={(e)=>setEmail(e.target.value)}
//           />

//           {/* NEXT BUTTON */}
//           <div style={{ textAlign: "left", marginTop: "10px" }}>
//             <button type="submit">Next</button>
//           </div>

//         </form>

//         {/* NAV */}
//         <p style={{ marginTop: "15px", textAlign: "center" }}>
//           Already have an account?{" "}
//           <Link to="/" style={{ color: "red", fontWeight: "bold" }}>
//             Login
//           </Link>
//         </p>

//       </div>
//     </div>
//   )
// }

// export default Register