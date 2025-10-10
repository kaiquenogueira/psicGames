import os
import sys
import mimetypes
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO
# Removido: imports de src.* e banco de dados inexistentes
from multiplayer import multiplayer_bp, init_socketio

# Configurar MIME types corretos
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

# Base path opcional (para quando o app está atrás de proxy com subpath)
BASE_PATH = os.environ.get('APP_BASE_PATH', '').strip('/')

# Servir estáticos a partir da pasta dist/
dist_folder = os.path.join(os.path.dirname(__file__), 'dist')
app = Flask(__name__, static_folder=dist_folder)
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Configurar CORS para permitir requisições do frontend
CORS(app, resources={r'/*': {'origins': '*'}})

# Inicializar SocketIO
socketio = SocketIO(app, cors_allowed_origins='*', async_mode='eventlet')

# Registrar blueprints
app.register_blueprint(multiplayer_bp, url_prefix='/api')

# Inicializar eventos do SocketIO
init_socketio(socketio)

# Helper para remover prefixo de base path
def strip_base_path(path):
    if not BASE_PATH:
        return path
    if path == BASE_PATH or path == BASE_PATH + '/':
        return ''
    if path.startswith(BASE_PATH + '/'):
        return path[len(BASE_PATH) + 1:]
    return path

# Rota explícita para assets gerados pelo Vite
@app.route('/assets/<path:filename>')
def serve_asset(filename):
    assets_path = os.path.join(app.static_folder, 'assets')
    requested = os.path.join(assets_path, filename)
    if os.path.exists(requested) and os.path.isfile(requested):
        return send_from_directory(assets_path, filename)
    return 'Asset not found', 404

# Rota para favicon (absoluto)
@app.route('/favicon.ico')
@app.route('/favicon.svg')
def favicon():
    return send_from_directory(os.path.dirname(__file__), 'favicon.svg')

# Rota para servir SPA e ativos considerando subpath
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # Considerar subpath
    effective_path = strip_base_path(path)

    # Servir favicon quando em subpath
    if effective_path in ('favicon.ico', 'favicon.svg'):
        return send_from_directory(os.path.dirname(__file__), 'favicon.svg')

    static_folder_path = app.static_folder
    if static_folder_path is None:
        return 'Static folder not configured', 404

    # Caminho solicitado dentro de dist/
    requested_path = os.path.join(static_folder_path, effective_path)

    # Se for um arquivo dentro de dist (inclui assets/*)
    if effective_path != '' and os.path.exists(requested_path) and os.path.isfile(requested_path):
        return send_from_directory(static_folder_path, effective_path)
    else:
        # Sempre retornar index.html para rotas SPA
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return 'index.html not found', 404


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5050'))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
