import React, { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts"

export default function Progress({ user }) {
  const [exercises, setExercises] = useState([])
  const [selected, setSelected] = useState("")
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from("exercises").select("*").order("name").then(({ data }) => {
      setExercises(data || [])
    })
  }, [])

  useEffect(() => {
    if (!selected) return
    fetchProgress(selected)
  }, [selected])

  async function fetchProgress(exerciseId) {
    setLoading(true)
    const { data } = await supabase
      .from("workouts")
      .select("created_at, sets(*)")
      .eq("user_id", user.id)
      .eq("exercise_id", exerciseId)
      .order("created_at", { ascending: true })

    if (data) {
      let allTimePR = 0

      const points = data
        .filter(w => w.sets && w.sets.length > 0)
        .map(w => {
          // Estimert 1RM (Epley): vekt * (1 + reps/30)
          const estimertPR = Math.max(...w.sets.map(s =>
            s.weight ? Math.round(s.weight * (1 + (s.reps || 0) / 30)) : 0
          ))

          // Ekte PR = høyeste faktiske vekt i denne økten
          const ektePROkt = Math.max(...w.sets.map(s => s.weight || 0))

          // Ekte PR kan aldri gå nedover
          if (ektePROkt > allTimePR) allTimePR = ektePROkt

          // Volum = sum(vekt * reps)
          const volum = w.sets.reduce((sum, s) =>
            sum + ((s.weight || 0) * (s.reps || 0)), 0
          )

          const date = new Date(w.created_at).toLocaleDateString("no-NO", { day: "numeric", month: "short" })
          return { date, estimertPR, ektePR: allTimePR, volum }
        })
        .filter(p => p.volum > 0)

      setChartData(points)
    }
    setLoading(false)
  }

  const bestEstimert = chartData.length ? Math.max(...chartData.map(d => d.estimertPR)) : 0
  const bestEkte = chartData.length ? Math.max(...chartData.map(d => d.ektePR)) : 0
  const bestVolum = chartData.length ? Math.max(...chartData.map(d => d.volum)) : 0

  return (
    <div style={s.page}>
      <div style={s.main}>
        <h2 style={s.title}>Progresjon 📈</h2>

        <select style={s.select} value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">Velg øvelse...</option>
          {exercises.map(ex => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>

        {loading && <p style={s.empty}>Laster data...</p>}

        {!loading && selected && chartData.length === 0 && (
          <p style={s.empty}>Ingen data med vekt for denne øvelsen ennå.</p>
        )}

        {!loading && chartData.length > 0 && (
          <div style={s.chartWrap}>

            <p style={s.chartLabel}>PR — EKTE VS ESTIMERT 1RM (kg)</p>
            <div style={s.legend}>
              <span style={s.legendItem}><span style={{ ...s.dot, background: "#e8ff47" }} /> Estimert 1RM (Epley)</span>
              <span style={s.legendItem}><span style={{ ...s.dot, background: "#ff6b6b" }} /> Ekte PR (aldri nedover)</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 11, fontFamily: "Courier New" }} />
                <YAxis tick={{ fill: "#555", fontSize: 11, fontFamily: "Courier New" }} unit=" kg" />
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: "4px", fontFamily: "Courier New", fontSize: "0.85rem" }}
                  labelStyle={{ color: "#aaa" }}
                  itemStyle={{ color: "#aaa" }}
                />
                <Line type="monotone" dataKey="estimertPR" stroke="#e8ff47" strokeWidth={2} dot={{ fill: "#e8ff47", r: 3 }} activeDot={{ r: 5 }} name="Estimert 1RM" strokeDasharray="4 2" />
                <Line type="stepAfter" dataKey="ektePR" stroke="#ff6b6b" strokeWidth={2.5} dot={{ fill: "#ff6b6b", r: 4 }} activeDot={{ r: 6 }} name="Ekte PR" />
              </LineChart>
            </ResponsiveContainer>

            <p style={{ ...s.chartLabel, marginTop: "2rem" }}>VOLUM PER ØKT (kg)</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 11, fontFamily: "Courier New" }} />
                <YAxis tick={{ fill: "#555", fontSize: 11, fontFamily: "Courier New" }} unit=" kg" />
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: "4px", fontFamily: "Courier New", fontSize: "0.85rem" }}
                  labelStyle={{ color: "#aaa" }}
                  itemStyle={{ color: "#aaa" }}
                />
                <Line type="monotone" dataKey="volum" stroke="#4ecdc4" strokeWidth={2} dot={{ fill: "#4ecdc4", r: 3 }} name="Volum" />
              </LineChart>
            </ResponsiveContainer>

            <div style={s.statsRow}>
              <div style={s.statBox}>
                <p style={{ ...s.statVal, color: "#ff6b6b" }}>{bestEkte} kg</p>
                <p style={s.statLbl}>Ekte PR</p>
              </div>
              <div style={s.statBox}>
                <p style={{ ...s.statVal, color: "#e8ff47" }}>{bestEstimert} kg</p>
                <p style={s.statLbl}>Estimert 1RM</p>
              </div>
              <div style={s.statBox}>
                <p style={{ ...s.statVal, color: "#4ecdc4" }}>{bestVolum} kg</p>
                <p style={s.statLbl}>Høyeste volum</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Courier New', monospace" },
  main: { maxWidth: "680px", margin: "0 auto", padding: "2rem 1.5rem" },
  title: { color: "#e8ff47", fontSize: "1rem", letterSpacing: "0.15em", marginBottom: "1.5rem" },
  select: { background: "#111", border: "1px solid #2a2a2a", borderRadius: "2px", padding: "0.65rem 0.8rem", color: "#fff", fontSize: "0.9rem", width: "100%", fontFamily: "'Courier New', monospace", marginBottom: "2rem", cursor: "pointer" },
  chartWrap: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  chartLabel: { color: "#555", fontSize: "0.75rem", letterSpacing: "0.1em", margin: "0 0 0.25rem" },
  legend: { display: "flex", gap: "1.5rem", marginBottom: "0.75rem" },
  legendItem: { display: "flex", alignItems: "center", gap: "0.4rem", color: "#555", fontSize: "0.75rem" },
  dot: { display: "inline-block", width: "8px", height: "8px", borderRadius: "50%" },
  statsRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginTop: "2rem" },
  statBox: { background: "#111", border: "1px solid #1e1e1e", borderRadius: "4px", padding: "1rem", textAlign: "center" },
  statVal: { fontSize: "1.4rem", fontWeight: "bold", margin: "0 0 0.25rem" },
  statLbl: { color: "#555", fontSize: "0.7rem", letterSpacing: "0.1em", margin: 0 },
  empty: { color: "#444", textAlign: "center", padding: "3rem 0", fontSize: "0.9rem" }
}