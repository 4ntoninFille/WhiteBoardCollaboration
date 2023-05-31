const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let isDrawing = false;
const drawingActions = {};

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);

function startDrawing(event) {
  isDrawing = true;
  const { offsetX, offsetY } = event;
  const currentPosition = { type: 'start', x: offsetX, y: offsetY };
  
  // Add the starting position to the drawing actions for the current user
  if (!drawingActions[socket.id]) {
    drawingActions[socket.id] = [];
  }
  drawingActions[socket.id].push(currentPosition);
  
  // Emit drawing action to the server
  socket.emit('drawingAction', { userId: socket.id, action: currentPosition });
}

function draw(event) {
  if (!isDrawing) return;
  const { offsetX, offsetY } = event;
  const userActions = drawingActions[socket.id] || [];

  const previousPosition = userActions[userActions.length - 1];
  const currentPosition = { type: 'draw', x: offsetX, y: offsetY };

  // Check if the previous and current positions are the same to avoid adding duplicate points
  if (!isEqual(previousPosition, currentPosition)) {
    userActions.push(currentPosition);
    drawingActions[socket.id] = userActions;
    renderDrawing(socket.id);

    // Emit drawing action to the server
    socket.emit('drawingAction', { userId: socket.id, action: currentPosition });
  }
}

function stopDrawing() {
  isDrawing = false;
}

function renderDrawing(userId) {
  const userActions = drawingActions[userId];
  if (!userActions) return;

  // context.clearRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = stringToColour(userId);
  context.lineWidth = 2;

  context.beginPath();

  for (let i = 0; i < userActions.length; i++) {
    const action = userActions[i];
    const { type, x, y } = action;

    if (type === 'start') {
      context.moveTo(x, y);
    } else if (type === 'draw') {
      context.lineTo(x, y);
    }
  }

  context.stroke();
}




function isEqual(pos1, pos2) {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

var stringToColour = function(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

// Rest of the code...
