import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO
# Removido: imports de src.* e banco de dados inexistentes
from multiplayer import multiplayer_bp, init_socketio

# Servir estáticos a partir da raiz do projeto
app = Flask(__name__, static_folder=os.path.dirname(__file__))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Configurar CORS para permitir requisições do frontend
CORS(app, resources={r'/*': {'origins': '*'}})

# Inicializar SocketIO
socketio = SocketIO(app, cors_allowed_origins='*', async_mode='eventlet')

# Registrar blueprints
app.register_blueprint(multiplayer_bp, url_prefix='/api')

# Inicializar eventos do SocketIO
init_socketio(socketio)

# Rota para servir SPA
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return 'Static folder not configured', 404

    requested_path = os.path.join(static_folder_path, path)
    if path != '' and os.path.exists(requested_path) and os.path.isfile(requested_path):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return 'index.html not found', 404


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5050'))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
