import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./profile.css"

function Profile() {
  const navigate = useNavigate()

  const [user, setUser] = useState<any>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [picture, setPicture] = useState<any>(null)
  const [preview, setPreview] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")

    if (!storedUser) {
      navigate("/")
    } else {
      const parsed = JSON.parse(storedUser)

      setUser(parsed)

      setFirstName(parsed.first_name)
      setLastName(parsed.last_name)
      setPhone(parsed.phone || "")

      // ✅ FIXED PROFILE PICTURE
      setPreview(
        parsed.picture
          ? `http://159.65.94.152${parsed.picture}`
          : null
      )
    }
  }, [navigate])

  // =========================
  // UPDATE PROFILE
  // =========================
  const handleUpdate = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()

      formData.append("email", user.email)
      formData.append("first_name", firstName)
      formData.append("last_name", lastName)
      formData.append("phone", phone)

      if (picture) {
        formData.append("picture", picture)
      }

      const res = await axios.post(
        "http://159.65.94.152/api/profile/update/",
        formData
      )

      const updatedUser = res.data.data

      // keep QR code
      updatedUser.qr_code = user.qr_code

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      )

      setUser(updatedUser)

      // ✅ FIXED PROFILE IMAGE AFTER UPDATE
      if (updatedUser.picture) {
        setPreview(
          `http://159.65.94.152${updatedUser.picture}`
        )
      }

      alert("Profile updated successfully ✅")

    } catch (err) {
      console.log(err)
      alert("Update failed ❌")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="profile-container">

      <div className="profile-card">

        {/* BACK */}
        <div
          className="profile-back"
          onClick={() => navigate(-1)}
        >
          ←
        </div>

        <h2 className="profile-title">
          My Profile
        </h2>

        {/* ========================= */}
        {/* PROFILE IMAGE */}
        {/* ========================= */}
        <div className="profile-image-section">

          <div className="profile-avatar">
            {preview ? (
              <img
                src={preview}
                alt="profile"
              />
            ) : (
              <span>No Photo</span>
            )}
          </div>

          <input
            type="file"
            className="profile-file"
            onChange={(e: any) => {
              const file = e.target.files?.[0]

              if (file) {
                setPicture(file)

                // local preview before upload
                setPreview(
                  URL.createObjectURL(file)
                )
              }
            }}
          />

        </div>

        {/* ========================= */}
        {/* FORM */}
        {/* ========================= */}
        <form onSubmit={handleUpdate}>

          <input
            className="profile-input"
            type="text"
            value={firstName}
            onChange={(e) =>
              setFirstName(e.target.value)
            }
            placeholder="First Name"
          />

          <input
            className="profile-input"
            type="text"
            value={lastName}
            onChange={(e) =>
              setLastName(e.target.value)
            }
            placeholder="Last Name"
          />

          <input
            className="profile-input"
            type="text"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            placeholder="Phone"
          />

          <input
            className="profile-input"
            type="email"
            value={user.email}
            disabled
          />

          <input
            className="profile-input"
            type="text"
            value={user.position || "Staff"}
            disabled
          />

          <button
            className="profile-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Update Profile"}
          </button>

        </form>

        {/* ========================= */}
        {/* QR CODE */}
        {/* ========================= */}
        {user.qr_code && (
          <div className="qr-section">

            <h3 className="qr-title">
              Your QR Code
            </h3>

            <div className="qr-image-box">

              {/* FIXED QR IMAGE */}
              <img
                src={`http://159.65.94.152${user.qr_code}`}
                alt="QR Code"
              />

            </div>

           <button
  className="qr-download"
  onClick={() => {
    window.open(
      `http://159.65.94.152/api/download-qr/${
        user.qr_code.split("/").pop()
      }`,
      "_self"
    )
  }}
>
  Download QR
</button>
          </div>
        )}

      </div>
    </div>
  )
}

export default Profile


// import { useEffect, useState } from "react"
// import { useNavigate } from "react-router-dom"
// import axios from "axios"
// import "./profile.css"

// function Profile() {
//   const navigate = useNavigate()

