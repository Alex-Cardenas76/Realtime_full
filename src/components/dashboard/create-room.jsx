import { useState } from 'react';
import { RoomService } from '../../services/room-service';
import { Plus, Loader2 } from 'lucide-react';

export default function CreateRoom({ session, onRoomCreated }) {
    const [roomName, setRoomName] = useState('');
    const [category, setCategory] = useState('General');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const categories = ['General', 'Gaming', 'Casual', 'Technical', 'Social'];

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!roomName.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await RoomService.createRoom(roomName, category);
            if (response.success) {
                if (onRoomCreated) {
                    onRoomCreated(response.data);
                }
                setRoomName(''); // Reset form
                setCategory('General');
            } else {
                setError(response.error);
            }
        } catch (err) {
            console.error('Error creating room:', err);
            setError('Error al crear la sala. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-room-card">
            <h3>Crear una Nueva Sala</h3>
            <form onSubmit={handleCreateRoom} className="create-room-form">
                <input
                    type="text"
                    placeholder="Escribe el nombre de la sala..."
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    disabled={loading}
                    className="room-input"
                />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={loading}
                    className="room-input"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <button type="submit" disabled={loading || !roomName.trim()} className="create-btn">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                    Crear
                </button>
            </form>
            {error && <p className="error-text">{error}</p>}
        </div>
    );
}
