import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Auth from './components/Auth';
import CreateRoom from './components/CreateRoom';
import RoomList from './components/RoomList';
import Room from './components/Room';
import './App.css';

function App() {
    const [session, setSession] = useState(null);
    const [currentRoom, setCurrentRoom] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleJoinRoom = async (roomId) => {
        // Fetch room details to set currentRoom
        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('id', roomId)
            .single();

        if (data) setCurrentRoom(data);
    };

    const handleLeaveRoom = () => {
        setCurrentRoom(null);
    };

    if (!session) {
        return <Auth />;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>SyncRoom Dashboard</h1>
                <div className="user-profile">
                    <span>{session.user.email}</span>
                    <button className="sign-out-btn" onClick={() => supabase.auth.signOut()}>
                        Sign Out
                    </button>
                </div>
            </header>

            <main className="dashboard-main">
                {currentRoom ? (
                    <Room room={currentRoom} session={session} onLeave={handleLeaveRoom} />
                ) : (
                    <div className="lobby-container">
                        <div className="welcome-section">
                            <h2>Welcome back!</h2>
                            <p>Ready to jump into a new match?</p>
                        </div>

                        <div className="lobby-grid">
                            <CreateRoom session={session} onRoomCreated={(room) => setCurrentRoom(room)} />
                            <RoomList session={session} onJoinRoom={handleJoinRoom} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
