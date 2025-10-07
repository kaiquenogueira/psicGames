import { useEffect, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

// URL do backend - compatível com Vite (VITE_SOCKET_URL) e fallbacks
const SOCKET_URL = (
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SOCKET_URL
) || (
  typeof window !== 'undefined' && window.location ? window.location.origin : null
) || 'http://localhost:5050'

let socket = null

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [sessionId, setSessionId] = useState(null)

  useEffect(() => {
    // Criar conexão socket se não existir
    if (!socket) {
      socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      })

      socket.on('connect', () => {
        console.log('Socket conectado')
        setIsConnected(true)
      })

      socket.on('connected', (data) => {
        console.log('Session ID recebido:', data.session_id)
        setSessionId(data.session_id)
      })

      socket.on('disconnect', () => {
        console.log('Socket desconectado')
        setIsConnected(false)
      })

      socket.on('error', (error) => {
        console.error('Socket error:', error)
      })
    }

    return () => {
      // Não desconectar ao desmontar, manter conexão ativa
    }
  }, [])

  const createRoom = useCallback((playerName, gameType = 'attention') => {
    if (socket && isConnected) {
      socket.emit('create_room', { player_name: playerName, game_type: gameType })
    }
  }, [isConnected])

  const joinRoom = useCallback((roomCode, playerName) => {
    if (socket && isConnected) {
      socket.emit('join_room', { room_code: roomCode, player_name: playerName })
    }
  }, [isConnected])

  const leaveRoom = useCallback((roomCode) => {
    if (socket && isConnected) {
      socket.emit('leave_room_request', { room_code: roomCode })
    }
  }, [isConnected])

  const startGame = useCallback((roomCode) => {
    if (socket && isConnected) {
      socket.emit('start_game', { room_code: roomCode })
    }
  }, [isConnected])

  const updateGameState = useCallback((roomCode, gameState) => {
    if (socket && isConnected) {
      socket.emit('update_game_state', { room_code: roomCode, game_state: gameState })
    }
  }, [isConnected])

  const updateScore = useCallback((roomCode, score) => {
    if (socket && isConnected) {
      socket.emit('update_score', { room_code: roomCode, score })
    }
  }, [isConnected])

  const sendGameAction = useCallback((roomCode, actionType, actionData) => {
    if (socket && isConnected) {
      socket.emit('game_action', { 
        room_code: roomCode, 
        action_type: actionType, 
        action_data: actionData 
      })
    }
  }, [isConnected])

  const completeGame = useCallback((roomCode, finalScore, completionTime) => {
    if (socket && isConnected) {
      socket.emit('game_completed', { 
        room_code: roomCode, 
        final_score: finalScore, 
        completion_time: completionTime 
      })
    }
  }, [isConnected])

  const resetGame = useCallback((roomCode) => {
    if (socket && isConnected) {
      socket.emit('reset_game', { room_code: roomCode })
    }
  }, [isConnected])

  const on = useCallback((event, callback) => {
    if (socket) {
      socket.on(event, callback)
      return () => socket.off(event, callback)
    }
  }, [])



  return {
    socket,
    isConnected,
    sessionId,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    updateScore,
    sendGameAction,
    completeGame,
    resetGame,
    updateGameState,
    on
  }
}
