import React, { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Progress from "./pages/Progress"

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState("dashboard")

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0a0a0a", color: "#e8ff47", fontFamily: "monospace" }}>
      Laster...
    </div>
  )

  if (!user) return <Login />

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Courier New', monospace" }}>
      <header style={s.header}>
        <span style={s.logo}>💪 TRENINGSDAGBOK</span>
        <nav style={s.nav}>
          <button style={{ ...s.navBtn, ...(page === "dashboard" ? s.navActive : {}) }} onClick={() => setPage("dashboard")}>Økter</button>
          <button style={{ ...s.navBtn, ...(page === "progress" ? s.navActive : {}) }} onClick={() => setPage("progress")}>Progresjon</button>
        </nav>
        <div style={s.headerRight}>
          <span style={s.emailLabel}>{user.email}</span>
          <button style={s.logoutBtn} onClick={() => supabase.auth.signOut()}>Logg ut</button>
        </div>
      </header>

      {page === "dashboard" && <Dashboard user={user} />}
      {page === "progress" && <Progress user={user} />}
    </div>
  )
}

const s = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem", borderBottom: "1px solid #1a1a1a", position: "sticky", top: 0, background: "#0a0a0a", zIndex: 10 },
  logo: { color: "#e8ff47", fontWeight: "bold", letterSpacing: "0.15em", fontSize: "0.95rem" },
  nav: { display: "flex", gap: "0.25rem" },
  navBtn: { background: "transparent", border: "1px solid #222", color: "#555", padding: "0.3rem 0.9rem", borderRadius: "2px", cursor: "pointer", fontSize: "0.8rem", letterSpacing: "0.05em", fontFamily: "'Courier New', monospace" },
  navActive: { border: "1px solid #e8ff47", color: "#e8ff47" },
  headerRight: { display: "flex", alignItems: "center", gap: "1rem" },
  emailLabel: { color: "#444", fontSize: "0.8rem" },
  logoutBtn: { background: "transparent", border: "1px solid #333", color: "#888", padding: "0.3rem 0.8rem", borderRadius: "2px", cursor: "pointer", fontSize: "0.8rem" },
}