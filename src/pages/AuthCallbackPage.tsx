import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!supabase) {
      navigate('/', { replace: true })
      return
    }
    supabase.auth.getSession().finally(() => {
      navigate('/admin', { replace: true })
    })
  }, [navigate])

  return (
    <div className="page-shell mx-auto max-w-lg py-20 text-center text-slate-400">
      Signing you in…
    </div>
  )
}
