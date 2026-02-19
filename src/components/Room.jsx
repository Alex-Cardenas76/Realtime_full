import { useEffect, useState } from 'react'
import './Room.css'

export default function Room({ room, session, onLeaveRoom }) {
  // Mock members: start with the current user
  const [members, setMembers] = useState(room.members || [])
  
  useEffect(() => {
    // Si la sala viene como activa desde mock, aseguramos al menos otro usuario simulado
    if (room.status === 'active' && members.length < 2) {
      if (!members.includes('mock_user@demo.com')) {
         // Mock logic
      }
    }
    
    if (!members.includes(session.user.email)) {
      setMembers([...members, session.user.email])
    }
  }, [room, session.user.email])

  useEffect(() => {
    const canvas = document.getElementById('stars');
    if (!canvas) return; // Guard clause in case component unmounts rapidly
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    for (let i = 0; i < 120; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 1.2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.15 + 0.05})`;
        ctx.fill();
    }
  }, []);

  // Lógica de estado
  const isSyncActive = members.length >= 2
  const statusClass = isSyncActive ? 'status-active' : 'status-waiting'

  const user1 = members[0]
  const user2 = members[1]
  
  return (
    <div className="room-container">
      <canvas id="stars" style={{position:'fixed', inset:0, zIndex:0, pointerEvents:'none'}} />
      <div className="room-card-wrapper large-view" style={{position: 'relative', zIndex: 1}}>
        <header className="room-header">
          <h2 className="room-title">
            {room.name}
          </h2>
          <div className={`status-dot ${statusClass} ${isSyncActive ? 'pulse' : ''}`}></div>
        </header>

        <div className="room-content">
          
          <div className="sync-avatars-container">
            {/* User 1 Box */}
            <div className="user-box occupied">
              <div className="avatar-circle">👤</div>
              <span className="user-email-label">{user1}</span>
              <span className="user-role-badge">Tú</span>
            </div>

            {/* Sync Status Center */}
            <div className="sync-status-center">
              {isSyncActive ? (
                <div className="sync-active-indicator">
                  <span className="status-dot status-active pulse"></span>
                  <span className="sync-text-active">Sincronización activa</span>
                </div>
              ) : (
                <div className="sync-waiting-indicator">
                  <span className="status-dot status-waiting"></span>
                  <span className="sync-text-waiting">Esperando usuario...</span>
                </div>
              )}
              <div className="connector-line"></div>
            </div>

            {/* User 2 Box */}
            <div className={`user-box ${user2 ? 'occupied' : 'waiting'}`}>
              <div className="avatar-circle">
                {user2 ? '👤' : '...'}
              </div>
              <span className="user-email-label">
                {user2 || 'Esperando conexión'}
              </span>
            </div>
          </div>

        </div>

        <footer className="room-footer">
          <button onClick={onLeaveRoom} className="leave-button">
            Salir de la sala
          </button>
        </footer>
      </div>
    </div>
  )
}
