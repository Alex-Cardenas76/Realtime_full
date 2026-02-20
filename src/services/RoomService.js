import { supabase } from '../lib/supabaseClient';
import { roomLogger } from '../utils/debugLogger';

export const RoomService = {
    // Create a new room
    async createRoom(name, createdBy) {
        roomLogger.info('createRoom called', { name, createdBy });

        if (!name || name.trim().length === 0) {
            const error = 'Room name is required';
            roomLogger.warn('Validation failed: Room name missing');
            return { success: false, error };
        }

        try {
            const { data, error } = await supabase
                .from('rooms')
                .insert([{ name, created_by: createdBy, status: 'waiting' }])
                .select()
                .single();

            if (error) throw error;

            roomLogger.info('Room created successfully', data);
            return { success: true, data };
        } catch (error) {
            roomLogger.error('Error creating room', error);
            return { success: false, error: error.message };
        }
    },

    // Get all rooms that are waiting or active
    async getRooms() {
        roomLogger.debug('getRooms called');
        try {
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .in('status', ['waiting', 'active'])
                .order('created_at', { ascending: false });

            if (error) throw error;

            roomLogger.info(`Fetched ${data.length} rooms`);
            return { success: true, data };
        } catch (error) {
            roomLogger.error('Error fetching rooms', error);
            return { success: false, error: error.message };
        }
    },

    // Join a room (add participant)
    async joinRoom(roomId, userId) {
        roomLogger.info('joinRoom called', { roomId, userId });

        try {
            // Validation: Check if room exists and is in 'waiting' state
            // Note: RLS policies might allow reading, but business logic requires 'waiting'
            const { data: room, error: roomError } = await supabase
                .from('rooms')
                .select('status, max_participants')
                .eq('id', roomId)
                .single();

            if (roomError) throw roomError;

            if (room.status !== 'waiting') {
                const msg = `Cannot join room with status: ${room.status}`;
                roomLogger.warn(msg);
                return { success: false, error: msg };
            }

            // Check if already joined
            const { data: existing } = await supabase
                .from('participants')
                .select('*')
                .eq('room_id', roomId)
                .eq('user_id', userId)
                .single();

            if (existing) {
                roomLogger.info('User already in room', existing);
                return { success: true, data: existing };
            }

            // Check participant count (Race condition possible here, handled by DB constraints ideally)
            const { count } = await supabase
                .from('participants')
                .select('*', { count: 'exact', head: true })
                .eq('room_id', roomId);

            if (room.max_participants && count >= room.max_participants) {
                const msg = 'Room is full';
                roomLogger.warn(msg);
                return { success: false, error: msg };
            }

            const { data, error } = await supabase
                .from('participants')
                .insert([{ room_id: roomId, user_id: userId }])
                .select()
                .single();

            if (error) throw error;

            roomLogger.info('Joined room successfully', data);
            return { success: true, data };
        } catch (error) {
            roomLogger.error('Error joining room', error);
            return { success: false, error: error.message };
        }
    },

    // Get participants for a room
    async getParticipants(roomId) {
        roomLogger.debug('getParticipants called', { roomId });
        try {
            const { data, error } = await supabase
                .from('participants')
                .select('*, users:user_id(email)') // Try to fetch email if possible, else just ID
                .eq('room_id', roomId);

            if (error) throw error;
            roomLogger.info(`Fetched ${data.length} participants for room ${roomId}`);
            return { success: true, data };
        } catch (error) {
            roomLogger.error('Error fetching participants', error);
            return { success: false, error: error.message };
        }
    },

    // Leave a room
    async leaveRoom(roomId, userId) {
        roomLogger.info('leaveRoom called', { roomId, userId });
        try {
            const { error } = await supabase
                .from('participants')
                .delete()
                .eq('room_id', roomId)
                .eq('user_id', userId);

            if (error) throw error;
            roomLogger.info('User left room successfully', { roomId, userId });
            return { success: true };
        } catch (error) {
            roomLogger.error('Error leaving room', error);
            return { success: false, error: error.message };
        }
    },

    // Update room status (e.g. start game)
    async updateRoomStatus(roomId, status) {
        roomLogger.info('updateRoomStatus called', { roomId, status });

        const validTransitions = {
            'waiting': ['active', 'ended'],
            'active': ['ended'],
            'ended': []
        };

        try {
            // Fetch current status first to validate transition
            const { data: currentRoom, error: currentRoomError } = await supabase
                .from('rooms')
                .select('status')
                .eq('id', roomId)
                .single();

            if (currentRoomError) throw currentRoomError;

            if (currentRoom) {
                const allowed = validTransitions[currentRoom.status] || [];
                if (!allowed.includes(status)) {
                    const msg = `Invalid status transition from ${currentRoom.status} to ${status}`;
                    roomLogger.warn(msg);
                    return { success: false, error: msg };
                }
            }

            const { data, error } = await supabase
                .from('rooms')
                .update({ status })
                .eq('id', roomId)
                .select()
                .single();

            if (error) throw error;
            roomLogger.info('Room status updated successfully', data);
            return { success: true, data };
        } catch (error) {
            roomLogger.error('Error updating status', error);
            return { success: false, error: error.message };
        }
    },

    // Realtime subscription for Rooms list
    subscribeToRooms(callback) {
        roomLogger.debug('Subscribing to public:rooms');
        return supabase
            .channel('public:rooms')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'rooms' },
                (payload) => {
                    roomLogger.debug('Room update received', payload);
                    callback(payload);
                }
            )
            .subscribe((status) => {
                roomLogger.debug(`Room subscription status: ${status}`);
            });
    },

    // Realtime subscription for a specific Room's participants
    subscribeToParticipants(roomId, callback) {
        roomLogger.debug(`Subscribing to room:${roomId} participants`);
        return supabase
            .channel(`room:${roomId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'participants', filter: `room_id=eq.${roomId}` },
                (payload) => {
                    roomLogger.debug('Participant update received', payload);
                    callback(payload);
                }
            )
            .subscribe((status) => {
                roomLogger.debug(`Participant subscription status for room ${roomId}: ${status}`);
            });
    },

    // Realtime subscription for a specific Room's details (e.g. status change)
    subscribeToRoomDetails(roomId, callback) {
        roomLogger.debug(`Subscribing to room_details:${roomId}`);
        return supabase
            .channel(`room_details:${roomId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
                (payload) => {
                    roomLogger.debug('Room details update', payload);
                    callback(payload);
                }
            )
            .subscribe((status) => {
                roomLogger.debug(`Room details subscription status for room ${roomId}: ${status}`);
            });
    }
};
