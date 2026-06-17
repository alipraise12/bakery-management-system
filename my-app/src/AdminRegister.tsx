import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./AdminRegister.css"

function AdminRegister() {

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [position, setPosition] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [picture, setPicture] = useState<any>(null)
  const [preview, setPreview] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setError("")

    if (!firstName || !lastName || !phone || !email || !position || !picture || !password || !confirmPassword) {
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

      formData.append("first_name", firstName)
      formData.append("last_name", lastName)
      formData.append("phone", phone)
      formData.append("email", email)
      formData.append("position", position)
      formData.append("password", password)
      formData.append("picture", picture)

      await axios.post(
        "http://127.0.0.1:8000/api/admin/register/",
        formData
      )

      alert("Admin Registered Successfully ✅")
      navigate("/")

    } catch (err: any) {
      console.log(err.response?.data)
      setError(err.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-container">

      <div className="admin-card">

        {/* BACK BUTTON */}
        <div className="admin-back" onClick={() => navigate(-1)}>
          ←
        </div>

        <h2>Admin Registration</h2>

        {error && <p className="admin-error">{error}</p>}

        {/* IMAGE */}
        <div className="admin-image-section">

          <div className="admin-avatar">
            {preview ? (
              <img src={preview} alt="preview" />
            ) : (
              <span>No Photo</span>
            )}
          </div>

          <input
            type="file"
            className="admin-file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setPicture(file)
                setPreview(URL.createObjectURL(file))
              }
            }}
          />
        </div>

        <form onSubmit={handleSubmit}>

          {/* POSITION */}
          <select
            className="admin-select"
            value={position}
            onChange={(e)=>setPosition(e.target.value)}
          >
            <option value="">Select Position</option>
            <option value="Director">Director</option>
            <option value="Manager">Manager</option>
            <option value="Cashier">Cashier</option>
            <option value="Accountant">Accountant</option>
          </select>

          {/* INPUTS */}
          <input
            className="admin-input"
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e)=>setFirstName(e.target.value)}
          />

          <input
            className="admin-input"
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e)=>setLastName(e.target.value)}
          />

          <input
            className="admin-input"
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e)=>setPhone(e.target.value)}
          />

          <input
            className="admin-input"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          {/* PASSWORD */}
          <div className="admin-password-wrapper">
            <input
              className="admin-input"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />
            <span 
              className="admin-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              👁
            </span>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="admin-password-wrapper">
            <input
              className="admin-input"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e)=>setConfirmPassword(e.target.value)}
            />
            <span 
              className="admin-eye"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              👁
            </span>
          </div>

          {/* SUBMIT */}
          <button 
            className="admin-button" 
            type="submit"
            disabled={loading}
          >
            {loading ? <div className="admin-spinner"></div> : "Submit"}
          </button>

        </form>

      </div>
    </div>
  )
}

export default AdminRegister