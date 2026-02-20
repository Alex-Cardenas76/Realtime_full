import { useState } from 'react';
import { RoomService } from '../services/RoomService';
import { Plus, Loader2 } from 'lucide-react';

export default function CreateRoom({ session, onRoomCreated }) {
    const [roomName, setRoomName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!roomName.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await RoomService.createRoom(roomName, session.user.id);
            if (response.success) {
                if (onRoomCreated) {
                    onRoomCreated(response.data);
                }
                setRoomName(''); // Reset form
            } else {
                setError(response.error);
            }
        } catch (err) {
            console.error('Error creating room:', err);
            setError('Failed to create room. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-room-card">
            <h3>Create a New Room</h3>
            <form onSubmit={handleCreateRoom} className="create-room-form">
                <input
                    type="text"
                    placeholder="Enter room name..."
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    disabled={loading}
                    className="room-input"
                />
                <button type="submit" disabled={loading || !roomName.trim()} className="create-btn">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                    Create
                </button>
            </form>
            {error && <p className="error-text">{error}</p>}
        </div>
    );
}