//   const [user, setUser] = useState(null)
//   const [firstName, setFirstName] = useState("")
//   const [lastName, setLastName] = useState("")
//   const [phone, setPhone] = useState("")
//   const [picture, setPicture] = useState(null)
//   const [preview, setPreview] = useState(null)
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user")

//     if (!storedUser) {
//       navigate("/")
//     } else {
//       const parsed = JSON.parse(storedUser)
//       setUser(parsed)

//       setFirstName(parsed.first_name)
//       setLastName(parsed.last_name)
//       setPhone(parsed.phone || "")

//       setPreview(
//         parsed.picture
//           ? `${parsed.picture}`
//           : null
//       )
//     }
//   }, [navigate])

//   // ✅ UPDATE PROFILE
//   const handleUpdate = async (e) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       const formData = new FormData()

//       formData.append("email", user.email)
//       formData.append("first_name", firstName)
//       formData.append("last_name", lastName)
//       formData.append("phone", phone)

//       if (picture) {
//         formData.append("picture", picture)
//       }

//       const res = await axios.post(
//       "http://159.65.94.152/api/profile/update/",
//         formData
//     )

//       const updatedUser = res.data.data

//       // ✅ KEEP QR CODE
//       updatedUser.qr_code = user.qr_code

//       localStorage.setItem("user", JSON.stringify(updatedUser))
//       setUser(updatedUser)

//       if (updatedUser.picture) {
//         setPreview(`${updatedUser.picture}`)
//       }

//       alert("Profile updated successfully ✅")

//     } catch (err) {
//       console.log(err)
//       alert("Update failed ❌")
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!user) return null

//   return (
//     <div className="profile-container">

//       <div className="profile-card">

//         {/* 🔙 BACK */}
//         <div className="profile-back" onClick={() => navigate(-1)}>
//           ←
//         </div>

//         <h2 className="profile-title">My Profile</h2>

//         {/* 👤 IMAGE */}
//         <div className="profile-image-section">
//           <div className="profile-avatar">
//             {preview ? (
//               <img src={preview} alt="profile" />
//             ) : (
//               <span>No Photo</span>
//             )}
//           </div>

//           <input
//             type="file"
//             className="profile-file"
//             onChange={(e) => {
//               const file = e.target.files?.[0]
//               if (file) {
//                 setPicture(file)
//                 setPreview(URL.createObjectURL(file))
//               }
//             }}
//           />
//         </div>

//         {/* 📝 FORM */}
//         <form onSubmit={handleUpdate}>

//           <input
//             className="profile-input"
//             type="text"
//             value={firstName}
//             onChange={(e)=>setFirstName(e.target.value)}
//             placeholder="First Name"
//           />

//           <input
//             className="profile-input"
//             type="text"
//             value={lastName}
//             onChange={(e)=>setLastName(e.target.value)}
//             placeholder="Last Name"
//           />

//           <input
//             className="profile-input"
//             type="text"
//             value={phone}
//             onChange={(e)=>setPhone(e.target.value)}
//             placeholder="Phone"
//           />

//           <input
//             className="profile-input"
//             type="email"
//             value={user.email}
//             disabled
//           />

//           <input
//             className="profile-input"
//             type="text"
//             value={user.position || "Staff"}
//             disabled
//           />

//           <button 
//             className="profile-button" 
//             type="submit" 
//             disabled={loading}
//           >
//             {loading ? "Updating..." : "Update Profile"}
//           </button>

//         </form>

//         {/* ========================= */}
//         {/* ✅ QR CODE SECTION */}
//         {/* ========================= */}
//         {user.qr_code && (
//           <div className="qr-section">

//             <h3 className="qr-title">Your QR Code</h3>

//             <div className="qr-image-box">
//               <img
//                 src={`http://159.65.94.152${user.qr_code}`}
//                 alt="QR Code"
//               />
//             </div>

//             <button
//               className="qr-download"
//               onClick={() => {
//                 const link = document.createElement("a")

//                 link.href = `http://159.65.94.152${user.qr_code}`
//                 link.download = `QR_${user.first_name}.png`

//                 document.body.appendChild(link)
//                 link.click()
//                 link.remove()
//               }}   
                         
//             >
//               Download QR
//             </button>

//           </div>
//         )}

//       </div>
//     </div>
//   )
// }

// export default Profile






