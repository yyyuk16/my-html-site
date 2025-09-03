from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ai')
def ai_chat():
    return render_template('ai_chat.html')

@app.route('/user')
def user_chat():
    return render_template('user_chat.html')

@socketio.on('message')
def handle_message(msg):
    emit('message', msg, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
