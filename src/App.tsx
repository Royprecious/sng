import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ClanProvider } from './context/ClanContext'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'

const SoldiersPage = lazy(() =>
  import('./pages/SoldiersPage').then((m) => ({ default: m.SoldiersPage })),
)
const MembersPage = lazy(() =>
  import('./pages/MembersPage').then((m) => ({ default: m.MembersPage })),
)
const TierBoardPage = lazy(() =>
  import('./pages/TierBoardPage').then((m) => ({ default: m.TierBoardPage })),
)
const TournamentPage = lazy(() =>
  import('./pages/TournamentPage').then((m) => ({ default: m.TournamentPage })),
)
const TournamentWinnersPage = lazy(() =>
  import('./pages/TournamentWinnersPage').then((m) => ({
    default: m.TournamentWinnersPage,
  })),
)
const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })),
)

function RouteFallback() {
  return (
    <p className="page-shell py-16 text-center text-sm text-slate-500">
      Loading…
    </p>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ClanProvider>
          <Routes>
            <Route path="auth/callback" element={<AuthCallbackPage />} />
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route
                path="soldiers"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <SoldiersPage />
                  </Suspense>
                }
              />
              <Route
                path="members"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <MembersPage />
                  </Suspense>
                }
              />
              <Route
                path="tiers"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <TierBoardPage />
                  </Suspense>
                }
              />
              <Route
                path="tournament"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <TournamentPage />
                  </Suspense>
                }
              />
              <Route
                path="winners"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <TournamentWinnersPage />
                  </Suspense>
                }
              />
              <Route
                path="admin"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <AdminPage />
                  </Suspense>
                }
              />
            </Route>
          </Routes>
        </ClanProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