// import { useEffect, useState } from "react"
// import { useNavigate } from "react-router-dom"
// import axios from "axios"
// import "./profile.css"

// function Profile() {
//   const navigate = useNavigate()

//   const [user, setUser] = useState(null)
//   const [firstName, setFirstName] = useState("")
//   const [lastName, setLastName] = useState("")
//   const [phone, setPhone] = useState("")
//   const [picture, setPicture] = useState(null)
//   const [preview, setPreview] = useState(null)
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user")

//     if (!storedUser) {
//       navigate("/")
//     } else {
//       const parsed = JSON.parse(storedUser)
//       setUser(parsed)

//       setFirstName(parsed.first_name)
//       setLastName(parsed.last_name)
//       setPhone(parsed.phone || "")

//       setPreview(
//         parsed.picture
//           ? `http://159.65.94.152${parsed.picture}`
//           : null
//       )
//     }
//   }, [navigate])

//   // ✅ UPDATE PROFILE
//   const handleUpdate = async (e) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       const formData = new FormData()

//       formData.append("email", user.email)
//       formData.append("first_name", firstName)
//       formData.append("last_name", lastName)
//       formData.append("phone", phone)

//       if (picture) {
//         formData.append("picture", picture)
//       }

//       const res = await axios.post(
//         "http://159.65.94.152/api/profile/update/",
//         formData
//       )

//       const updatedUser = res.data.data

//       // ✅ KEEP QR CODE
//       updatedUser.qr_code = user.qr_code

//       localStorage.setItem("user", JSON.stringify(updatedUser))
//       setUser(updatedUser)

//       if (updatedUser.picture) {
//         setPreview(`http://159.65.94.152${updatedUser.picture}`)
//       }

//       alert("Profile updated successfully ✅")

//     } catch (err) {
//       console.log(err)
//       alert("Update failed ❌")
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!user) return null

//   return (
//     <div className="profile-container">

//       <div className="profile-card">

//         {/* 🔙 BACK */}
//         <div className="profile-back" onClick={() => navigate(-1)}>
//           ←
//         </div>

//         <h2 className="profile-title">My Profile</h2>

//         {/* 👤 IMAGE */}
//         <div className="profile-image-section">

//           <div className="profile-avatar">
//             {preview ? (
//               <img src={preview} alt="profile" />
//             ) : (
//               <span>No Photo</span>
//             )}
//           </div>

//           <input
//             type="file"
//             className="profile-file"
//             onChange={(e) => {
//               const file = e.target.files?.[0]
//               if (file) {
//                 setPicture(file)
//                 setPreview(URL.createObjectURL(file))
//               }
//             }}
//           />
//         </div>

//         {/* 📝 FORM */}
//         <form onSubmit={handleUpdate}>

//           <input
//             className="profile-input"
//             type="text"
//             value={firstName}
//             onChange={(e)=>setFirstName(e.target.value)}
//             placeholder="First Name"
//           />

//           <input
//             className="profile-input"
//             type="text"
//             value={lastName}
//             onChange={(e)=>setLastName(e.target.value)}
//             placeholder="Last Name"
//           />

//           <input
//             className="profile-input"
//             type="text"
//             value={phone}
//             onChange={(e)=>setPhone(e.target.value)}
//             placeholder="Phone"
//           />

//           <input
//             className="profile-input"
//             type="email"
//             value={user.email}
//             disabled
//           />

//           <input
//             className="profile-input"
//             type="text"
//             value={user.position || "Staff"}
//             disabled
//           />

//           <button 
//             className="profile-button" 
//             type="submit" 
//             disabled={loading}
//           >
//             {loading ? "Updating..." : "Update Profile"}
//           </button>

//         </form>

//         {/* ========================= */}
//         {/* ✅ QR CODE SECTION */}
//         {/* ========================= */}
//         {user.qr_code && (
//           <div className="qr-section">
//             <h3>Your QR Code</h3>

//             <img
//               src={`http://159.65.94.152${user.qr_code}`}
//               alt="QR Code"
//             />

//             {/* ✅ FIXED DOWNLOAD */}
//             <a
//               href={`http://159.65.94.152${user.qr_code}`}
//               className="qr-download"
//               onClick={(e) => {
//                 e.preventDefault()

