import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import Auth from './components/Auth'
import Lobby from './components/Lobby'
import Room from './components/Room'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [currentRoom, setCurrentRoom] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setCurrentRoom(null) // Limpiar estado de sala al salir
  }

  const handleJoinRoom = (room) => {
    setCurrentRoom(room)
  }

  const handleLeaveRoom = () => {
    setCurrentRoom(null)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Cargando...
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="app-container">
      {currentRoom ? (
        <Room 
          room={currentRoom} 
          session={session} 
          onLeaveRoom={handleLeaveRoom} 
        />
      ) : (
        <Lobby 
          session={session} 
          onJoinRoom={handleJoinRoom} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  )
}

export default App
