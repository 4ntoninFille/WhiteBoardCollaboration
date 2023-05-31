from flask import Flask, render_template
from flask_socketio import SocketIO, emit, Namespace, disconnect
from flask_socketio import Namespace, join_room, leave_room
from flask_socketio import flask



app = Flask(__name__, template_folder='./', static_folder='static')
app.config['SECRET_KEY'] = 'secret_key'
socketio = SocketIO(app, async_mode='gevent')

# Keep track of users' drawing actions
usersDrawingActions = {}

ip_address = '0.0.0.0'  # Use '0.0.0.0' to bind to all available network interfaces
port = 5000  #

class DrawingNamespace(Namespace):
    def on_connect(self):
        print('Client connected:', flask.request.sid)
        print(usersDrawingActions)

    def on_disconnect(self):
        print('Client disconnected:', flask.request.sid)
        # Remove the user's drawing actions when they disconnect
        if flask.request.sid in usersDrawingActions:
            del usersDrawingActions[flask.request.sid]

    def on_drawingAction(self, data):
        # Get the user ID and drawing action from the data
        userId = flask.request.sid
        action = data['action']


        # Add the drawing action to the user's drawing actions
        if userId not in usersDrawingActions:
            usersDrawingActions[userId] = []
        usersDrawingActions[userId].append(action)

        # Broadcast the drawing action to all connected clients
        emit('drawingAction', {'userId': userId, 'action': action}, broadcast=True)

# Register the namespace
socketio.on_namespace(DrawingNamespace('/drawing'))

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    socketio.run(app, host=ip_address, port=port, debug=True)