//                 fetch(`http://159.65.94.152${user.qr_code}`)
//                   .then(res => res.blob())
//                   .then(blob => {
//                     const url = window.URL.createObjectURL(blob)
//                     const a = document.createElement("a")
//                     a.href = url
//                     a.download = `QR_${user.first_name}.png`
//                     document.body.appendChild(a)
//                     a.click()
//                     a.remove()
//                   })
//               }}
//             >
//               Download QR
//             </a>

//           </div>
//         )}

//       </div>
//     </div>
//   )
// }

// export default Profile










// import { useEffect, useState } from "react"
// import { useNavigate } from "react-router-dom"
// import axios from "axios"
// import "./profile.css"

// function Profile() {
//   const navigate = useNavigate()

//   const [user, setUser] = useState(null)
//   const [firstName, setFirstName] = useState("")
//   const [lastName, setLastName] = useState("")
//   const [phone, setPhone] = useState("")
//   const [picture, setPicture] = useState(null)
//   const [preview, setPreview] = useState(null)
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user")

//     if (!storedUser) {
//       navigate("/")
//     } else {
//       const parsed = JSON.parse(storedUser)
//       setUser(parsed)

//       setFirstName(parsed.first_name)
//       setLastName(parsed.last_name)
//       setPhone(parsed.phone || "")

//       setPreview(
//         parsed.picture
//           ? `http://159.65.94.152${parsed.picture}`
//           : null
//       )
//     }
//   }, [navigate])

//   // ✅ UPDATE PROFILE
//   const handleUpdate = async (e) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       const formData = new FormData()

//       formData.append("email", user.email)
//       formData.append("first_name", firstName)
//       formData.append("last_name", lastName)
//       formData.append("phone", phone)

//       if (picture) {
//         formData.append("picture", picture)
//       }

//       const res = await axios.post(
//         "http://159.65.94.152/api/profile/update/",
//         formData
//       )

//       const updatedUser = res.data.data

//       // ✅ KEEP QR CODE (VERY IMPORTANT)
//       updatedUser.qr_code = user.qr_code

//       // ✅ Update localStorage
//       localStorage.setItem("user", JSON.stringify(updatedUser))

//       // ✅ Update UI
//       setUser(updatedUser)

//       // ✅ Update preview
//       if (updatedUser.picture) {
//         setPreview(`http://159.65.94.152${updatedUser.picture}`)
//       }

//       alert("Profile updated successfully ✅")

//     } catch (err) {
//       console.log(err)
//       alert("Update failed ❌")
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!user) return null

//   return (
//     <div className="profile-container">

//       <div className="profile-card">

//         {/* 🔙 BACK */}
//         <div className="profile-back" onClick={() => navigate(-1)}>
//           ←
//         </div>

//         <h2 className="profile-title">My Profile</h2>

//         {/* 👤 IMAGE */}
//         <div className="profile-image-section">

//           <div className="profile-avatar">
//             {preview ? (
//               <img src={preview} alt="profile" />
//             ) : (
//               <span>No Photo</span>
//             )}
//           </div>

//           <input
//             type="file"
//             className="profile-file"
//             onChange={(e) => {
//               const file = e.target.files?.[0]
//               if (file) {
//                 setPicture(file)
//                 setPreview(URL.createObjectURL(file))
//               }
//             }}
//           />
//         </div>

//         {/* 📝 FORM */}
//         <form onSubmit={handleUpdate}>

//           <input
//             className="profile-input"
//             type="text"
//             value={firstName}
//             onChange={(e)=>setFirstName(e.target.value)}
//             placeholder="First Name"
//           />

//           <input
//             className="profile-input"
//             type="text"
//             value={lastName}
//             onChange={(e)=>setLastName(e.target.value)}
//             placeholder="Last Name"
//           />

//           <input
//             className="profile-input"
//             type="text"
//             value={phone}
//             onChange={(e)=>setPhone(e.target.value)}
//             placeholder="Phone"
//           />

//           <input
//             className="profile-input"
//             type="email"
//             value={user.email}
//             disabled
//           />

//           <input
//             className="profile-input"
//             type="text"
//             value={user.position || "Staff"}
//             disabled
//           />

