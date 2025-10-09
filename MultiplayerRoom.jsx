import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Users, Wifi, Copy, LogOut, Play, Crown } from 'lucide-react'
import { useSocket } from './useSocket.js'

const MultiplayerRoom = ({ onStartGame, onLeave }) => {
  const [playerName, setPlayerName] = useState('')
  const [roomCodeInput, setRoomCodeInput] = useState('')
  const [currentRoom, setCurrentRoom] = useState(null)
  const [playersInRoom, setPlayersInRoom] = useState([])
  const [isHost, setIsHost] = useState(false)
  const [selectedGameType, setSelectedGameType] = useState('attention')
  const [gameStarted, setGameStarted] = useState(false)

  const { socket, isConnected, sessionId, createRoom, joinRoom, leaveRoom, startGame, on } = useSocket()

  // Jogos disponíveis para multiplayer
  const availableGames = [
    { id: 'attention', name: 'Jogo de Atenção', icon: '👁️' },
    { id: 'sequence', name: 'Jogo de Sequência', icon: '🔢' },
    { id: 'organization', name: 'Jogo de Organização', icon: '📁' },
    { id: 'focus-training', name: 'Treino de Foco', icon: '🎯' },
    { id: 'reaction-time', name: 'Tempo de Reação', icon: '⚡' },
    { id: 'sustained-attention', name: 'Atenção Sustentada', icon: '🧠' }
  ]

  useEffect(() => {
    if (!socket) return

    const disconnectHandler = () => {
      console.log('🔌 Desconectado do servidor WebSocket')
      console.log('🔌 Resetando currentRoom de', currentRoom, 'para null')
      setCurrentRoom(null)
      setPlayersInRoom([])
      setIsHost(false)
    }

    const roomCreatedHandler = (data) => {
      console.log('🏗️ roomCreatedHandler - definindo currentRoom para:', data.room_code)
      setCurrentRoom(data.room_code)
      setPlayersInRoom(data.room_data?.players || [])
      // Verificar se o jogador atual é o host
      const currentPlayer = data.room_data?.players?.find(p => p.session_id === sessionId)
      setIsHost(currentPlayer?.is_host || false)
      console.log(`Sala criada: ${data.room_code}`)
    }

    const roomJoinedHandler = (data) => {
      console.log('🚪 roomJoinedHandler - definindo currentRoom para:', data.room_code)
      setCurrentRoom(data.room_code)
      setPlayersInRoom(data.room_data?.players || [])
      // Verificar se o jogador atual é o host
      const currentPlayer = data.room_data?.players?.find(p => p.session_id === sessionId)
      setIsHost(currentPlayer?.is_host || false)
      console.log(`Entrou na sala: ${data.room_code}`)
    }

    const playerJoinedHandler = (data) => {
      console.log('👤 playerJoinedHandler - currentRoom atual:', currentRoom)
      setPlayersInRoom(data.players || [])
      // Verificar se o jogador atual é o host
      const currentPlayer = data.players?.find(p => p.session_id === sessionId)
      setIsHost(currentPlayer?.is_host || false)
      if (data.player?.name) {
        console.log(`${data.player.name} entrou na sala.`)
      }
    }

    const playerLeftHandler = (data) => {
      console.log('🚶 playerLeftHandler - currentRoom atual:', currentRoom)
      console.log('🚶 playerLeftHandler - mantendo currentRoom como:', currentRoom)
      setPlayersInRoom(data.players || [])
      // Verificar se o jogador atual é o host (pode ter sido promovido)
      const currentPlayer = data.players?.find(p => p.session_id === sessionId)
      setIsHost(currentPlayer?.is_host || false)
      console.log('Um jogador saiu da sala.')
    }

    const gameStartedHandler = (data) => {
      console.log('🎮 Jogo iniciado no MultiplayerRoom!', data)
      console.log('🏠 currentRoom:', currentRoom)
      console.log('🎯 selectedGameType:', selectedGameType)
      console.log('📦 room_code do evento:', data.room_code)
      
      setGameStarted(true)
      if (typeof onStartGame === 'function') {
        const gameData = {
          ...data,
          roomCode: data.room_code || currentRoom, // Usar room_code do evento como fallback
          gameType: selectedGameType
        }
        console.log('📤 Enviando dados para App.jsx:', gameData)
        onStartGame(gameData)
      }
    }

    const leftRoomHandler = () => {
      console.log('Você saiu da sala.')
    }

    const errorHandler = (error) => {
      const msg = error?.message || 'Ocorreu um erro.'
      console.error('Erro de sala:', msg)
      alert(msg)
    }

    const cleanups = [
      on('disconnect', disconnectHandler),
      on('room_created', roomCreatedHandler),
      on('room_joined', roomJoinedHandler),
      on('player_joined', playerJoinedHandler),
      on('player_left', playerLeftHandler),
      on('game_started', gameStartedHandler),
      on('left_room', leftRoomHandler),
      on('error', errorHandler),
    ]

    return () => {
      cleanups.forEach((fn) => fn && fn())
    }
  }, [socket, on, onStartGame, sessionId])

  const handleCreateRoom = () => {
    if (!playerName.trim() || !isConnected) return
    createRoom(playerName.trim(), selectedGameType)
  }

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCodeInput.trim() || !isConnected) return
    joinRoom(roomCodeInput.trim(), playerName.trim())
  }

  const handleLeaveRoom = () => {
    if (!currentRoom || !isConnected) return
    try {
      leaveRoom(currentRoom)
    } finally {
      setCurrentRoom(null)
      setPlayersInRoom([])
      setIsHost(false)
      setPlayerName('')
      setRoomCodeInput('')
      if (typeof onLeave === 'function') onLeave()
    }
  }

  const handleStartGame = () => {
    if (!currentRoom || !isHost || !isConnected) return
    startGame(currentRoom)
  }

  const copyRoomCode = () => {
    if (!currentRoom) return
    navigator.clipboard.writeText(currentRoom)
    alert(`Código da sala copiado: ${currentRoom}`)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-purple-900 border-2 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Users className="w-8 h-8" />
              Sala Multiplayer
            </CardTitle>
            <Badge variant={isConnected ? 'default' : 'destructive'} className="text-lg px-4 py-2">
              <Wifi className="w-4 h-4 mr-2" />
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
          <CardDescription className="text-base mt-2">
            Crie uma nova sala ou entre em uma existente para jogar com amigos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!currentRoom ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="playerName">Seu Nome</Label>
                <Input
                  id="playerName"
                  placeholder="Digite seu nome"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  disabled={!isConnected}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gameType">Tipo de Jogo</Label>
                <select
                  id="gameType"
                  value={selectedGameType}
                  onChange={(e) => setSelectedGameType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                  disabled={!isConnected}
                >
                  {availableGames.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.icon} {game.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-purple-50 dark:bg-gray-700 border-purple-200 dark:border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-xl">Criar Nova Sala</CardTitle>
                    <CardDescription>Seja o anfitrião e convide amigos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleCreateRoom} className="w-full" disabled={!playerName.trim() || !isConnected}>
                      <Crown className="w-5 h-5 mr-2" />
                      Criar Sala
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-pink-50 dark:bg-gray-700 border-pink-200 dark:border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-xl">Entrar em Sala</CardTitle>
                    <CardDescription>Use o código compartilhado</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Código da sala"
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value)}
                      disabled={!isConnected}
                    />
                    <Button onClick={handleJoinRoom} className="w-full" disabled={!playerName.trim() || !roomCodeInput.trim() || !isConnected}>
                      <Users className="w-5 h-5 mr-2" />
                      Entrar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg shadow-inner">
                <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                  Sala: {currentRoom}
                </h3>
                <div className="flex gap-2">
                  <Button onClick={copyRoomCode} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Código
                  </Button>
                  <Button onClick={handleLeaveRoom} variant="destructive" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow">
                <h4 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Jogadores na Sala</h4>
                <ul className="space-y-2">
                  {playersInRoom.map((player, index) => (
                    <li key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                      <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        {player.name} {player.session_id === sessionId && '(Você)'}
                      </span>
                      {player.is_host && <Crown className="w-5 h-5 text-yellow-500" title="Anfitrião" />}
                    </li>
                  ))}
                </ul>
              </div>

              {isHost && playersInRoom.length > 1 && (
                <Button onClick={handleStartGame} className="w-full" size="lg">
                  <Play className="w-5 h-5 mr-2" />
                  Iniciar Jogo
                </Button>
              )}

              {!isHost && (
                <div className="text-center text-gray-600 dark:text-gray-400 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-lg">Aguardando o anfitrião iniciar o jogo...</p>
                </div>
              )}

              {isHost && playersInRoom.length <= 1 && (
                <div className="text-center text-gray-600 dark:text-gray-400 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-lg">Aguardando mais jogadores...</p>
                  <p className="text-sm mt-2">Compartilhe o código da sala <strong>{currentRoom}</strong> com seus amigos para que eles possam entrar e jogar juntos!</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default MultiplayerRoom
