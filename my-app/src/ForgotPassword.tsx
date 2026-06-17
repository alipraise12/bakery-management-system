import { useState } from "react"
import "./ForgotPassword.css"

function ForgotPassword() {

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    setError("")
    setMessage("")

    if (!email) {
      setError("Email is required")
      return
    }

    try {
      setLoading(true)

      // 🔥 Simulate API call (replace with real backend later)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setMessage("Password reset link has been sent to your email")

    } catch (err) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-container">

      <form onSubmit={handleSubmit} className="forgot-card">

        <h2 className="forgot-title">Forgot Password</h2>

        {error && <p className="forgot-error">{error}</p>}
        {message && <p className="forgot-success">{message}</p>}

        <input
          className="forgot-input"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <button 
          className="forgot-button" 
          type="submit"
          disabled={loading}
        >
          {loading ? <div className="forgot-spinner"></div> : "Send Reset Link"}
        </button>

      </form>

    </div>
  )
}

export default ForgotPassword