//           <button 
//             className="profile-button" 
//             type="submit" 
//             disabled={loading}
//           >
//             {loading ? "Updating..." : "Update Profile"}
//           </button>

//         </form>

//         {/* ========================= */}
//         {/* ✅ QR CODE SECTION */}
//         {/* ========================= */}
//         {user.qr_code && (
//           <div style={{ textAlign: "center", marginTop: "30px" }}>
//             <h3>Your QR Code</h3>

//             <img
//               src={`http://159.65.94.152${user.qr_code}`}
//               alt="QR Code"
//               style={{
//                 width: "180px",
//                 height: "180px",
//                 border: "2px solid #333",
//                 borderRadius: "10px",
//                 padding: "10px"
//               }}
//             />

//             {/* OPTIONAL DOWNLOAD */}
//             <div style={{ marginTop: "10px" }}>
//               <a
//                 href={`http://159.65.94.152${user.qr_code}`}
//                 download
//                 style={{
//                   textDecoration: "none",
//                   color: "#fff",
//                   background: "#333",
//                   padding: "8px 15px",
//                   borderRadius: "6px"
//                 }}
//               >
//                 Download QR
//               </a>
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   )
// }

// export default Profile










// import { useEffect, useState } from "react"
// import { useNavigate } from "react-router-dom"
// import axios from "axios" // ✅ IMPORTANT
// import "./profile.css"

// function Profile() {
//   const navigate = useNavigate()

//   const [user, setUser] = useState<any>(null)
//   const [firstName, setFirstName] = useState("")
//   const [lastName, setLastName] = useState("")
//   const [phone, setPhone] = useState("")
//   const [picture, setPicture] = useState<any>(null)
//   const [preview, setPreview] = useState<any>(null)
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user")

//     if (!storedUser) {
//       navigate("/")
//     } else {
//       const parsed = JSON.parse(storedUser)
//       setUser(parsed)

//       setFirstName(parsed.first_name)
//       setLastName(parsed.last_name)
//       setPhone(parsed.phone || "")
//       setPreview(
//         parsed.picture
//           ? `http://159.65.94.152${parsed.picture}`
//           : null
//       )
//     }
//   }, [navigate])

//   // ✅ UPDATED HANDLE UPDATE (CONNECTED TO BACKEND)
//   const handleUpdate = async (e: any) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       const formData = new FormData()

//       formData.append("email", user.email)
//       formData.append("first_name", firstName)
//       formData.append("last_name", lastName)
//       formData.append("phone", phone)

//       if (picture) {
//         formData.append("picture", picture)
//       }

//       const res = await axios.post(
//         "http://159.65.94.152/api/profile/update/",
//         formData
//       )

//       const updatedUser = res.data.data

//       // ✅ Update localStorage
//       localStorage.setItem("user", JSON.stringify(updatedUser))

//       // ✅ Update UI
//       setUser(updatedUser)

//       // ✅ Update preview image
//       if (updatedUser.picture) {
//         setPreview(`http://159.65.94.152${updatedUser.picture}`)
//       }

//       alert("Profile updated successfully ✅")

//     } catch (err) {
//       console.log(err)
//       alert("Update failed ❌")
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!user) return null

//   return (
//     <div className="profile-container">

//       <div className="profile-card">

//         {/* BACK */}
//         <div className="profile-back" onClick={() => navigate(-1)}>
//           ←
//         </div>

//         <h2 className="profile-title">My Profile</h2>

//         {/* IMAGE */}
//         <div className="profile-image-section">

//           <div className="profile-avatar">
//             {preview ? (
//               <img src={preview} alt="profile" />
//             ) : (
//               <span>No Photo</span>
//             )}
//           </div>

//           <input
//             type="file"
//             className="profile-file"
//             onChange={(e) => {
//               const file = e.target.files?.[0]
//               if (file) {
//                 setPicture(file)
//                 setPreview(URL.createObjectURL(file))
//               }
//             }}
//           />
//         </div>

//         {/* FORM */}
//         <form onSubmit={handleUpdate}>

//           <input
//             className="profile-input"
//             type="text"
//             value={firstName}
//             onChange={(e)=>setFirstName(e.target.value)}
//             placeholder="First Name"
//           />

