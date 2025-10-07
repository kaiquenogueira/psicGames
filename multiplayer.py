from flask import Blueprint, jsonify, request
from flask_socketio import emit, join_room, leave_room, rooms
import random
import string

multiplayer_bp = Blueprint('multiplayer', __name__)

# Armazenar salas em memória (em produção, use Redis ou banco de dados)
rooms_data = {}

def generate_room_code():
    """Gera um código único de sala de 6 caracteres"""
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if code not in rooms_data:
            return code

def init_socketio(socketio):
    """Inicializa os eventos do SocketIO"""
    
    @socketio.on('connect')
    def handle_connect():
        print(f'Cliente conectado: {request.sid}')
        emit('connected', {'session_id': request.sid})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        print(f'Cliente desconectado: {request.sid}')
        # Remover jogador de todas as salas
        for room_code, room_data in list(rooms_data.items()):
            players = room_data.get('players', [])
            room_data['players'] = [p for p in players if p['session_id'] != request.sid]
            
            if len(room_data['players']) == 0:
                # Sala vazia, remover
                del rooms_data[room_code]
            else:
                # Notificar outros jogadores
                emit('player_left', {
                    'room_code': room_code,
                    'players': room_data['players']
                }, room=room_code)
    
    @socketio.on('create_room')
    def handle_create_room(data):
        """Cria uma nova sala"""
        player_name = data.get('player_name', 'Jogador')
        game_type = data.get('game_type', 'memory')
        
        room_code = generate_room_code()
        
        player = {
            'session_id': request.sid,
            'name': player_name,
            'score': 0,
            'is_host': True
        }
        
        rooms_data[room_code] = {
            'code': room_code,
            'host': request.sid,
            'game_type': game_type,
            'players': [player],
            'game_state': {},
            'started': False
        }
        
        join_room(room_code)
        
        emit('room_created', {
            'room_code': room_code,
            'player': player,
            'room_data': rooms_data[room_code]
        })
        
        print(f'Sala criada: {room_code} por {player_name}')
    
    @socketio.on('join_room')
    def handle_join_room(data):
        """Entra em uma sala existente"""
        room_code = data.get('room_code', '').upper()
        player_name = data.get('player_name', 'Jogador')
        
        if room_code not in rooms_data:
            emit('error', {'message': 'Sala não encontrada'})
            return
        
        room_data = rooms_data[room_code]
        
        if room_data['started']:
            emit('error', {'message': 'Jogo já iniciado'})
            return
        
        # Verificar se já existe um jogador com este session_id
        existing_player = next((p for p in room_data['players'] if p['session_id'] == request.sid), None)
        
        if existing_player:
            emit('error', {'message': 'Você já está nesta sala'})
            return
        
        player = {
            'session_id': request.sid,
            'name': player_name,
            'score': 0,
            'is_host': False
        }
        
        room_data['players'].append(player)
        join_room(room_code)
        
        # Notificar o jogador que entrou
        emit('room_joined', {
            'room_code': room_code,
            'player': player,
            'room_data': room_data
        })
        
        # Notificar todos na sala sobre o novo jogador
        emit('player_joined', {
            'player': player,
            'players': room_data['players']
        }, room=room_code)
        
        print(f'{player_name} entrou na sala {room_code}')
    
    @socketio.on('leave_room_request')
    def handle_leave_room(data):
        """Sai de uma sala"""
        room_code = data.get('room_code', '').upper()
        
        if room_code not in rooms_data:
            return
        
        room_data = rooms_data[room_code]
        room_data['players'] = [p for p in room_data['players'] if p['session_id'] != request.sid]
        
        leave_room(room_code)
        
        if len(room_data['players']) == 0:
            del rooms_data[room_code]
            print(f'Sala {room_code} removida (vazia)')
        else:
            # Se o host saiu, promover outro jogador
            if room_data['host'] == request.sid and len(room_data['players']) > 0:
                room_data['host'] = room_data['players'][0]['session_id']
                room_data['players'][0]['is_host'] = True
            
            emit('player_left', {
                'players': room_data['players']
            }, room=room_code)
        
        emit('left_room', {'room_code': room_code})
    
    @socketio.on('start_game')
    def handle_start_game(data):
        """Inicia o jogo na sala"""
        room_code = data.get('room_code', '').upper()
        
        if room_code not in rooms_data:
            emit('error', {'message': 'Sala não encontrada'})
            return
        
        room_data = rooms_data[room_code]
        
        # Verificar se é o host
        if room_data['host'] != request.sid:
            emit('error', {'message': 'Apenas o anfitrião pode iniciar o jogo'})
            return
        
        room_data['started'] = True
        
        # Notificar todos na sala
        emit('game_started', {
            'game_type': room_data['game_type'],
            'players': room_data['players']
        }, room=room_code)
        
        print(f'Jogo iniciado na sala {room_code}')
    
    @socketio.on('update_game_state')
    def handle_update_game_state(data):
        """Atualiza o estado do jogo"""
        room_code = data.get('room_code', '').upper()
        game_state = data.get('game_state', {})
        
        if room_code not in rooms_data:
            return
        
        rooms_data[room_code]['game_state'] = game_state
        
        # Notificar todos na sala (exceto o remetente)
        emit('game_state_updated', {
            'game_state': game_state
        }, room=room_code, skip_sid=request.sid)
    
    @socketio.on('update_score')
    def handle_update_score(data):
        """Atualiza a pontuação de um jogador"""
        room_code = data.get('room_code', '').upper()
        score = data.get('score', 0)
        
        if room_code not in rooms_data:
            return
        
        room_data = rooms_data[room_code]
        
        # Atualizar pontuação do jogador
        for player in room_data['players']:
            if player['session_id'] == request.sid:
                player['score'] = score
                break
        
        # Notificar todos na sala
        emit('score_updated', {
            'players': room_data['players']
        }, room=room_code)
    
    @socketio.on('game_action')
    def handle_game_action(data):
        """Sincroniza ações do jogo entre jogadores"""
        room_code = data.get('room_code', '').upper()
        action_type = data.get('action_type')
        action_data = data.get('action_data', {})
        
        if room_code not in rooms_data:
            return
        
        # Notificar todos na sala sobre a ação
        emit('game_action_received', {
            'player_id': request.sid,
            'action_type': action_type,
            'action_data': action_data
        }, room=room_code, skip_sid=request.sid)
    
    @socketio.on('game_completed')
    def handle_game_completed(data):
        """Marca o jogo como completo para um jogador"""
        room_code = data.get('room_code', '').upper()
        final_score = data.get('final_score', 0)
        completion_time = data.get('completion_time', 0)
        
        if room_code not in rooms_data:
            return
        
        room_data = rooms_data[room_code]
        
        # Atualizar dados do jogador
        for player in room_data['players']:
            if player['session_id'] == request.sid:
                player['score'] = final_score
                player['completed'] = True
                player['completion_time'] = completion_time
                break
        
        # Verificar se todos completaram
        all_completed = all(p.get('completed', False) for p in room_data['players'])
        
        # Notificar todos na sala
        emit('player_completed', {
            'player_id': request.sid,
            'final_score': final_score,
            'completion_time': completion_time,
            'all_completed': all_completed,
            'players': room_data['players']
        }, room=room_code)
        
        if all_completed:
            # Determinar vencedor
            winner = max(room_data['players'], key=lambda p: p.get('score', 0))
            emit('game_finished', {
                'winner': winner,
                'final_rankings': sorted(room_data['players'], key=lambda p: p.get('score', 0), reverse=True)
            }, room=room_code)
    
    @socketio.on('reset_game')
    def handle_reset_game(data):
        """Reinicia o jogo na sala"""
        room_code = data.get('room_code', '').upper()
        
        if room_code not in rooms_data:
            return
        
        room_data = rooms_data[room_code]
        
        # Verificar se é o host
        if room_data['host'] != request.sid:
            emit('error', {'message': 'Apenas o anfitrião pode reiniciar o jogo'})
            return
        
        # Resetar estado dos jogadores
        for player in room_data['players']:
            player['score'] = 0
            player['completed'] = False
            player.pop('completion_time', None)
        
        room_data['started'] = False
        room_data['game_state'] = {}
        
        # Notificar todos na sala
        emit('game_reset', {
            'players': room_data['players']
        }, room=room_code)
        
        print(f'Jogo reiniciado na sala {room_code}')

@multiplayer_bp.route('/rooms', methods=['GET'])
def get_rooms():
    """Retorna todas as salas disponíveis"""
    available_rooms = [
        {
            'code': room_code,
            'game_type': room_data['game_type'],
            'players_count': len(room_data['players']),
            'started': room_data['started']
        }
        for room_code, room_data in rooms_data.items()
        if not room_data['started']
    ]
    return jsonify({'rooms': available_rooms})

@multiplayer_bp.route('/room/<room_code>', methods=['GET'])
def get_room(room_code):
    """Retorna informações de uma sala específica"""
    room_code = room_code.upper()
    if room_code not in rooms_data:
        return jsonify({'error': 'Sala não encontrada'}), 404
    
    return jsonify({'room': rooms_data[room_code]})
