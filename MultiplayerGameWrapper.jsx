import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Trophy, Users, Clock, Target } from 'lucide-react'
import { useSocket } from './useSocket.js'

const MultiplayerGameWrapper = ({ 
  GameComponent, 
  gameType, 
  roomCode, 
  onGameEnd, 
  onLeaveRoom 
}) => {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [players, setPlayers] = useState([])
  const [gameStartTime, setGameStartTime] = useState(null)
  const [finalScore, setFinalScore] = useState(0)
  const [rankings, setRankings] = useState([])
  const [winner, setWinner] = useState(null)

  const { 
    socket, 
    isConnected, 
    sessionId, 
    updateScore, 
    sendGameAction, 
    completeGame, 
    resetGame, 
    on 
  } = useSocket()

  // Handlers para eventos do socket
  useEffect(() => {
    console.log('🔧 MultiplayerGameWrapper useEffect - socket:', !!socket, 'roomCode:', roomCode)
    if (!socket || !roomCode) return

    const gameStartedHandler = (data) => {
      console.log('🎮 Evento game_started recebido no MultiplayerGameWrapper:', data)
      console.log('🎮 Estado atual gameStarted:', gameStarted)
      console.log('🎮 Dados dos jogadores:', data.players)
      setGameStarted(true)
      setGameStartTime(Date.now())
      setPlayers(data.players || [])
      console.log('🎮 gameStarted definido como true - novo estado será aplicado')
    }

    const scoreUpdatedHandler = (data) => {
      setPlayers(data.players || [])
    }

    const playerCompletedHandler = (data) => {
      setPlayers(data.players || [])
      
      if (data.all_completed) {
        setGameEnded(true)
      }
    }

    const gameFinishedHandler = (data) => {
      setWinner(data.winner)
      setRankings(data.final_rankings || [])
      setGameEnded(true)
      
      if (onGameEnd) {
        onGameEnd(data)
      }
    }

    const gameResetHandler = (data) => {
      setGameStarted(false)
      setGameEnded(false)
      setGameStartTime(null)
      setFinalScore(0)
      setRankings([])
      setWinner(null)
      setPlayers(data.players || [])
    }

    const gameActionHandler = (data) => {
      // Propagar ações do jogo para outros componentes se necessário
      console.log('Ação recebida:', data)
    }

    // Registrar listeners
    const unsubscribers = [
      on('game_started', gameStartedHandler),
      on('score_updated', scoreUpdatedHandler),
      on('player_completed', playerCompletedHandler),
      on('game_finished', gameFinishedHandler),
      on('game_reset', gameResetHandler),
      on('game_action_received', gameActionHandler)
    ].filter(Boolean)

    return () => {
      unsubscribers.forEach(unsub => unsub && unsub())
    }
  }, [socket, roomCode, on, onGameEnd])

  // Função para atualizar pontuação
  const handleScoreUpdate = useCallback((score) => {
    setFinalScore(score)
    if (roomCode && isConnected) {
      updateScore(roomCode, score)
    }
  }, [roomCode, isConnected, updateScore])

  // Função para completar o jogo
  const handleGameComplete = useCallback((score, completionTime = null) => {
    const endTime = completionTime || (gameStartTime ? Date.now() - gameStartTime : 0)
    setFinalScore(score)
    
    if (roomCode && isConnected) {
      completeGame(roomCode, score, endTime)
    }
  }, [roomCode, isConnected, completeGame, gameStartTime])

  // Função para enviar ações do jogo
  const handleGameAction = useCallback((actionType, actionData) => {
    if (roomCode && isConnected) {
      sendGameAction(roomCode, actionType, actionData)
    }
  }, [roomCode, isConnected, sendGameAction])

  // Função para reiniciar o jogo (apenas host)
  const handleResetGame = useCallback(() => {
    if (roomCode && isConnected) {
      resetGame(roomCode)
    }
  }, [roomCode, isConnected, resetGame])

  // Renderizar tela de espera
  console.log('🖥️ Renderizando MultiplayerGameWrapper - gameStarted:', gameStarted, 'gameEnded:', gameEnded)
  
  if (!gameStarted) {
    console.log('🖥️ Mostrando tela de espera - gameStarted é false')
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Aguardando início do jogo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Aguarde o anfitrião iniciar o jogo...
            </p>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Sala: {roomCode}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Jogadores na sala:</h3>
            {players.map((player, index) => (
              <div key={player.session_id} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="flex items-center gap-2">
                  {player.is_host && <Trophy className="h-4 w-4 text-yellow-500" />}
                  {player.name}
                  {player.session_id === sessionId && <Badge variant="secondary">Você</Badge>}
                </span>
                <Badge variant="outline">
                  {player.score || 0} pts
                </Badge>
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={onLeaveRoom}>
              Sair da Sala
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Renderizar tela de resultados
  if (gameEnded) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Jogo Finalizado!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {winner && (
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-yellow-800">
                🎉 {winner.name} Venceu! 🎉
              </h3>
              <p className="text-yellow-700">
                Pontuação: {winner.score} pts
              </p>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-semibold">Ranking Final:</h3>
            {rankings.map((player, index) => (
              <div key={player.session_id} className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="flex items-center gap-2">
                  <Badge variant={index === 0 ? "default" : "outline"}>
                    #{index + 1}
                  </Badge>
                  {player.name}
                  {player.session_id === sessionId && <Badge variant="secondary">Você</Badge>}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {player.score || 0} pts
                  </Badge>
                  {player.completion_time && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.round(player.completion_time / 1000)}s
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={handleResetGame}>
              Jogar Novamente
            </Button>
            <Button variant="outline" onClick={onLeaveRoom}>
              Sair da Sala
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Renderizar o jogo
  return (
    <div className="space-y-4">
      {/* Placar multiplayer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-sm">
              Sala: {roomCode}
            </Badge>
            <div className="flex items-center gap-4">
              {players.map((player) => (
                <div key={player.session_id} className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {player.name}
                    {player.session_id === sessionId && " (Você)"}
                  </span>
                  <Badge variant={player.session_id === sessionId ? "default" : "outline"}>
                    {player.score || 0} pts
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Componente do jogo */}
      {console.log('🎮 Renderizando GameComponent - props:', { isMultiplayer: true, roomCode, sessionId })}
      <GameComponent
        isMultiplayer={true}
        onScoreUpdate={handleScoreUpdate}
        onGameComplete={handleGameComplete}
        onGameAction={handleGameAction}
        roomCode={roomCode}
        sessionId={sessionId}
      />
    </div>
  )
}

export default MultiplayerGameWrapper