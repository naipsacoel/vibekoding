1. Supabase-oppsett
Prompt: Hjelp meg å installere og sette opp Supabase i et Vite-prosjekt med miljøvariabler.
Generert: Installasjon av @supabase/supabase-js, .env med VITE_SUPABASE_URL og VITE_SUPABASE_ANON_KEY, og src/lib/supabase.js.

2. Autentisering
Prompt: Lag login med Supabase auth i React.
Generert: Kode med supabase.auth.signInWithPassword(), useState, useEffect og onAuthStateChange for å beskytte dashboard.

3. React import-feil
Prompt: Hvorfor får jeg "Failed to resolve import react"?
Generert: Forklaring på at react, react-dom og @vitejs/plugin-react må installeres og konfigureres i vite.config.js.

4. JSX-feil uten plugin
Prompt: App.jsx gir "React is not defined" selv om jeg importerer React.
Generert: Forklaring på at Vite uten @vitejs/plugin-react ikke transformerer JSX automatisk. Løsning: installer plugin og legg til i vite.config.js.




byttet til claude fordi gpt fungerte litt dårlig




5. Mappestruktur og komponenter
Prompt: Hvordan bør jeg strukturere et React-prosjekt med flere sider?
Generert: Forslag til src/pages/, src/components/, src/lib/ og én fil per side. App.jsx håndterer routing mellom Login og Dashboard.

6. Hente data fra Supabase
Prompt: Lag en komponent som henter workouts fra Supabase og viser dem i en liste.
Generert: useEffect med supabase.from("workouts").select("*, exercises(name, muscle_group)") og visning av øvelsesnavn, sett, reps og vekt.

7. Logging av individuelle sett
Prompt: Gjør at man kan legge til sett en etter en med egne reps og vekt.
Generert: Ny sets-tabell i Supabase, oppdatert Dashboard med aktiv økt og sett-liste. Måtte legge til RLS-policies manuelt for å fikse 403-feil.

8. Slette data
Prompt: Legg til slett-funksjon for økter og sett.
Generert: supabase.from("workouts").delete().eq("id", id) og supabase.from("sets").delete().eq("id", id) med oppdatering av state etterpå.

9. Navigasjon mellom sider
Prompt: Legg til navigasjon mellom Økter og Progresjon i headeren.
Generert: Enkel useState-basert navigasjon i App.jsx med aktiv-styling på valgt fane.

10. Progresjonsgraf med PR og volum
Prompt: Lag en progress-side med recharts som viser PR og volum. Split PR i estimert (Epley) og ekte PR som ikke kan gå nedover.
Generert: Progress.jsx med estimert 1RM (Epley-formel vekt × (1 + reps/30)), ekte PR med stepAfter-linje, volumgraf og statistikk-bokser.