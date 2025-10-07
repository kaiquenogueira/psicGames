import { useState, useEffect } from 'react'

const useMultiplayer = () => {
  const [roomCode, setRoomCode] = useState(null)
  const [players, setPlayers] = useState([])
  const [isHost, setIsHost] = useState(false)
  const [playerName, setPlayerName] = useState('')

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const createRoom = (name) => {
    const code = generateRoomCode()
    setRoomCode(code)
    setPlayerName(name)
    setIsHost(true)
    setPlayers([{ id: 1, name: name, isHost: true }])
    console.log(`Sala ${code} criada por ${name}`)
  }

  const joinRoom = (code, name) => {
    setRoomCode(code)
    setPlayerName(name)
    setIsHost(false)
    // Simulação: Adiciona o jogador à lista existente, em um cenário real, o backend faria isso.
    setPlayers(prevPlayers => [...prevPlayers, { id: prevPlayers.length + 1, name: name, isHost: false }])
    console.log(`${name} entrou na sala ${code}`)
  }

  const leaveRoom = () => {
    setRoomCode(null)
    setPlayerName('')
    setIsHost(false)
    setPlayers([])
    console.log('Saiu da sala')
  }

  return {
    roomCode,
    players,
    isHost,
    playerName,
    createRoom,
    joinRoom,
    leaveRoom,
  }
}

export default useMultiplayer