//           <input
//             className="profile-input"
//             type="text"
//             value={lastName}
//             onChange={(e)=>setLastName(e.target.value)}
//             placeholder="Last Name"
//           />

//           <input
//             className="profile-input"
//             type="text"
//             value={phone}
//             onChange={(e)=>setPhone(e.target.value)}
//             placeholder="Phone"
//           />

//           <input
//             className="profile-input"
//             type="email"
//             value={user.email}
//             disabled
//           />

//           <input
//             className="profile-input"
//             type="text"
//             value={user.position || "Staff"}
//             disabled
//           />

//           <button 
//             className="profile-button" 
//             type="submit" 
//             disabled={loading}
//           >
//             {loading ? "Updating..." : "Update Profile"}
//           </button>

//         </form>

//       </div>
//     </div>
//   )
// }

// export default Profile









// import { useEffect, useState } from "react"
// import { useNavigate } from "react-router-dom"
// import "./Profile.css"

// function Profile() {
//   const navigate = useNavigate()

//   const [user, setUser] = useState<any>(null)
//   const [firstName, setFirstName] = useState("")
//   const [lastName, setLastName] = useState("")
//   const [phone, setPhone] = useState("")
//   const [picture, setPicture] = useState<any>(null)
//   const [preview, setPreview] = useState<any>(null)
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user")

//     if (!storedUser) {
//       navigate("/")
//     } else {
//       const parsed = JSON.parse(storedUser)
//       setUser(parsed)

//       setFirstName(parsed.first_name)
//       setLastName(parsed.last_name)
//       setPhone(parsed.phone || "")
//       setPreview(
//         parsed.picture
//           ? `http://159.65.94.152${parsed.picture}`
//           : null
//       )
//     }
//   }, [navigate])

//   const handleUpdate = (e: any) => {
//     e.preventDefault()
//     setLoading(true)

//     // 🚧 BACKEND UPDATE COMING NEXT
//     setTimeout(() => {
//       const updatedUser = {
//         ...user,
//         first_name: firstName,
//         last_name: lastName,
//         phone: phone
//       }

//       localStorage.setItem("user", JSON.stringify(updatedUser))
//       setUser(updatedUser)

//       alert("Profile updated ✅")
//       setLoading(false)
//     }, 1000)
//   }

//   if (!user) return null

//   return (
//     <div className="profile-container">

//       <div className="profile-card">

//         {/* BACK */}
//         <div className="profile-back" onClick={() => navigate(-1)}>
//           ←
//         </div>

//         <h2 className="profile-title">My Profile</h2>

//         {/* IMAGE */}
//         <div className="profile-image-section">

//           <div className="profile-avatar">
//             {preview ? (
//               <img src={preview} alt="profile" />
//             ) : (
//               <span>No Photo</span>
//             )}
//           </div>

//           <input
//             type="file"
//             className="profile-file"
//             onChange={(e) => {
//               const file = e.target.files?.[0]
//               if (file) {
//                 setPicture(file)
//                 setPreview(URL.createObjectURL(file))
//               }
//             }}
//           />
//         </div>

//         {/* FORM */}
//         <form onSubmit={handleUpdate}>

//           <input
//             className="profile-input"
//             type="text"
//             value={firstName}
//             onChange={(e)=>setFirstName(e.target.value)}
//             placeholder="First Name"
//           />

//           <input
//             className="profile-input"
//             type="text"
//             value={lastName}
//             onChange={(e)=>setLastName(e.target.value)}
//             placeholder="Last Name"
//           />

//           <input
//             className="profile-input"
//             type="text"
//             value={phone}
//             onChange={(e)=>setPhone(e.target.value)}
//             placeholder="Phone"
//           />

//           <input
//             className="profile-input"
//             type="email"
//             value={user.email}
//             disabled
//           />

//           <input
//             className="profile-input"
//             type="text"
//             value={user.position || "Staff"}
//             disabled
//           />

//           <button className="profile-button" type="submit" disabled={loading}>
//             {loading ? "Updating..." : "Update Profile"}
//           </button>

//         </form>

//       </div>
//     </div>
//   )
// }

// export default Profile