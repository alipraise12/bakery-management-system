import axios from "axios"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./login.css"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const login = async (e: any) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("All fields are required")
      return
    }

    try {
      setLoading(true)

      const res = await axios.post("http://159.65.94.152/api/login/", {
        email,
        password
      })

      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.staff))

      navigate("/dashboard")

    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <form onSubmit={login} className="login-card">

        <h2 className="login-title">Login</h2>

        {error && <p className="login-error">{error}</p>}

        <input
          className="login-input"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        {/* ✅ BUTTON WITH SPINNER */}
        <button 
          className="login-button" 
          type="submit" 
          disabled={loading}
        >
          {loading ? <div className="login-spinner"></div> : "Login"}
        </button>

        <p className="login-forgot">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>

        <p className="login-register">
          Don’t have an account?{" "}
          <Link to="/register">Register</Link>
        </p>

      </form>
    </div>
  )
}

export default Login







// import axios from "axios"
// import { useState } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import "./App.css"

// function Login() {

//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [error, setError] = useState("")

//   const navigate = useNavigate()

//   const login = async (e) => {
//     e.preventDefault()
//     setError("")

//     if (!email || !password) {
//       setError("All fields are required")
//       return
//     }

//     try {
//       const res = await axios.post("http://159.65.94.152/api/login/", {
//         email,
//         password
//       })

//       // ✅ FIX: stringify object
//       localStorage.setItem("token", res.data.token)
//       localStorage.setItem("user", JSON.stringify(res.data.staff))

//       alert(res.data.message)
//       navigate("/dashboard")

//     } catch (err) {
//       console.log(err.response?.data) // 🔥 show real backend error
//       setError(err.response?.data?.message || "Login failed")
//     }
//   }

//   return (
//     <div className="container">
//       <form onSubmit={login} className="card">
//         <h2>Login</h2>

//         {error && <p style={{ color: "red" }}>{error}</p>}

//         <input
//           type="email"
//           placeholder="Email Address"
//           value={email}
//           onChange={(e)=>setEmail(e.target.value)}
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e)=>setPassword(e.target.value)}
//         />

//         <button type="submit">Login</button>

//         <p style={{ marginTop: "10px", textAlign: "right" }}>
//           <Link to="/forgot-password" style={{ fontSize: "12px" }}>
//             Forgot Password?
//           </Link>
//         </p>

//         <p style={{ marginTop: "15px", textAlign: "center" }}>
//           Don’t have an account?{" "}
//           <Link to="/register" style={{ color: "red", fontWeight: "bold" }}>
//             Register
//           </Link>
//         </p>
//       </form>
//     </div>
//   )
// }

// export default Login









// import axios from "axios"
// import { useState } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import "./App.css"

// function Login() {

//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [error, setError] = useState("")

//   // ✅ for redirect
//   const navigate = useNavigate()

//   const login = async (e: any) => {
//     e.preventDefault()
//     setError("")

//     // ✅ validation
//     if (!email || !password) {
//       setError("All fields are required")
//       return
//     }

//     try {
//       const res = await axios.post("http://159.65.94.152/api/login/", {
//         email,
//         password
//       })

//       // ✅ SAVE TOKEN
//       localStorage.setItem("token", res.data.token)

//       // ✅ SAVE USER NAME (optional)
//       localStorage.setItem("user", res.data.staff)

//       // ✅ SUCCESS MESSAGE
//       alert(res.data.message)

//       // ✅ REDIRECT TO DASHBOARD
//       navigate("/dashboard")

//     } catch (err) {
//       setError("Invalid email or password")
//     }
//   }

//   return (
//     <div className="container">

//       <form onSubmit={login} className="card">

//         <h2>Login</h2>

//         {/* ERROR */}
//         {error && <p style={{ color: "red" }}>{error}</p>}

//         {/* EMAIL */}
//         <input
//           type="email"
//           placeholder="Email Address"
//           value={email}
//           onChange={(e)=>setEmail(e.target.value)}
//         />

//         {/* PASSWORD */}
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e)=>setPassword(e.target.value)}
//         />

//         <button type="submit">Login</button>

//         {/* FORGOT PASSWORD */}
//         <p style={{ marginTop: "10px", textAlign: "right" }}>
//           <Link to="/forgot-password" style={{ fontSize: "12px" }}>
//             Forgot Password?
//           </Link>
//         </p>

//         {/* REGISTER */}
//         <p style={{ marginTop: "15px", textAlign: "center" }}>
//           Don’t have an account?{" "}
//           <Link to="/register" style={{ color: "red", fontWeight: "bold" }}>
//             Register
//           </Link>
//         </p>

//       </form>

//     </div>
//   )
// }

// export default Login