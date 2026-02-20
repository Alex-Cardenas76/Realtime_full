import { useState, useEffect } from 'react';
import { RoomService } from '../services/RoomService';
import { Users, Play, LogOut } from 'lucide-react';

export default function Room({ room, session, onLeave }) {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const isCreator = room.created_by === session.user.id;

    useEffect(() => {
        fetchParticipants();

        // Subscribe to participant changes (joins/leaves)
        const participantSub = RoomService.subscribeToParticipants(room.id, (payload) => {
            if (payload.eventType === 'INSERT') {
                // For now, we only have user_id. ideally we'd fetch profile. 
                // We will just add the raw payload for now to update the count/list
                setParticipants((prev) => [...prev, payload.new]);
            } else if (payload.eventType === 'DELETE') {
                setParticipants((prev) => prev.filter((p) => p.user_id !== payload.old.user_id));
            }
        });

        // Subscribe to room status changes (e.g. game started)
        const roomSub = RoomService.subscribeToRoomDetails(room.id, (payload) => {
            if (payload.new.status === 'active') {
                alert('Game Started! (Logic to be implemented)');
            }
        });

        return () => {
            participantSub.unsubscribe();
            roomSub.unsubscribe();
        };
    }, [room.id]);

    const fetchParticipants = async () => {
        try {
            const response = await RoomService.getParticipants(room.id);
            if (response.success) {
                setParticipants(response.data);
            } else {
                console.error('Error fetching participants:', response.error);
            }
        } catch (error) {
            console.error('Unexpected error fetching participants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartGame = async () => {
        try {
            const response = await RoomService.updateRoomStatus(room.id, 'active');
            if (!response.success) {
                alert(response.error);
            }
        } catch (error) {
            console.error('Error starting game:', error);
        }
    };

    const handleLeave = async () => {
        try {
            const response = await RoomService.leaveRoom(room.id, session.user.id);
            if (response.success) {
                onLeave();
            } else {
                console.error('Error leaving room:', response.error);
            }
        } catch (error) {
            console.error("Error leaving room", error);
        }
    };

    return (
        <div className="room-view">
            <div className="room-header">
                <h2>{room.name}</h2>
                <span className="room-id">ID: {room.id.slice(0, 8)}...</span>
                <span className={`status-badge ${room.status}`}>{room.status}</span>
            </div>

            <div className="participants-section">
                <h3>Participants ({participants.length})</h3>
                <ul className="participants-list">
                    {participants.map((p) => (
                        <li key={p.id} className="participant-item">
                            <Users size={16} />
                            <span>{p.user_id === session.user.id ? 'You' : `User ${p.user_id.slice(0, 4)}`}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="room-actions">
                {isCreator && room.status === 'waiting' && (
                    <button onClick={handleStartGame} className="start-btn">
                        <Play size={18} /> Start Match
                    </button>
                )}
                <button onClick={handleLeave} className="leave-btn">
                    <LogOut size={18} /> Leave Room
                </button>
            </div>
        </div>
    );
}
