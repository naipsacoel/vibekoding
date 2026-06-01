import React, { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>💪</div>
        <h1 style={s.title}>TRENINGSDAGBOK</h1>
        <p style={s.sub}>Logg inn for å fortsette</p>
        <form onSubmit={handleLogin} style={s.form}>
          <input style={s.input} type="email" placeholder="E-post" value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={s.input} type="password" placeholder="Passord" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p style={s.error}>{error}</p>}
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? "Logger inn..." : "Logg inn"}
          </button>
        </form>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0a0a0a", fontFamily:"'Courier New', monospace" },
  card: { background:"#111", border:"1px solid #222", borderRadius:"4px", padding:"2.5rem", width:"100%", maxWidth:"360px" },
  logo: { fontSize:"2.5rem", textAlign:"center", marginBottom:"0.5rem" },
  title: { color:"#e8ff47", fontSize:"1.1rem", letterSpacing:"0.2em", textAlign:"center", margin:"0 0 0.25rem" },
  sub: { color:"#555", fontSize:"0.8rem", textAlign:"center", marginBottom:"2rem" },
  form: { display:"flex", flexDirection:"column", gap:"0.75rem" },
  input: { background:"#0a0a0a", border:"1px solid #333", borderRadius:"2px", padding:"0.7rem 0.9rem", color:"#fff", fontSize:"0.9rem", outline:"none" },
  btn: { background:"#e8ff47", color:"#0a0a0a", border:"none", borderRadius:"2px", padding:"0.8rem", fontSize:"0.9rem", fontWeight:"bold", letterSpacing:"0.1em", cursor:"pointer", marginTop:"0.5rem" },
  error: { color:"#ff4757", fontSize:"0.8rem", margin:0 }
}