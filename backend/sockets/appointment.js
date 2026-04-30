export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join personal room when user authenticates
    socket.on('join', ({ userId, role }) => {
      socket.join(`${role}_${userId}`);
      console.log(`👤 User ${userId} (${role}) joined room`);
    });

    // Doctor joins their room to receive appointment notifications
    socket.on('join-doctor', ({ doctorId }) => {
      socket.join(`doctor_${doctorId}`);
    });

    // Patient joins their room for status updates
    socket.on('join-patient', ({ patientId }) => {
      socket.join(`patient_${patientId}`);
    });

    // Appointment status change broadcast
    socket.on('appointment-status-change', ({ appointmentId, status, patientId, doctorId }) => {
      io.to(`patient_${patientId}`).emit('appointment-updated', { appointmentId, status });
      io.to(`doctor_${doctorId}`).emit('appointment-updated', { appointmentId, status });
    });

    // Typing indicator for chat (optional real-time feature)
    socket.on('typing', ({ roomId }) => {
      socket.to(roomId).emit('user-typing');
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};
