import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [sessionId, setSessionId] = useState(null)

  // Keep track of the active channel and listeners
  const channelRef = useRef(null)
  const listenersRef = useRef({})
  // Keep track of the players in the room locally
  const playersRef = useRef([])
  // Keep track if we are the host
  const isHostRef = useRef(false)
  // Keep track of room data
  const roomDataRef = useRef({})

  useEffect(() => {
    // Generate a unique session ID for this client
    const id = Math.random().toString(36).substring(2, 12)
    setSessionId(id)
    setIsConnected(true) // Supabase is HTTP/wss, we consider it connected immediately

    // Simulate socket connection events for legacy compatibility
    setTimeout(() => {
      emitLocal('connect')
      emitLocal('connected', { session_id: id })
    }, 100)

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  // Helper to trigger local event listeners (emulating socket.on)
  const emitLocal = useCallback((event, data) => {
    const callbacks = listenersRef.current[event] || []
    callbacks.forEach(cb => cb(data))
  }, [])

  // On emulation
  const on = useCallback((event, callback) => {
    if (!listenersRef.current[event]) {
      listenersRef.current[event] = []
    }
    listenersRef.current[event].push(callback)

    return () => {
      listenersRef.current[event] = listenersRef.current[event].filter(cb => cb !== callback)
    }
  }, [])

  // Setup Supabase Channel for a room
  const setupChannel = async (roomCode, playerName, gameType, isHost) => {
    // If already in a room, leave it
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current)
    }

    const channel = supabase.channel(`room:${roomCode}`, {
      config: {
        presence: { key: sessionId },
        broadcast: { ack: false }
      }
    })

    channelRef.current = channel
    isHostRef.current = isHost

    // Initial state payload
    const me = {
      session_id: sessionId,
      name: playerName,
      score: 0,
      is_host: isHost,
      game_type: gameType // Embed the game type in Presence
    }

    // Set up Broadcast Listeners
    channel
      .on('broadcast', { event: 'start_game' }, ({ payload }) => {
        emitLocal('game_started', payload)
      })
      .on('broadcast', { event: 'update_game_state' }, ({ payload }) => {
        emitLocal('game_state_updated', payload)
      })
      .on('broadcast', { event: 'update_score' }, ({ payload }) => {
        const updatedPlayers = playersRef.current.map(p =>
          p.session_id === payload.session_id ? { ...p, score: payload.score } : p
        )
        playersRef.current = updatedPlayers
        emitLocal('score_updated', { players: updatedPlayers })
      })
      .on('broadcast', { event: 'game_action' }, ({ payload }) => {
        emitLocal('game_action_received', payload)
      })
      .on('broadcast', { event: 'game_completed' }, ({ payload }) => {
        const updatedPlayers = playersRef.current.map(p =>
          p.session_id === payload.player_id
            ? { ...p, score: payload.final_score, completed: true, completion_time: payload.completion_time }
            : p
        )
        playersRef.current = updatedPlayers

        const allCompleted = updatedPlayers.every(p => p.completed)
        emitLocal('player_completed', {
          player_id: payload.player_id,
          final_score: payload.final_score,
          completion_time: payload.completion_time,
          all_completed: allCompleted,
          players: updatedPlayers
        })

        if (allCompleted) {
          const sorted = [...updatedPlayers].sort((a, b) => (b.score || 0) - (a.score || 0))
          emitLocal('game_finished', {
            winner: sorted[0],
            final_rankings: sorted
          })
        }
      })
      .on('broadcast', { event: 'reset_game' }, () => {
        const resetPlayers = playersRef.current.map(p => ({
          ...p,
          score: 0,
          completed: false,
          completion_time: null
        }))
        playersRef.current = resetPlayers
        emitLocal('game_reset', { players: resetPlayers })
      })

    // Presence Listeners
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const currentPlayers = []

      for (const key in state) {
        if (state[key].length > 0) {
          currentPlayers.push(state[key][0]) // Get the first presence instance for this key
        }
      }

      // Attempt to find the host to extract game_type
      const hostPlayer = currentPlayers.find(p => p.is_host)
      if (hostPlayer && hostPlayer.game_type) {
        roomDataRef.current.game_type = hostPlayer.game_type
      }

      playersRef.current = currentPlayers

      // Automatically assign a new host if the host left
      if (currentPlayers.length > 0 && !currentPlayers.some(p => p.is_host)) {
        // The one with the lowest session_id alphabetically becomes host
        const sortedKeys = Object.keys(state).sort()
        if (sortedKeys[0] === sessionId) {
          isHostRef.current = true
          me.is_host = true
          channel.track(me)
        }
      }

      emitLocal('player_joined', { players: currentPlayers, player: me })
      emitLocal('player_left', { players: currentPlayers })
    })

    // Subscribe to the channel
    const status = await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(me)

        const initialRoomData = {
          code: roomCode,
          host: isHost ? sessionId : null,
          game_type: roomDataRef.current?.game_type || gameType, // from fallback
          players: [me],
          game_state: {},
          started: false
        }

        roomDataRef.current = initialRoomData

        if (isHost) {
          emitLocal('room_created', {
            room_code: roomCode,
            player: me,
            room_data: initialRoomData
          })
        } else {
          emitLocal('room_joined', {
            room_code: roomCode,
            player: me,
            room_data: initialRoomData
          })
        }
      }
    })
  }

  const broadcastPayload = useCallback((event, payload) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: event,
        payload: payload
      })
    }
  }, [])

  const createRoom = useCallback((playerName, gameType = 'memory') => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    setupChannel(roomCode, playerName, gameType, true)
  }, [sessionId])

  const joinRoom = useCallback((roomCode, playerName) => {
    setupChannel(roomCode.toUpperCase(), playerName, 'memory', false)
  }, [sessionId])

  const leaveRoom = useCallback(async (roomCode) => {
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    emitLocal('left_room', { room_code: roomCode })
  }, [emitLocal])

  const startGame = useCallback((roomCode, settings = {}) => {
    const payload = {
      room_code: roomCode,
      game_type: roomDataRef.current?.game_type || 'memory',
      players: playersRef.current,
      score_mode: settings.score_mode,
      match_duration: settings.match_duration
    }
    emitLocal('game_started', payload) // emite pra mim mesmo
    broadcastPayload('start_game', payload) // avisa os outros
  }, [emitLocal, broadcastPayload])

  const updateGameState = useCallback((roomCode, gameState) => {
    broadcastPayload('update_game_state', { game_state: gameState })
  }, [broadcastPayload])

  const updateScore = useCallback((roomCode, score) => {
    const payload = { session_id: sessionId, score }

    // Atualiza local e emite
    const updatedPlayers = playersRef.current.map(p =>
      p.session_id === sessionId ? { ...p, score } : p
    )
    playersRef.current = updatedPlayers
    emitLocal('score_updated', { players: updatedPlayers })

    broadcastPayload('update_score', payload)
  }, [sessionId, emitLocal, broadcastPayload])

  const sendGameAction = useCallback((roomCode, actionType, actionData) => {
    broadcastPayload('game_action', {
      player_id: sessionId,
      action_type: actionType,
      action_data: actionData
    })
  }, [sessionId, broadcastPayload])

  const completeGame = useCallback((roomCode, finalScore, completionTime) => {
    const payload = {
      player_id: sessionId,
      final_score: finalScore,
      completion_time: completionTime
    }

    const updatedPlayers = playersRef.current.map(p =>
      p.session_id === sessionId
        ? { ...p, score: finalScore, completed: true, completion_time: completionTime }
        : p
    )
    playersRef.current = updatedPlayers
    const allCompleted = updatedPlayers.every(p => p.completed)

    emitLocal('player_completed', {
      ...payload,
      all_completed: allCompleted,
      players: updatedPlayers
    })

    if (allCompleted) {
      const sorted = [...updatedPlayers].sort((a, b) => (b.score || 0) - (a.score || 0))
      emitLocal('game_finished', {
        winner: sorted[0],
        final_rankings: sorted
      })
    }

    broadcastPayload('game_completed', payload)
  }, [sessionId, emitLocal, broadcastPayload])

  const resetGame = useCallback((roomCode) => {
    const resetPlayers = playersRef.current.map(p => ({
      ...p,
      score: 0,
      completed: false,
      completion_time: null
    }))
    playersRef.current = resetPlayers
    emitLocal('game_reset', { players: resetPlayers })

    broadcastPayload('reset_game', {})
  }, [emitLocal, broadcastPayload])

  return {
    socket: { id: sessionId }, // Preserva o contrato if (!socket) return no componente filho
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
