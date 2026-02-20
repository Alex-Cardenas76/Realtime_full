import { useState, useEffect } from 'react';
import { RoomService } from '../services/RoomService';
import { Users, LogIn } from 'lucide-react';

export default function RoomList({ session, onJoinRoom }) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRooms();

        // Subscribe to realtime updates for new rooms or status changes
        const subscription = RoomService.subscribeToRooms((payload) => {
            if (payload.eventType === 'INSERT') {
                setRooms((prev) => [payload.new, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
                setRooms((prev) =>
                    prev.map((room) => (room.id === payload.new.id ? payload.new : room))
                );
            } else if (payload.eventType === 'DELETE') {
                setRooms((prev) => prev.filter((room) => room.id !== payload.old.id));
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await RoomService.getRooms();
            if (response.success) {
                setRooms(response.data);
            } else {
                console.error('Error fetching rooms:', response.error);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (roomId) => {
        try {
            const response = await RoomService.joinRoom(roomId, session.user.id);
            if (response.success) {
                onJoinRoom(roomId);
            } else {
                alert(response.error);
            }
        } catch (error) {
            console.error('Error joining room:', error);
            alert('Failed to join room.');
        }
    };

    if (loading) return <p>Loading rooms...</p>;

    return (
        <div className="room-list">
            <h3>Available Rooms</h3>
            {rooms.length === 0 ? (
                <p>No active rooms. Create one to get started!</p>
            ) : (
                <ul className="rooms-grid">
                    {rooms.map((room) => (
                        <li key={room.id} className="room-card">
                            <div className="room-info">
                                <h4>{room.name}</h4>
                                <span className={`status-badge ${room.status}`}>{room.status}</span>
                            </div>
                            <button onClick={() => handleJoin(room.id)} className="join-btn">
                                <LogIn size={16} /> Join
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
