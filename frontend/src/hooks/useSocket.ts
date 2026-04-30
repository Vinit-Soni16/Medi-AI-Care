import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    if (!socketInstance) {
      let socketUrl = import.meta.env.VITE_API_URL || undefined;
      if (socketUrl && socketUrl.endsWith('/api')) {
        socketUrl = socketUrl.replace(/\/api$/, '');
      }
      socketInstance = io(socketUrl, { transports: ['websocket', 'polling'] });
    }
    socketRef.current = socketInstance;

    // Join personal room
    socketInstance.emit('join', { userId: user._id, role: user.role });
    if (user.role === 'doctor') {
      socketInstance.emit('join-doctor', { doctorId: user._id });
    } else if (user.role === 'patient') {
      socketInstance.emit('join-patient', { patientId: user._id });
    }

    // Listen for appointment events
    socketInstance.on('appointment-booked', (data) => {
      addNotification({
        title: 'New Appointment',
        message: data.message || 'A new appointment has been booked.',
        type: 'info',
      });
    });

    socketInstance.on('appointment-updated', (data) => {
      addNotification({
        title: 'Appointment Update',
        message: data.message || `Appointment status changed to ${data.status}`,
        type: data.status === 'confirmed' ? 'success' : 'warning',
      });
    });

    return () => {
      socketInstance?.off('appointment-booked');
      socketInstance?.off('appointment-updated');
    };
  }, [user, addNotification]);

  const emit = useCallback((event: string, data: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { socket: socketRef.current, emit };
};
