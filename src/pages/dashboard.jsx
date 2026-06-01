import React, { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Dashboard({ user }) {
  const [workouts, setWorkouts] = useState([])
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState("")
  const [activeWorkoutId, setActiveWorkoutId] = useState(null)
  const [newSet, setNewSet] = useState({ reps: "", weight: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: w }, { data: e }] = await Promise.all([
      supabase.from("workouts")
        .select("*, exercises(name, muscle_group), sets(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("exercises").select("*").order("name")
    ])
    setWorkouts(w || [])
    setExercises(e || [])
    setLoading(false)
  }

  async function startWorkout(e) {
    e.preventDefault()
    setError("")
    setSaving(true)
    const { data, error } = await supabase.from("workouts").insert({
      user_id: user.id,
      exercise_id: parseInt(selectedExercise),
      sets: 0,
      reps: 0,
    }).select("*, exercises(name, muscle_group)").single()

    if (error) {
      setError(error.message)
    } else {
      setWorkouts(prev => [{ ...data, sets: [] }, ...prev])
      setActiveWorkoutId(data.id)
      setShowForm(false)
      setSelectedExercise("")
    }
    setSaving(false)
  }

  async function addSet(workoutId) {
    if (!newSet.reps) return
    const workout = workouts.find(w => w.id === workoutId)
    const setNumber = (workout.sets?.length || 0) + 1

    const { data, error } = await supabase.from("sets").insert({
      workout_id: workoutId,
      set_number: setNumber,
      reps: parseInt(newSet.reps),
      weight: newSet.weight ? parseFloat(newSet.weight) : null,
    }).select().single()

    if (!error) {
      setWorkouts(prev => prev.map(w =>
        w.id === workoutId
          ? { ...w, sets: [...(w.sets || []), data] }
          : w
      ))
      setNewSet({ reps: "", weight: "" })
    }
  }

  async function deleteSet(workoutId, setId) {
    await supabase.from("sets").delete().eq("id", setId)
    setWorkouts(prev => prev.map(w =>
      w.id === workoutId
        ? { ...w, sets: w.sets.filter(s => s.id !== setId) }
        : w
    ))
  }

  async function deleteWorkout(id) {
    await supabase.from("workouts").delete().eq("id", id)
    setWorkouts(prev => prev.filter(w => w.id !== id))
    if (activeWorkoutId === id) setActiveWorkoutId(null)
  }

  return (
    <div style={s.page}>
      <main style={s.main}>
        <div style={s.topRow}>
          <h2 style={s.sectionTitle}>Dine økter</h2>
          <button style={s.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Avbryt" : "+ Ny økt"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={startWorkout} style={s.form}>
            <h3 style={s.formTitle}>Velg øvelse</h3>
            <select style={s.input} value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} required>
              <option value="">Velg øvelse...</option>
              {exercises.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name} {ex.muscle_group ? `(${ex.muscle_group})` : ""}</option>
              ))}
            </select>
            {error && <p style={s.error}>{error}</p>}
            <button style={s.saveBtn} type="submit" disabled={saving}>
              {saving ? "Starter..." : "Start økt →"}
            </button>
          </form>
        )}

        {loading ? (
          <p style={s.empty}>Laster økter...</p>
        ) : workouts.length === 0 ? (
          <p style={s.empty}>Ingen økter ennå. Trykk "+ Ny økt" for å starte! 🏋️</p>
        ) : (
          <div style={s.list}>
            {workouts.map(w => {
              const isActive = activeWorkoutId === w.id
              const sortedSets = [...(w.sets || [])].sort((a, b) => a.set_number - b.set_number)
              return (
                <div key={w.id} style={{ ...s.card, ...(isActive ? s.cardActive : {}) }}>
                  <div style={s.cardTop}>
                    <div>
                      <span style={s.exerciseName}>{w.exercises?.name ?? "Ukjent"}</span>
                      {w.exercises?.muscle_group && <span style={s.muscleTag}>{w.exercises.muscle_group}</span>}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      {!isActive && (
                        <button style={s.editBtn} onClick={() => setActiveWorkoutId(w.id)}>+ Sett</button>
                      )}
                      {isActive && (
                        <button style={s.doneBtn} onClick={() => setActiveWorkoutId(null)}>✓ Ferdig</button>
                      )}
                      <button style={s.deleteBtn} onClick={() => deleteWorkout(w.id)}>✕</button>
                    </div>
                  </div>

                  {sortedSets.length > 0 && (
                    <div style={s.setList}>
                      {sortedSets.map(set => (
                        <div key={set.id} style={s.setRow}>
                          <span style={s.setNumber}>Sett {set.set_number}</span>
                          <span style={s.setDetail}>{set.reps} reps</span>
                          {set.weight && <span style={s.setDetail}>@ {set.weight} kg</span>}
                          <button style={s.setDeleteBtn} onClick={() => deleteSet(w.id, set.id)}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {isActive && (
                    <div style={s.addSetRow}>
                      <input
                        style={{ ...s.input, ...s.setInput }}
                        type="number"
                        placeholder="Reps"
                        value={newSet.reps}
                        onChange={e => setNewSet({ ...newSet, reps: e.target.value })}
                        min="1"
                      />
                      <input
                        style={{ ...s.input, ...s.setInput }}
                        type="number"
                        placeholder="Vekt (kg)"
                        value={newSet.weight}
                        onChange={e => setNewSet({ ...newSet, weight: e.target.value })}
                        step="0.5"
                      />
                      <button style={s.addSetBtn} onClick={() => addSet(w.id)}>+ Legg til sett</button>
                    </div>
                  )}

                  <p style={s.date}>{new Date(w.created_at).toLocaleDateString("no-NO", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

const s = {
  page: { minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Courier New', monospace" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem", borderBottom: "1px solid #1a1a1a", position: "sticky", top: 0, background: "#0a0a0a", zIndex: 10 },
  logo: { color: "#e8ff47", fontWeight: "bold", letterSpacing: "0.15em", fontSize: "0.95rem" },
  headerRight: { display: "flex", alignItems: "center", gap: "1rem" },
  emailLabel: { color: "#444", fontSize: "0.8rem" },
  logoutBtn: { background: "transparent", border: "1px solid #333", color: "#888", padding: "0.3rem 0.8rem", borderRadius: "2px", cursor: "pointer", fontSize: "0.8rem" },
  main: { maxWidth: "680px", margin: "0 auto", padding: "2rem 1.5rem" },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  sectionTitle: { color: "#fff", fontSize: "1rem", letterSpacing: "0.1em", margin: 0 },
  addBtn: { background: "#e8ff47", color: "#0a0a0a", border: "none", padding: "0.5rem 1rem", borderRadius: "2px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "bold", letterSpacing: "0.05em" },
  form: { background: "#111", border: "1px solid #222", borderRadius: "4px", padding: "1.5rem", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  formTitle: { color: "#e8ff47", margin: "0 0 0.5rem", fontSize: "0.9rem", letterSpacing: "0.1em" },
  input: { background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: "2px", padding: "0.65rem 0.8rem", color: "#fff", fontSize: "0.9rem", width: "100%", boxSizing: "border-box", fontFamily: "'Courier New', monospace" },
  saveBtn: { background: "#e8ff47", color: "#0a0a0a", border: "none", padding: "0.75rem", borderRadius: "2px", cursor: "pointer", fontWeight: "bold", fontSize: "0.9rem", letterSpacing: "0.1em" },
  error: { color: "#ff4757", fontSize: "0.8rem", margin: 0 },
  list: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  card: { background: "#111", border: "1px solid #1e1e1e", borderRadius: "4px", padding: "1.25rem 1.5rem" },
  cardActive: { border: "1px solid #e8ff4744" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" },
  exerciseName: { color: "#fff", fontWeight: "bold", fontSize: "1rem", letterSpacing: "0.05em" },
  muscleTag: { display: "inline-block", marginLeft: "0.75rem", background: "#1a1a1a", color: "#555", fontSize: "0.7rem", padding: "0.15rem 0.5rem", borderRadius: "2px" },
  deleteBtn: { background: "transparent", border: "none", color: "#333", cursor: "pointer", fontSize: "1rem", padding: "0" },
  editBtn: { background: "transparent", border: "1px solid #333", color: "#888", padding: "0.2rem 0.6rem", borderRadius: "2px", cursor: "pointer", fontSize: "0.75rem" },
  doneBtn: { background: "transparent", border: "1px solid #e8ff47", color: "#e8ff47", padding: "0.2rem 0.6rem", borderRadius: "2px", cursor: "pointer", fontSize: "0.75rem" },
  setList: { display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.75rem" },
  setRow: { display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.4rem 0.6rem", background: "#0a0a0a", borderRadius: "2px" },
  setNumber: { color: "#555", fontSize: "0.75rem", minWidth: "48px" },
  setDetail: { color: "#aaa", fontSize: "0.85rem" },
  setDeleteBtn: { background: "transparent", border: "none", color: "#2a2a2a", cursor: "pointer", fontSize: "0.8rem", marginLeft: "auto", padding: 0 },
  addSetRow: { display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.5rem", marginBottom: "0.75rem" },
  setInput: { padding: "0.5rem 0.7rem", fontSize: "0.85rem" },
  addSetBtn: { background: "#e8ff47", color: "#0a0a0a", border: "none", borderRadius: "2px", padding: "0.5rem 0.8rem", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem", whiteSpace: "nowrap" },
  date: { color: "#444", fontSize: "0.75rem", margin: 0, letterSpacing: "0.05em" },
  empty: { color: "#444", textAlign: "center", padding: "3rem 0", fontSize: "0.9rem" }
}