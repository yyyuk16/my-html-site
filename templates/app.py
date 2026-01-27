from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__, static_folder='templates', static_url_path='')
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ai')
@app.route('/ai.html')
def ai():
    return render_template('ai.html')

@app.route('/score')
@app.route('/score.html')
def score():
    return render_template('score.html')

@app.route('/movie')
@app.route('/movie.html')
def movie():
    return render_template('movie.html')

@app.route('/setting')
@app.route('/setting.html')
def setting():
    return render_template('setting.html')

@app.route('/user')
def user_chat():
    return render_template('user_chat.html')

@socketio.on('message')
def handle_message(msg):
    emit('message', msg, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
