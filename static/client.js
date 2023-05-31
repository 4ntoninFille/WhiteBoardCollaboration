// Connect to the server using Socket.IO
const socket = io.connect('http://192.168.1.36:5000/drawing');

// Store drawing actions for each user

socket.on('drawingActions', (data) => {
  console.log(data);
  Object.assign(drawingActions, data);
  renderDrawing();
});

// Listen for drawing actions from the server
socket.on('drawingAction', (data) => {
  const { userId, action } = data;
  if (userId !== socket.id) {
    // Only render the drawing action if it's from a different user
    if (!drawingActions[userId]) {
      drawingActions[userId] = [];
    }
    drawingActions[userId].push(action);
    renderDrawing(userId);
  }
});
// Rest of the code...
