import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ClanProvider } from './context/ClanContext'
import { AdminPage } from './pages/AdminPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { SoldiersPage } from './pages/SoldiersPage'
import { TierBoardPage } from './pages/TierBoardPage'
import { MembersPage } from './pages/MembersPage'
import { TournamentPage } from './pages/TournamentPage'
import { TournamentWinnersPage } from './pages/TournamentWinnersPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ClanProvider>
          <Routes>
            <Route path="auth/callback" element={<AuthCallbackPage />} />
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="soldiers" element={<SoldiersPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="tiers" element={<TierBoardPage />} />
              <Route path="tournament" element={<TournamentPage />} />
              <Route path="winners" element={<TournamentWinnersPage />} />
              <Route path="admin" element={<AdminPage />} />
            </Route>
          </Routes>
        </ClanProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
