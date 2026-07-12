import { Scanner } from "@yudiel/react-qr-scanner";
import { useState, useEffect } from "react";
import axios from "axios";
import "./ScannerQR.css";
import API_URL from "./api";

function ScanQR() {

  // ===========================
  // STATES
  // ===========================

  const [result, setResult] = useState<any>(null);

  const [records, setRecords] = useState<any[]>([]);

  const [scanning, setScanning] = useState(true);

  const [cooldown, setCooldown] = useState(false);

  const [flash, setFlash] = useState(false);

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  // ===========================
  // BEEP SOUND
  // ===========================

  const playBeep = () => {

    const audio = new Audio(
      "https://www.soundjay.com/buttons/sounds/beep-07.mp3"
    );

    audio.play();

  };

  // ===========================
  // FETCH ATTENDANCE
  // ===========================

  const fetchAttendance = async () => {

    try {

      const res = await axios.get(
        `${API_URL}/api/attendance/`
      );

      setRecords(res.data);

    } catch (err) {

      console.log(err);

    }

  };

  useEffect(() => {

    fetchAttendance();

  }, []);

  // ===========================
  // COOLDOWN
  // ===========================

  const startCooldown = () => {

    setCooldown(true);

    setTimeout(() => {

      setCooldown(false);

    }, 5000);

  };

  // ===========================
  // PAGE
  // ===========================

  return (

        <div className="attendance-page">

      {/* ===========================
          SUCCESS FLASH
      =========================== */}

      {flash && (
        <div className="success-flash"></div>
      )}

      {/* ===========================
          PAGE HEADER
      =========================== */}

      <div className="attendance-header">

        <div>

          <h1 className="attendance-title">

            Attendance Scanner

          </h1>

          <p className="attendance-subtitle">

            Scan staff QR codes to record daily attendance.

          </p>

        </div>

        <div className="attendance-date">

          <span>

            {new Date().toLocaleDateString()}

          </span>

        </div>

      </div>

      {/* ===========================
          TOP SECTION
      =========================== */}

      <div className="attendance-top">

        {/* ===========================
            SCANNER CARD
        =========================== */}

        <div className="scanner-card">

          <h2 className="card-title">

            QR Scanner

          </h2>

          <div className="scanner-box">

            {scanning && (

              <Scanner

                onScan={(data) => {

                  if (
                    data &&
                    data.length > 0 &&
                    !cooldown
                  ) {

                    setScanning(false);

                    startCooldown();

                    axios.post(
                       `${API_URL}/api/scan/`,
                      {

                        token:
                          data[0].rawValue,

                        email:
                          user?.email,

                      }

                    )

                    .then((res) => {

                      setResult(res.data);

                      fetchAttendance();

                      playBeep();

                      setFlash(true);

                      setTimeout(() => {

                        setFlash(false);

                      }, 500);

                    })

                    .catch((err) => {

                      console.log(err);

                      alert("Scan failed");

                      setScanning(true);

                    });

                  }

                }}

              />

            )}

          </div>

        </div>

                {/* ===========================
            RESULT CARD
        =========================== */}

        <div className="result-card">

          <h2 className="card-title">

            Attendance Result

          </h2>

          {result ? (

            <>

              <div className="success-icon">

                ✅

              </div>

              <div className="result-row">

                <span>Name</span>

                <strong>{result.name}</strong>

              </div>

              <div className="result-row">

                <span>Phone</span>

                <strong>{result.phone}</strong>

              </div>

              {result.time_in && (

                <div className="result-row">

                  <span>Time In</span>

                  <strong>

                    {result.time_in}

                  </strong>

                </div>

              )}

              {result.time_out && (

                <div className="result-row">

                  <span>Time Out</span>

                  <strong>

                    {result.time_out}

                  </strong>

                </div>

              )}

              <div className="result-row">

                <span>Status</span>

                <strong className="status-success">

                  {result.status}

                </strong>

              </div>

              <button

                className="scan-again-btn"

                onClick={() => {

                  setResult(null);

                  setScanning(true);

                }}

              >

                🔄 Scan Another

              </button>

            </>

          ) : (

            <div className="waiting-card">

              <div className="waiting-icon">

                📷

              </div>

              <p>

                Waiting for a QR Code...

              </p>

            </div>

          )}

        </div>

      </div>

            {/* ===========================
          ATTENDANCE TABLE
      =========================== */}

      <div className="attendance-table-card">

        <div className="table-header">

          <h2>

            Today's Attendance

          </h2>

          <span className="table-date">

            {new Date().toLocaleDateString()}

          </span>

        </div>

        <div className="table-wrapper">

          <table className="attendance-table">

            <thead>

              <tr>

                <th>S/N</th>

                <th>Name</th>

                <th>Phone</th>

                <th>Time In</th>

                <th>Time Out</th>

              </tr>

            </thead>

            <tbody>

              {records.length > 0 ? (

                records.map((record, index) => (

                  <tr key={index}>

                    <td>

                      {index + 1}

                    </td>

                    <td>

                      {record.name}

                    </td>

                    <td>

                      {record.phone}

                    </td>

                    <td>

                      {record.time_in || "--"}

                    </td>

                    <td>

                      {record.time_out || "--"}

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan={5}
                    className="no-records"
                  >

                    No attendance records for today.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}

export default ScanQR;



















// import { Scanner } from '@yudiel/react-qr-scanner';
// import { useState, useEffect } from 'react';
// import axios from 'axios';


// function ScanQR() {
//   const [result, setResult] = useState(null);
//   const [records, setRecords] = useState([]);
//   const [scanning, setScanning] = useState(true);
//   const [cooldown, setCooldown] = useState(false);
//   const [flash, setFlash] = useState(false);

//   const user = JSON.parse(localStorage.getItem("user"));

//   // 🔊 Beep sound
//   const playBeep = () => {
//     const audio = new Audio("https://www.soundjay.com/buttons/sounds/beep-07.mp3");
//     audio.play();
//   };

//   // ✅ FETCH ATTENDANCE
//   const fetchAttendance = async () => {
//     try {
//       const res = await axios.get("http://159.65.94.152/api/attendance/");
//       setRecords(res.data);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     fetchAttendance();
//   }, []);

//   // ⏱ Cooldown logic (5 seconds)
//   const startCooldown = () => {
//     setCooldown(true);
//     setTimeout(() => {
//       setCooldown(false);
//     }, 5000);
//   };

//   return (
//     <div style={{ padding: "20px" }}>

//       {/* 🟢 SUCCESS FLASH */}
//       {flash && (
//         <div style={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           backgroundColor: "rgba(0,255,0,0.2)",
//           zIndex: 999
//         }} />
//       )}

//       {/* 🔷 TITLE */}
//       <h2 style={{ textAlign: "center" }}>Scan QR</h2>

//       {/* 📷 SCANNER */}
//       {scanning && (
//         <div style={{
//           width: "320px",
//           height: "320px",
//           margin: "20px auto",
//           borderRadius: "12px",
//           overflow: "hidden",
//           border: "2px solid #333",
//           boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
//         }}>
//           <Scanner
//             onScan={(data) => {
//               if (data && data.length > 0 && !cooldown) {
//                 setScanning(false);
//                 startCooldown();

//                 axios.post("http://159.65.94.152/api/scan/", {
//                   token: data[0].rawValue,
//                   email: user?.email
//                 })
//                 .then(res => {
//                   setResult(res.data);
//                   fetchAttendance();

//                   // 🔊 beep
//                   playBeep();

//                   // 🟢 flash
//                   setFlash(true);
//                   setTimeout(() => setFlash(false), 500);
//                 })
//                 .catch(err => {
//                   console.log(err);
//                   alert("Scan failed");
//                   setScanning(true);
//                 });
//               }
//             }}
//           />
//         </div>
//       )}

//       {/* ✅ RESULT */}
//       {result && (
//         <div style={{ textAlign: "center", marginTop: "20px" }}>
//           <h3 style={{ color: "green" }}>✅ Attendance Recorded</h3>

//           <p><b>Name:</b> {result.name}</p>
//           <p><b>Phone:</b> {result.phone}</p>

//           {result.time_in && (
//             <p><b>Time In:</b> {result.time_in}</p>
//           )}

//           {result.time_out && (
//             <p><b>Time Out:</b> {result.time_out}</p>
//           )}

//           <p><b>Status:</b> {result.status}</p>

//           <button
//             style={{
//               marginTop: "10px",
//               padding: "10px 20px",
//               border: "none",
//               backgroundColor: "#333",
//               color: "#fff",
//               borderRadius: "6px",
//               cursor: "pointer"
//             }}
//             onClick={() => {
//               setResult(null);
//               setScanning(true);
//             }}
//           >
//             Scan Another
//           </button>
//         </div>
//       )}

//       {/* 📋 TABLE SECTION */}
//       <div style={{ marginTop: "40px" }}>
        
//         {/* ✅ DATE NOW CORRECTLY HERE */}
//         <h3 style={{ textAlign: "center" }}>
//           Attendance - {new Date().toLocaleDateString()}
//         </h3>

//         <div style={{ overflowX: "auto" }}>
//           <table
//             border="1"
//             cellPadding="10"
//             style={{
//               width: "100%",
//               marginTop: "10px",
//               borderCollapse: "collapse",
//               textAlign: "center"
//             }}
//           >
//             <thead style={{ backgroundColor: "#f2f2f2" }}>
//               <tr>
//                 <th>Name</th>
//                 <th>Phone</th>
//                 <th>Time In</th>
//                 <th>Time Out</th>
//               </tr>
//             </thead>

//             <tbody>
//               {records.map((r, index) => (
//                 <tr key={index}>
//                   <td>{r.name}</td>
//                   <td>{r.phone}</td>
//                   <td>{r.time_in || "-"}</td>
//                   <td>{r.time_out || "-"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//       </div>

//     </div>
//   );
// }

// export default ScanQR;














// import { Scanner } from '@yudiel/react-qr-scanner';
// import { useState, useEffect } from 'react';
// import axios from 'axios';

// function ScanQR() {
//   const [result, setResult] = useState(null);
//   const [records, setRecords] = useState([]);
//   const [scanning, setScanning] = useState(true);
//   const [cooldown, setCooldown] = useState(false);
//   const [flash, setFlash] = useState(false);

//   const user = JSON.parse(localStorage.getItem("user"));

//   // 🔊 Beep sound
//   const playBeep = () => {
//     const audio = new Audio("https://www.soundjay.com/buttons/sounds/beep-07.mp3");
//     audio.play();
//   };

//   // ✅ FETCH ATTENDANCE
//   const fetchAttendance = async () => {
//     try {
//       const res = await axios.get("http://159.65.94.152/api/attendance/");
//       setRecords(res.data);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     fetchAttendance();
//   }, []);

//   // ⏱ Cooldown logic (5 seconds)
//   const startCooldown = () => {
//     setCooldown(true);
//     setTimeout(() => {
//       setCooldown(false);
//     }, 5000);
//   };

//   return (
//     <div style={{ padding: "20px" }}>

//       {/* 🟢 SUCCESS FLASH */}
//       {flash && (
//         <div style={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           backgroundColor: "rgba(0,255,0,0.2)",
//           zIndex: 999
//         }} />
//       )}

//       {/* 🔷 TITLE */}
//       <h2 style={{ textAlign: "center" }}>Scan QR</h2>

//       {/* 📅 DATE */}
//       <h3 style={{ textAlign: "center" }}>
//         {new Date().toLocaleDateString()}
//       </h3>

//       {/* 📷 SCANNER */}
//       {scanning && (
//         <div style={{
//           width: "320px",
//           height: "320px",
//           margin: "20px auto",
//           borderRadius: "12px",
//           overflow: "hidden",
//           border: "2px solid #333",
//           boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
//         }}>
//           <Scanner
//             onScan={(data) => {
//               if (data && data.length > 0 && !cooldown) {
//                 setScanning(false);
//                 startCooldown();

//                 axios.post("http://159.65.94.152/api/scan/", {
//                   token: data[0].rawValue,
//                   email: user?.email
//                 })
//                 .then(res => {
//                   setResult(res.data);
//                   fetchAttendance();

//                   // 🔊 beep
//                   playBeep();

//                   // 🟢 flash
//                   setFlash(true);
//                   setTimeout(() => setFlash(false), 500);
//                 })
//                 .catch(err => {
//                   console.log(err);
//                   alert("Scan failed");
//                   setScanning(true);
//                 });
//               }
//             }}
//           />
//         </div>
//       )}

//       {/* ✅ RESULT */}
//       {result && (
//         <div style={{ textAlign: "center", marginTop: "20px" }}>
//           <h3 style={{ color: "green" }}>✅ Attendance Recorded</h3>

//           <p><b>Name:</b> {result.name}</p>
//           <p><b>Phone:</b> {result.phone}</p>

//           {result.time_in && (
//             <p><b>Time In:</b> {result.time_in}</p>
//           )}

//           {result.time_out && (
//             <p><b>Time Out:</b> {result.time_out}</p>
//           )}

//           <p><b>Status:</b> {result.status}</p>

//           <button
//             style={{
//               marginTop: "10px",
//               padding: "10px 20px",
//               border: "none",
//               backgroundColor: "#333",
//               color: "#fff",
//               borderRadius: "6px",
//               cursor: "pointer"
//             }}
//             onClick={() => {
//               setResult(null);
//               setScanning(true);
//             }}
//           >
//             Scan Another
//           </button>
//         </div>
//       )}

//       {/* 📋 TABLE */}
//       <h3 style={{ marginTop: "40px", textAlign: "center" }}>
//         Attendance List
//       </h3>

//       <div style={{ overflowX: "auto" }}>
//         <table
//           border="1"
//           cellPadding="10"
//           style={{
//             width: "100%",
//             marginTop: "10px",
//             borderCollapse: "collapse",
//             textAlign: "center"
//           }}
//         >
//           <thead style={{ backgroundColor: "#f2f2f2" }}>
//             <tr>
//               <th>Name</th>
//               <th>Phone</th>
//               <th>Time In</th>
//               <th>Time Out</th>
//             </tr>
//           </thead>

//           <tbody>
//             {records.map((r, index) => (
//               <tr key={index}>
//                 <td>{r.name}</td>
//                 <td>{r.phone}</td>
//                 <td>{r.time_in || "-"}</td>
//                 <td>{r.time_out || "-"}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//     </div>
//   );
// }

// export default ScanQR;













// import { Scanner } from '@yudiel/react-qr-scanner';
// import { useState, useEffect } from 'react';
// import axios from 'axios';

// function ScanQR() {
//   const [result, setResult] = useState(null);
//   const [records, setRecords] = useState([]);
//   const [scanning, setScanning] = useState(true);

//   // ✅ GET LOGGED-IN USER
//   const user = JSON.parse(localStorage.getItem("user"));

//   // ✅ FETCH ATTENDANCE LIST
//   const fetchAttendance = async () => {
//     try {
//       const res = await axios.get("http://159.65.94.152/api/attendance/");
//       setRecords(res.data);
//     } catch (err) {
//       console.log("Error fetching attendance", err);
//     }
//   };

//   useEffect(() => {
//     fetchAttendance();
//   }, []);

//   return (
//     <div style={{ padding: "20px" }}>
      
//       {/* 🔷 TITLE */}
//       <h2 style={{ textAlign: "center" }}>Scan QR</h2>

//       {/* 📷 QR SCANNER */}
//       {scanning && (
//         <div
//           style={{
//             width: "320px",
//             height: "320px",
//             margin: "20px auto",
//             borderRadius: "12px",
//             overflow: "hidden",
//             border: "2px solid #333",
//             boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
//           }}
//         >
//           <Scanner
//             onScan={(data) => {
//               if (data && data.length > 0) {
//                 setScanning(false); // prevent multiple scans

//                 axios.post("http://159.65.94.152/api/scan/", {
//                   token: data[0].rawValue,
//                   email: user?.email
//                 })
//                 .then(res => {
//                   setResult(res.data);
//                   fetchAttendance();
//                 })
//                 .catch(err => {
//                   console.log(err);
//                   alert("Scan failed");
//                   setScanning(true);
//                 });
//               }
//             }}
//           />
//         </div>
//       )}

//       {/* ✅ RESULT DISPLAY */}
//       {result && (
//         <div style={{ textAlign: "center", marginTop: "20px" }}>
//           <h3 style={{ color: "green" }}>✅ Attendance Recorded</h3>
//           <p><b>Name:</b> {result.name}</p>
//           <p><b>Phone:</b> {result.phone}</p>
//           <p><b>Time:</b> {result.time}</p>

//           {/* 🔄 SCAN AGAIN */}
//           <button
//             style={{
//               marginTop: "10px",
//               padding: "10px 20px",
//               border: "none",
//               backgroundColor: "#333",
//               color: "#fff",
//               borderRadius: "6px",
//               cursor: "pointer"
//             }}
//             onClick={() => {
//               setResult(null);
//               setScanning(true);
//             }}
//           >
//             Scan Another
//           </button>
//         </div>
//       )}

//       {/* 📋 ATTENDANCE LIST */}
//       <h3 style={{ marginTop: "40px", textAlign: "center" }}>
//         Attendance List
//       </h3>

//       <div style={{ overflowX: "auto" }}>
//         <table
//           border="1"
//           cellPadding="10"
//           style={{
//             width: "100%",
//             marginTop: "10px",
//             borderCollapse: "collapse",
//             textAlign: "center"
//           }}
//         >
//           <thead style={{ backgroundColor: "#f2f2f2" }}>
//             <tr>
//               <th>Name</th>
//               <th>Phone</th>
//               <th>Date</th>
//               <th>Time</th>
//             </tr>
//           </thead>

//           <tbody>
//             {records.map((r, index) => (
//               <tr key={index}>
//                 <td>{r.name}</td>
//                 <td>{r.phone}</td>
//                 <td>{r.date}</td>
//                 <td>{r.time}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//     </div>
//   );
// }

// export default ScanQR;











