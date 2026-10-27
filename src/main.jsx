import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const students = [
  {
    id: "2026-001",
    name: "Juan Dela Cruz",
    course: "BSIT",
    year: "2nd Year",
    status: "Active",
  },
  {
    id: "2026-002",
    name: "Maria Santos",
    course: "BSCS",
    year: "1st Year",
    status: "Active",
  },
  {
    id: "2026-003",
    name: "Mark Reyes",
    course: "BSBA",
    year: "3rd Year",
    status: "Inactive",
  },
  {
    id: "2026-004",
    name: "Angela Garcia",
    course: "BSED",
    year: "4th Year",
    status: "Active",
  },
];

function App() {
  
const [page, setPage] = useState("login");
const [activeMenu, setActiveMenu] = useState("Dashboard");
const [activeStudentMenu, setActiveStudentMenu] = useState("Overview");
const [loginRole, setLoginRole] = useState("admin");

const [showPassword, setShowPassword] = useState(false);

const [username, setUsername] = useState("");
const [password, setPassword] = useState("");

const [payments, setPayments] = useState([]);

const [selectedStudentId, setSelectedStudentId] =
  useState("2026-001");

const [paymentAmount, setPaymentAmount] = useState("");
const [paymentDate, setPaymentDate] = useState(
  new Date().toLocaleDateString("en-CA")
);
const [paymentMessage, setPaymentMessage] = useState("");

// Change this port if your C# API displays a different port in the terminal.
const API_URL = "http://localhost:5029";

// Load payments for the sample student from the backend.
useEffect(() => {
  async function loadPayments() {
    try {
      const response = await fetch(
        `${API_URL}/api/payments/2026-001`
      );

      if (!response.ok) {
        throw new Error("Failed to load payment records.");
      }

      const data = await response.json();
      setPayments(
        data.map((payment) => ({
          ...payment,
          studentId: payment.studentNumber,
          date: payment.paymentDate?.split("T")[0] ?? "",
          amount: Number(payment.amount),
        }))
      );
    } catch (error) {
      console.error("Error loading payments:", error);
    }
  }

  loadPayments();
}, []);

  // LOGIN
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginRole === "student") {
      setActiveStudentMenu("Overview");
      setPage("student-dashboard");
      return;
    }
    setPage("dashboard");
  };

  // LOGOUT
  const handleLogout = () => {
    setPage("login");
    setUsername("");
    setPassword("");
    setLoginRole("admin");
    setActiveMenu("Dashboard");
    setActiveStudentMenu("Overview");
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();

    const amount = Number(paymentAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentMessage("Enter a valid payment amount.");
      return;
    }

    const student = students.find(
      (item) => item.id === selectedStudentId
    );

    if (!student) {
      setPaymentMessage("Select a valid student.");
      return;
    }

    const receiptNo = `OR-${Date.now()}`;

    try {
      const response = await fetch(`${API_URL}/api/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentNumber: selectedStudentId,
          receiptNo,
          amount,
          paymentDate,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || "Could not save payment to the database."
        );
      }

      const responseForStudent = await fetch(
        `${API_URL}/api/payments/${selectedStudentId}`
      );

      if (responseForStudent.ok) {
        const data = await responseForStudent.json();
        setPayments(
          data.map((payment) => ({
            ...payment,
            studentId: payment.studentNumber,
            date: payment.paymentDate?.split("T")[0] ?? "",
            amount: Number(payment.amount),
          }))
        );
      }

      setPaymentAmount("");
      setPaymentMessage(`Cash payment saved for ${student.name}.`);
    } catch (error) {
      console.error("Error recording payment:", error);
      setPaymentMessage(error.message || "Could not save payment.");
    }
  };

  // ========================================
  // LOGIN PAGE
  // ========================================

  if (page === "login") {
    return (
      <div className="auth-page">
        <div className="auth-card">

          {/* LOGO / BRAND */}

          <div className="brand">
            <div className="brand-logo">
              C
            </div>

            <div>
              <h1>CCDI</h1>
              <span>CCDI Portal</span>
            </div>
          </div>

          {/* LOGIN HEADING */}

          <div className="auth-heading">

            <p className="eyebrow">
              STUDENT ACCOUNT MANAGEMENT SYSTEM FOR COMPUTER COMMUNICATION DEVELOPMENT INSTITUTE
            </p>

            <p>
              Log in.
            </p>

          </div>

          {/* LOGIN FORM */}

          <form onSubmit={handleLogin}>

            {/* USERNAME */}

            <label>
              Username
            </label>

            <div className="input-wrapper">

              <span className="input-icon">
                👤
              </span>

              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                required
              />

            </div>

            {/* ACCOUNT TYPE */}

            <label>
              Sign in as
            </label>

            <div className="input-wrapper role-select-wrapper">
              <span className="input-icon">▣</span>
              <select
                value={loginRole}
                onChange={(e) => setLoginRole(e.target.value)}
                aria-label="Sign in as"
              >
                <option value="admin">Administrator</option>
                <option value="student">Student</option>
              </select>
            </div>

            {/* PASSWORD */}

            <label>
              Password
            </label>

            <div className="input-wrapper">

              <span className="input-icon">
                🔒
              </span>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <button
                type="button"
                className="show-password"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

            {/* OPTIONS */}

            <div className="login-options">

              <label className="remember">

                <input
                  type="checkbox"
                />

                <span>
                  Remember me
                </span>

              </label>

              <button
                type="button"
                className="forgot-password"
              >
                Forgot password?
              </button>

            </div>

            {/* LOGIN BUTTON */}

            <button
              className="primary-button"
              type="submit"
            >
              Login
            </button>

          </form>

          {/* DIVIDER */}

          <div className="divider">
            <span>or</span>
          </div>

          {/* REGISTER */}

          <p className="register-text">

            Don't have an account?

            <button
              className="link-button"
              onClick={() =>
                setPage("register")
              }
            >
              Register
            </button>

          </p>

          {/* SECURITY */}

          <p className="security-message">
            🔐 Your account information is
            securely protected.
          </p>

        </div>
      </div>
    );
  }

  // ========================================
  // REGISTER PAGE
  // ========================================

  if (page === "register") {
    return (
      <div className="auth-page">

        <div className="auth-card register-card">

          {/* BACK */}

          <button
            className="back-button"
            onClick={() =>
              setPage("login")
            }
          >
            ← Back to Login
          </button>

          {/* BRAND */}

          <div className="brand">

            <div className="brand-logo">
              C
            </div>

            <div>
              <h1>CCDI</h1>
              <span>CCDI Portal</span>
            </div>

          </div>

          {/* REGISTER HEADING */}

          <div className="auth-heading">

            <p className="eyebrow">
              CREATE ACCOUNT
            </p>

            <p>
              Fill in your details to create
              a student account.
            </p>

          </div>

          {/* FIRST / LAST NAME */}

          <div className="two-column">

            <div>

              <label>
                First Name
              </label>

              <input
                className="normal-input"
                placeholder="First name"
              />

            </div>

            <div>

              <label>
                Last Name
              </label>

              <input
                className="normal-input"
                placeholder="Last name"
              />

            </div>

          </div>

          {/* STUDENT ID */}

          <label>
            Student ID
          </label>

          <input
            className="normal-input"
            placeholder="e.g. 2026-001"
          />

          {/* EMAIL */}

          <label>
            Email Address
          </label>

          <input
            className="normal-input"
            type="email"
            placeholder="student@example.com"
          />

          {/* PASSWORD */}

          <label>
            Password
          </label>

          <input
            className="normal-input"
            type="password"
            placeholder="Create a password"
          />

          {/* CREATE ACCOUNT */}

          <button
            className="primary-button register-button"
            onClick={() =>
              setPage("login")
            }
          >
            Create Account
          </button>

          {/* LOGIN LINK */}

          <p className="register-text">

            Already have an account?

            <button
              className="link-button"
              onClick={() =>
                setPage("login")
              }
            >
              Login
            </button>

          </p>

        </div>

      </div>
    );
  }

  // ========================================
  // STUDENT ACCOUNT DASHBOARD
  // ========================================

  if (page === "student-dashboard") {
    const studentMenuItems = ["Overview", "My Account", "Payment History", "Discounts"];
    return (
      <div className="student-portal">
        <aside className="student-sidebar">
          <div className="student-brand">
            <div className="student-brand-logo">C</div>
            <div><strong>CCDI</strong><small>Student Portal</small></div>
          </div>
          <div className="student-profile-block">
            <div className="student-avatar">JD</div>
            <div><strong>Juan Dela Cruz</strong><small>2026-001 · BSIT</small></div>
          </div>
          <p className="student-nav-label">MY PORTAL</p>
          <nav className="student-nav">
            {studentMenuItems.map((item) => (
              <button key={item} className={activeStudentMenu === item ? "student-nav-item selected" : "student-nav-item"} onClick={() => setActiveStudentMenu(item)}>
                <span>{item === "Overview" ? "⌂" : item === "My Account" ? "▣" : item === "Payment History" ? "▤" : "✦"}</span>{item}
              </button>
            ))}
          </nav>
          <button className="student-logout" onClick={handleLogout}>↪ Log out</button>
        </aside>

        <main className="student-main">
          <header className="student-topbar">
            <div><p className="student-eyebrow">STUDENT ACCOUNT MANAGEMENT SYSTEM</p><h1>{activeStudentMenu}</h1></div>
            <div className="student-topbar-user"><div className="student-avatar small-avatar">JD</div><div><strong>Juan Dela Cruz</strong><small>Student</small></div></div>
          </header>

          {activeStudentMenu === "Overview" && (
            <>
              <section className="student-welcome">
                <div><p>STUDENT PORTAL</p><h2>Hello, Juan!</h2><span>View your school account, payment records, and available discounts here.</span></div>
                <div className="welcome-mark">CCDI</div>
              </section>
              <section className="student-summary-grid">
                <article className="student-summary-card balance-card"><div className="summary-card-top"><span className="summary-icon">₱</span><span className="summary-tag">Current balance</span></div><p>Remaining Balance</p><h3>₱10,000.00</h3><small>Updated October 20, 2026</small></article>
                <article className="student-summary-card"><div className="summary-card-top"><span className="summary-icon green-icon">✓</span><span className="summary-tag paid-tag">Payments</span></div><p>Total Paid</p><h3>₱20,000.00</h3><small>Across all recorded payments</small></article>
                <article className="student-summary-card"><div className="summary-card-top"><span className="summary-icon purple-icon">▤</span><span className="summary-tag">School fees</span></div><p>Total Assessed Fees</p><h3>₱30,000.00</h3><small>For the current school year</small></article>
              </section>
              <section className="student-content-grid">
                <article className="student-panel student-account-panel">
                  <div className="student-panel-heading"><div><h3>Student Account</h3><p>Your personal and enrollment details</p></div><span className="account-status">Active</span></div>
                  <div className="student-details-grid">
                    <div><span>Student Name</span><strong>Juan Dela Cruz</strong></div>
                    <div><span>Student Number</span><strong>2026-001</strong></div>
                    <div><span>Course</span><strong>BSIT</strong></div>
                    <div><span>Year Level</span><strong>2nd Year</strong></div>
                    <div><span>School Year</span><strong>2026–2027</strong></div>
                    <div><span>Account Status</span><strong>In good standing</strong></div>
                  </div>
                  <button className="student-outline-button" onClick={() => setActiveStudentMenu("My Account")}>View account details</button>
                </article>
                <article className="student-panel discount-panel">
                  <div className="discount-symbol">✦</div><h3>Student Discount</h3><p>Check if a scholarship, student discount, or approved adjustment is available for your account.</p>
                  <div className="discount-status"><span>Current status</span><strong>No discount recorded</strong></div>
                  <button className="student-outline-button" onClick={() => setActiveStudentMenu("Discounts")}>View discount details</button>
                </article>
              </section>
              <section className="student-panel recent-payments-panel">
                <div className="student-panel-heading"><div><h3>Recent Payments</h3><p>Your latest recorded transactions</p></div><button className="student-text-button" onClick={() => setActiveStudentMenu("Payment History")}>View all payments →</button></div>
                <div className="student-table-wrap"><table className="student-table"><thead><tr><th>Receipt No.</th><th>Date</th><th>Payment Method</th><th>Amount</th><th>Status</th></tr></thead>
<tbody>
  {payments.map((payment) => (
    <tr key={payment.id}>
      <td><strong>{payment.receiptNo}</strong></td>
      <td>{payment.date}</td>
      <td>Cash</td>
      <td className="payment-amount">
        ₱{payment.amount.toLocaleString("en-PH", {
          minimumFractionDigits: 2,
        })}
      </td>
      <td>
        <span className="payment-status">{payment.status}</span>
      </td>
    </tr>
  ))}
</tbody>
</table></div>
              </section>
            </>
          )}

          {activeStudentMenu === "My Account" && (
            <section className="student-panel student-page-panel"><h3>My Account Details</h3><p className="student-page-description">Review your current fees and account balance.</p><div className="account-total-row"><span>Total assessed fees</span><strong>₱30,000.00</strong></div><div className="account-total-row"><span>Total payments</span><strong className="positive-value">− ₱20,000.00</strong></div><div className="account-total-row final-total"><span>Remaining balance</span><strong>₱10,000.00</strong></div><p className="student-note">These figures are sample data for the interface. They will come from the school database after the backend is connected.</p></section>
          )}

          {activeStudentMenu === "Payment History" && (
            <section className="student-panel student-page-panel">
              <div className="student-panel-heading">
                <div>
                  <h3>Payment History and Receipts</h3>
                  <p>Payments recorded for your student account</p>
                </div>
              </div>
              <div className="student-table-wrap">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>Receipt No.</th>
                      <th>Date</th>
                      <th>Payment Method</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td><strong>{payment.receiptNo}</strong></td>
                        <td>{payment.date}</td>
                        <td>{payment.method || "Cash"}</td>
                        <td className="payment-amount">
                          ₱{Number(payment.amount).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td><span className="payment-status">{payment.status}</span></td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr><td colSpan="5">No payment records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="student-note">Only payment records saved in the database will appear here.</p>
            </section>
          )}

          {activeStudentMenu === "Discounts" && (
            <section className="student-panel student-page-panel"><div className="discount-symbol">✦</div><h3>Discounts and Scholarships</h3><p className="student-page-description">Approved discounts will appear here when recorded by the school administrator.</p><div className="discount-status"><span>Current status</span><strong>No discount recorded</strong></div><p className="student-note">Ask the school office to confirm your eligibility. This demo does not apply discounts to the balance.</p></section>
          )}
        </main>
      </div>
    );
  }

  // ========================================
  // ADMIN DASHBOARD
  // ========================================

  const menuItems = [
    "Dashboard",
    "Students",
    "Accounts",
    "Reports",
    "Settings",
  ];

  return (
    <div className="dashboard">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="brand-logo">
            C
          </div>

          <div>
            <strong>
              CCDI
            </strong>

            <small>
              CCDI Portal
            </small>
          </div>

        </div>

        {/* ADMIN PROFILE */}

        <div className="admin-profile">

          <div className="admin-avatar">
            AD
          </div>

          <div>

            <strong>
              Admin User
            </strong>

            <small>
              Administrator
            </small>

          </div>

        </div>

        {/* NAVIGATION */}

        <nav>

          <p className="navigation-title">
            MAIN MENU
          </p>

          {menuItems.map((item) => (

            <button
              key={item}
              className={
                activeMenu === item
                  ? "navigation-item active"
                  : "navigation-item"
              }
              onClick={() =>
                setActiveMenu(item)
              }
            >

              <span className="navigation-icon">

                {item === "Dashboard" && "⌂"}
                {item === "Students" && "♙"}
                {item === "Accounts" && "▣"}
                {item === "Reports" && "▤"}
                {item === "Settings" && "⚙"}

              </span>

              {item}

            </button>

          ))}

        </nav>

        {/* LOGOUT */}

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          ↪ Logout
        </button>

      </aside>

      {/* MAIN CONTENT */}

      <main className="main-content">

        {/* TOPBAR */}

        <header className="topbar">

          <div>

            <p className="eyebrow">
              STUDENT ACCOUNT MANAGEMENT SYSTEM for Computer Communication Development Institute
            </p>

            <h1>
              {activeMenu}
            </h1>

          </div>

          <div className="topbar-right">

            <button className="notification-button">
              🔔
            </button>

            <div className="mini-profile">

              <span>
                AD
              </span>

              <strong>
                Admin User
              </strong>

            </div>

          </div>

        </header>

        {/* DASHBOARD */}

        {activeMenu === "Dashboard" && (
          <>

            {/* WELCOME CARD */}

            <section className="welcome-card">

              <div>

                <h2>
                  Good day, Admin! 👋
                </h2>

                <p>
                  Here is an overview of the
                  student account system.
                </p>

              </div>

              <button
                className="white-button"
                onClick={() =>
                  setActiveMenu("Students")
                }
              >
                View Students
              </button>

            </section>

            {/* STATISTICS */}

            <section className="statistics-grid">

              <StatCard
                icon="♙"
                title="Total Students"
                value="248"
              />

              <StatCard
                icon="✓"
                title="Active Accounts"
                value="231"
              />

              <StatCard
                icon="◷"
                title="Pending Accounts"
                value="12"
              />

              <StatCard
                icon="⊘"
                title="Inactive Accounts"
                value="5"
              />

            </section>

            {/* DASHBOARD GRID */}

            <section className="dashboard-grid">

              {/* RECENT STUDENTS */}

              <div className="panel students-panel">

                <div className="panel-header">

                  <div>

                    <h3>
                      Recent Students
                    </h3>

                    <p>
                      Latest student accounts
                    </p>

                  </div>

                  <button
                    className="outline-button"
                    onClick={() =>
                      setActiveMenu("Students")
                    }
                  >
                    View All
                  </button>

                </div>

                <StudentTable />

              </div>

              {/* ACCOUNT ACTIVITY */}

              <div className="panel">

                <div className="panel-header">

                  <div>

                    <h3>
                      Account Activity
                    </h3>

                    <p>
                      Recent system actions
                    </p>

                  </div>

                </div>

                <div className="activity-list">

                  <Activity
                    icon="✓"
                    text="New student account created"
                    time="10 minutes ago"
                  />

                  <Activity
                    icon="↻"
                    text="Password updated"
                    time="32 minutes ago"
                  />

                  <Activity
                    icon="✓"
                    text="Account verified"
                    time="1 hour ago"
                  />

                  <Activity
                    icon="!"
                    text="Pending account review"
                    time="2 hours ago"
                  />

                </div>

              </div>

            </section>

          </>
        )}

        {/* STUDENTS PAGE */}

        {activeMenu === "Students" && (

          <section className="panel page-panel">

            <div className="panel-header">

              <div>

                <h3>
                  Student Accounts
                </h3>

                <p>
                  Manage registered student accounts.
                </p>

              </div>

              <button
                className="primary-button small-button"
              >
                + Add Student
              </button>

            </div>

            {/* SEARCH */}

            <div className="search-row">

              <input
                className="normal-input"
                placeholder="🔎 Search student..."
              />

              <select>

                <option>
                  All Status
                </option>

                <option>
                  Active
                </option>

                <option>
                  Inactive
                </option>

              </select>

            </div>

            <StudentTable />

          </section>

        )}

        {/* ADMIN CASH PAYMENT PAGE */}

{activeMenu === "Accounts" && (
  <section className="panel page-panel">
    <div className="panel-header">
      <div>
        <h3>Record Student Cash Payment</h3>
        <p>
          Enter the cash received from a student.
        </p>
      </div>
    </div>

    <form onSubmit={handleRecordPayment}>
      <div className="search-row">
        <select
          className="normal-input"
          value={selectedStudentId}
          onChange={(e) =>
            setSelectedStudentId(e.target.value)
          }
          required
        >
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.id} - {student.name}
            </option>
          ))}
        </select>

        <input
          className="normal-input"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Cash amount (₱)"
          value={paymentAmount}
          onChange={(e) =>
            setPaymentAmount(e.target.value)
          }
          required
        />

        <input
          className="normal-input"
          type="date"
          value={paymentDate}
          onChange={(e) =>
            setPaymentDate(e.target.value)
          }
          required
        />

        <input
          className="normal-input"
          value="Cash"
          readOnly
          aria-label="Payment method"
        />
      </div>

      <button
        className="primary-button"
        type="submit"
      >
        Record Payment
      </button>

      {paymentMessage && (
        <p role="status">{paymentMessage}</p>
      )}
    </form>

    <h3>Recorded Cash Payments</h3>

    <div className="student-table-wrap">
      <table className="student-table">
        <thead>
          <tr>
            <th>Receipt No.</th>
            <th>Student</th>
            <th>Date</th>
            <th>Method</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {payments.map((payment) => {
            const student = students.find(
              (item) => item.id === payment.studentId
            );

            return (
              <tr key={payment.id}>
                <td>{payment.receiptNo}</td>
                <td>{student?.name ?? payment.studentId}</td>
                <td>{payment.date}</td>
                <td>Cash</td>
                <td>
                  {payment.amount.toLocaleString(
                    "en-PH",
                    {
                      style: "currency",
                      currency: "PHP",
                    }
                  )}
                </td>
                <td>{payment.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </section>
)}

        {/* OTHER PAGES */}

        {activeMenu !== "Dashboard" &&
          activeMenu !== "Students" && (

            <section className="panel empty-panel">

              <div className="empty-icon">
                ▣
              </div>

              <h2>
                {activeMenu}
              </h2>

              <p>
                This section is ready for
                your next module.
              </p>

            </section>

          )}

      </main>

    </div>
  );
}

// ========================================
// STAT CARD
// ========================================

function StatCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div>

        <p>
          {title}
        </p>

        <h2>
          {value}
        </h2>

      </div>

      <span className="trend">
        +4.2%
      </span>

    </div>
  );
}

// ========================================
// ACTIVITY
// ========================================

function Activity({
  icon,
  text,
  time,
}) {
  return (
    <div className="activity-item">

      <div className="activity-icon">
        {icon}
      </div>

      <div>

        <strong>
          {text}
        </strong>

        <small>
          {time}
        </small>

      </div>

    </div>
  );
}

// ========================================
// STUDENT TABLE
// ========================================

function StudentTable() {
  return (
    <div className="table-wrapper">

      <table>

        <thead>

          <tr>

            <th>
              Student ID
            </th>

            <th>
              Name
            </th>

            <th>
              Course
            </th>

            <th>
              Year Level
            </th>

            <th>
              Status
            </th>

          </tr>

        </thead>

        <tbody>

          {students.map((student) => (

            <tr key={student.id}>

              <td>
                <strong>
                  {student.id}
                </strong>
              </td>

              <td>
                {student.name}
              </td>

              <td>
                {student.course}
              </td>

              <td>
                {student.year}
              </td>

              <td>

                <span
                  className={
                    student.status === "Active"
                      ? "status active-status"
                      : "status inactive-status"
                  }
                >
                  {student.status}
                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

// ========================================
// RENDER APP
// ========================================

createRoot(
  document.getElementById("root")
).render(
  <App />
);