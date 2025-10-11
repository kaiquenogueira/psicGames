import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Zap, Home, RotateCcw, Clock } from 'lucide-react'

const ReactionTimeGame = ({
  isMultiplayer = false,
  onScoreUpdate,
  onGameComplete,
  roomCode,
  sessionId,
  scoreMode = 'realtime',
  matchDuration = null
}) => {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [showSignal, setShowSignal] = useState(false)
  const [round, setRound] = useState(0)
  const [reactionTimes, setReactionTimes] = useState([])
  const [currentReactionTime, setCurrentReactionTime] = useState(null)
  const [averageTime, setAverageTime] = useState(0)
  const [bestTime, setBestTime] = useState(null)
  const [tooEarly, setTooEarly] = useState(false)
  
  const startTimeRef = useRef(null)
  const timeoutRef = useRef(null)
  const maxRounds = 5

  const signals = [
    { emoji: '🟢', color: 'bg-green-500', text: 'VERDE!' },
    { emoji: '🔴', color: 'bg-red-500', text: 'VERMELHO!' },
    { emoji: '🟡', color: 'bg-yellow-500', text: 'AMARELO!' },
    { emoji: '🔵', color: 'bg-blue-500', text: 'AZUL!' },
    { emoji: '⚡', color: 'bg-purple-500', text: 'RAIO!' }
  ]

  const [currentSignal, setCurrentSignal] = useState(signals[0])

  useEffect(() => {
    if (reactionTimes.length > 0) {
      const avg = reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length
      setAverageTime(Math.round(avg))
      
      const best = Math.min(...reactionTimes)
      setBestTime(best)
    }
  }, [reactionTimes])

  const startRound = () => {
    if (round >= maxRounds) {
      endGame()
      return
    }

    setWaiting(true)
    setShowSignal(false)
    setTooEarly(false)
    setCurrentReactionTime(null)
    
    // Escolhe sinal aleatório
    const randomSignal = signals[Math.floor(Math.random() * signals.length)]
    setCurrentSignal(randomSignal)

    // Tempo aleatório entre 1-5 segundos
    const waitTime = Math.random() * 4000 + 1000
    
    timeoutRef.current = setTimeout(() => {
      setWaiting(false)
      setShowSignal(true)
      startTimeRef.current = Date.now()
    }, waitTime)
  }

  const handleClick = () => {
    if (tooEarly) return

    if (waiting) {
      // Clicou muito cedo
      setTooEarly(true)
      setWaiting(false)
      clearTimeout(timeoutRef.current)
      
      setTimeout(() => {
        setRound(prev => prev + 1)
        startRound()
      }, 2000)
      return
    }

    if (showSignal && startTimeRef.current) {
      // Calculou tempo de reação
      const reactionTime = Date.now() - startTimeRef.current
      setCurrentReactionTime(reactionTime)
      setReactionTimes(prev => [...prev, reactionTime])
      setShowSignal(false)
      setRound(prev => prev + 1)
      
      setTimeout(() => {
        startRound()
      }, 2000)
    }
  }

  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setRound(0)
    setReactionTimes([])
    setCurrentReactionTime(null)
    setAverageTime(0)
    setBestTime(null)
    setWaiting(false)
    setShowSignal(false)
    setTooEarly(false)
    
    setTimeout(() => {
      setRound(1)
      startRound()
    }, 1000)
  }

  // Auto-start em modo multiplayer
  useEffect(() => {
    if (isMultiplayer && !gameStarted && !gameOver) {
      startGame()
    }
  }, [isMultiplayer, gameStarted, gameOver])

  // Timer de partida opcional (matchDuration em segundos)
  useEffect(() => {
    if (!gameStarted || !matchDuration) return
    const timeout = setTimeout(() => {
      endGame()
    }, matchDuration * 1000)
    return () => clearTimeout(timeout)
  }, [gameStarted, matchDuration])

  useEffect(() => {
    if (reactionTimes.length > 0) {
      const avg = reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length
      setAverageTime(Math.round(avg))
      const best = Math.min(...reactionTimes)
      setBestTime(best)
      // Atualiza score em tempo real (maior melhor): 1000 - média
      if (isMultiplayer && scoreMode !== 'final_only' && typeof onScoreUpdate === 'function') {
        const score = Math.max(0, 1000 - Math.round(avg))
        onScoreUpdate(score)
      }
    }
  }, [reactionTimes])

  const endGame = () => {
    setGameOver(true)
    setGameStarted(false)
    setWaiting(false)
    setShowSignal(false)
    clearTimeout(timeoutRef.current)
    // Envia resultado final em modo multiplayer
    if (isMultiplayer && typeof onGameComplete === 'function') {
      const finalScore = averageTime > 0 ? Math.max(0, 1000 - averageTime) : 0
      onGameComplete(finalScore)
    }
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameOver(false)
    setRound(0)
    setReactionTimes([])
    setCurrentReactionTime(null)
    setAverageTime(0)
    setBestTime(null)
    setWaiting(false)
    setShowSignal(false)
    setTooEarly(false)
    clearTimeout(timeoutRef.current)
  }

  const getPerformanceMessage = () => {
    if (averageTime < 200) return { text: "Reflexos de Ninja! 🥷", color: "text-green-600" }
    if (averageTime < 300) return { text: "Muito Rápido! ⚡", color: "text-blue-600" }
    if (averageTime < 400) return { text: "Bom Tempo! 👍", color: "text-yellow-600" }
    if (averageTime < 500) return { text: "Pode Melhorar! 🎯", color: "text-orange-600" }
    return { text: "Continue Praticando! 💪", color: "text-red-600" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-green-50 to-blue-100 dark:from-gray-900 dark:via-yellow-900 dark:to-green-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Zap className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mr-3" />
              <CardTitle className="text-3xl bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
                Tempo de Reação
              </CardTitle>
            </div>
            <CardDescription className="text-lg">
              Clique o mais rápido possível quando ver o sinal!
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Clock className="w-4 h-4 mr-1" />
                Rodada: {round}/{maxRounds}
              </Badge>
              {averageTime > 0 && (
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Média: {averageTime}ms
                </Badge>
              )}
              {bestTime && (
                <Badge variant="default" className="text-lg px-4 py-2">
                  Melhor: {bestTime}ms
                </Badge>
              )}
            </div>

            {!gameStarted && !gameOver && (
              <div className="text-center space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold mb-4">Como Jogar:</h3>
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <p>• Aguarde o sinal aparecer</p>
                    <p>• Clique o mais rápido possível</p>
                    <p>• Não clique antes do sinal!</p>
                    <p>• Complete 5 rodadas</p>
                  </div>
                </div>
                <Button onClick={startGame} size="lg" className="bg-yellow-600 hover:bg-yellow-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Começar Teste
                </Button>
              </div>
            )}

            {gameStarted && (
              <div className="text-center">
                <div 
                  className={`
                    w-full h-64 rounded-lg border-4 cursor-pointer transition-all duration-300 flex items-center justify-center
                    ${waiting ? 'bg-red-100 border-red-300 dark:bg-red-900/20 dark:border-red-600' : ''}
                    ${showSignal ? `${currentSignal.color} border-white` : ''}
                    ${tooEarly ? 'bg-gray-300 border-gray-500 dark:bg-gray-700 dark:border-gray-500' : ''}
                    ${!waiting && !showSignal && !tooEarly ? 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600' : ''}
                  `}
                  onClick={handleClick}
                >
                  {waiting && (
                    <div className="text-center">
                      <div className="text-6xl mb-4">⏳</div>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        Aguarde...
                      </p>
                    </div>
                  )}
                  
                  {showSignal && (
                    <div className="text-center">
                      <div className="text-8xl mb-4">{currentSignal.emoji}</div>
                      <p className="text-3xl font-bold text-white">
                        {currentSignal.text}
                      </p>
                      <p className="text-xl text-white/80 mt-2">
                        CLIQUE AGORA!
                      </p>
                    </div>
                  )}
                  
                  {tooEarly && (
                    <div className="text-center">
                      <div className="text-6xl mb-4">❌</div>
                      <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                        Muito Cedo!
                      </p>
                      <p className="text-lg text-gray-500 dark:text-gray-500">
                        Aguarde o sinal
                      </p>
                    </div>
                  )}
                  
                  {currentReactionTime && (
                    <div className="text-center">
                      <div className="text-6xl mb-4">✅</div>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {currentReactionTime}ms
                      </p>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        Próxima rodada...
                      </p>
                    </div>
                  )}
                  
                  {!waiting && !showSignal && !tooEarly && !currentReactionTime && round > 0 && (
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎯</div>
                      <p className="text-xl text-gray-600 dark:text-gray-400">
                        Prepare-se...
                      </p>
                    </div>
                  )}
                </div>

                {reactionTimes.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-bold mb-2">Tempos de Reação:</h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {reactionTimes.map((time, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {time}ms
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {gameOver && (
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  Teste Concluído!
                </h3>
                <div className="space-y-2">
                  <p className="text-lg">Tempo Médio: <span className="font-bold text-yellow-600">{averageTime}ms</span></p>
                  <p className="text-lg">Melhor Tempo: <span className="font-bold text-green-600">{bestTime}ms</span></p>
                  {averageTime > 0 && (
                    <p className={`text-xl font-bold ${getPerformanceMessage().color}`}>
                      {getPerformanceMessage().text}
                    </p>
                  )}
                </div>
                <div className="flex justify-center gap-4">
                  <Button onClick={resetGame} variant="outline" size="lg">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Testar Novamente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ReactionTimeGame