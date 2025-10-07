import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Focus, Home, RotateCcw, Clock, Eye } from 'lucide-react'

const SustainedAttentionGame = () => {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [targets, setTargets] = useState([])
  const [score, setScore] = useState(0)
  const [missed, setMissed] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [level, setLevel] = useState(1)
  const [totalTargets, setTotalTargets] = useState(0)
  const [hitTargets, setHitTargets] = useState(0)
  
  const intervalRef = useRef(null)
  const targetIntervalRef = useRef(null)
  const gameDuration = 120 // 2 minutos

  const targetEmojis = ['🎯', '⭐', '💎', '🔥', '✨']
  const distractorEmojis = ['🌙', '☁️', '🌸', '🍃', '🦋', '🌺', '🌿', '🌊']

  useEffect(() => {
    if (gameStarted && !gameOver) {
      // Timer principal
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          if (prev >= gameDuration) {
            endGame()
            return gameDuration
          }
          return prev + 1
        })
      }, 1000)

      // Gerador de alvos
      const targetInterval = Math.max(3000 - (level * 200), 1000)
      targetIntervalRef.current = setInterval(() => {
        generateTarget()
      }, targetInterval)

      return () => {
        clearInterval(intervalRef.current)
        clearInterval(targetIntervalRef.current)
      }
    }
  }, [gameStarted, gameOver, level])

  useEffect(() => {
    // Atualiza precisão
    if (totalTargets > 0) {
      setAccuracy(Math.round((hitTargets / totalTargets) * 100))
    }
    
    // Aumenta nível baseado na precisão e tempo
    const newLevel = Math.floor(timeElapsed / 30) + 1
    if (newLevel > level && accuracy >= 70) {
      setLevel(newLevel)
    }
  }, [hitTargets, totalTargets, timeElapsed])

  const generateTarget = () => {
    const isTarget = Math.random() < 0.7 // 70% chance de ser alvo
    const emoji = isTarget 
      ? targetEmojis[Math.floor(Math.random() * targetEmojis.length)]
      : distractorEmojis[Math.floor(Math.random() * distractorEmojis.length)]
    
    const newTarget = {
      id: Date.now() + Math.random(),
      emoji,
      isTarget,
      x: Math.random() * 80 + 10, // 10-90% da largura
      y: Math.random() * 80 + 10, // 10-90% da altura
      duration: isTarget ? 2000 + (level * 200) : 1500, // Alvos ficam mais tempo
      size: isTarget ? 'text-4xl' : 'text-2xl'
    }

    setTargets(prev => [...prev, newTarget])
    
    if (isTarget) {
      setTotalTargets(prev => prev + 1)
    }

    // Remove após duração
    setTimeout(() => {
      setTargets(prev => {
        const remaining = prev.filter(t => t.id !== newTarget.id)
        // Se era um alvo e não foi clicado, conta como perdido
        if (newTarget.isTarget && prev.find(t => t.id === newTarget.id)) {
          setMissed(prevMissed => prevMissed + 1)
        }
        return remaining
      })
    }, newTarget.duration)
  }

  const handleTargetClick = (target) => {
    if (!gameStarted || gameOver) return

    setTargets(prev => prev.filter(t => t.id !== target.id))

    if (target.isTarget) {
      setScore(prev => prev + 10 * level)
      setHitTargets(prev => prev + 1)
    } else {
      // Clicou em distração
      setScore(prev => Math.max(0, prev - 5))
    }
  }

  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setTimeElapsed(0)
    setTargets([])
    setScore(0)
    setMissed(0)
    setAccuracy(100)
    setLevel(1)
    setTotalTargets(0)
    setHitTargets(0)
  }

  const endGame = () => {
    setGameOver(true)
    setGameStarted(false)
    clearInterval(intervalRef.current)
    clearInterval(targetIntervalRef.current)
    setTargets([])
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameOver(false)
    setTimeElapsed(0)
    setTargets([])
    setScore(0)
    setMissed(0)
    setAccuracy(100)
    setLevel(1)
    setTotalTargets(0)
    setHitTargets(0)
    clearInterval(intervalRef.current)
    clearInterval(targetIntervalRef.current)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPerformanceLevel = () => {
    if (accuracy >= 90) return { text: "Excelente", color: "text-green-600", emoji: "🏆" }
    if (accuracy >= 80) return { text: "Muito Bom", color: "text-blue-600", emoji: "⭐" }
    if (accuracy >= 70) return { text: "Bom", color: "text-yellow-600", emoji: "👍" }
    if (accuracy >= 60) return { text: "Regular", color: "text-orange-600", emoji: "🎯" }
    return { text: "Precisa Melhorar", color: "text-red-600", emoji: "💪" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Focus className="w-12 h-12 text-blue-600 dark:text-blue-400 mr-3" />
              <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Atenção Sustentada
              </CardTitle>
            </div>
            <CardDescription className="text-lg">
              Mantenha o foco e clique apenas nos alvos corretos por 2 minutos!
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(timeElapsed)} / {formatTime(gameDuration)}
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Pontos: {score}
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Nível: {level}
              </Badge>
              <Badge 
                variant={accuracy >= 70 ? "default" : "destructive"} 
                className="text-lg px-4 py-2"
              >
                <Eye className="w-4 h-4 mr-1" />
                Precisão: {accuracy}%
              </Badge>
            </div>

            {!gameStarted && !gameOver && (
              <div className="text-center space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold mb-4">Instruções:</h3>
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <p>• Clique apenas nos alvos: {targetEmojis.join(' ')}</p>
                    <p>• Ignore as distrações: {distractorEmojis.slice(0, 4).join(' ')}</p>
                    <p>• Mantenha a concentração por 2 minutos</p>
                    <p>• Alvos desaparecem rapidamente!</p>
                  </div>
                </div>
                <Button onClick={startGame} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Focus className="w-4 h-4 mr-2" />
                  Começar Teste
                </Button>
              </div>
            )}

            {gameStarted && (
              <div className="relative w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border-4 border-blue-300 dark:border-blue-600 overflow-hidden">
                {/* Barra de progresso */}
                <div className="absolute top-2 left-2 right-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(timeElapsed / gameDuration) * 100}%` }}
                  />
                </div>

                {/* Alvos e distrações */}
                {targets.map(target => (
                  <div
                    key={target.id}
                    className={`
                      absolute cursor-pointer hover:scale-110 transition-transform duration-200
                      ${target.isTarget ? 'animate-pulse' : 'animate-bounce'}
                      ${target.size}
                    `}
                    style={{
                      left: `${target.x}%`,
                      top: `${target.y}%`
                    }}
                    onClick={() => handleTargetClick(target)}
                  >
                    {target.emoji}
                  </div>
                ))}

                {/* Instruções durante o jogo */}
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg">
                  <p className="text-sm">Clique nos alvos: {targetEmojis.join(' ')}</p>
                </div>

                {/* Estatísticas em tempo real */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm">
                  <p>Acertos: {hitTargets}/{totalTargets}</p>
                  <p>Perdidos: {missed}</p>
                </div>
              </div>
            )}

            {gameOver && (
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  Teste de Atenção Concluído!
                </h3>
                <div className="space-y-2">
                  <p className="text-lg">Pontuação Final: <span className="font-bold text-blue-600">{score}</span></p>
                  <p className="text-lg">Nível Alcançado: <span className="font-bold text-indigo-600">{level}</span></p>
                  <p className="text-lg">Precisão: <span className="font-bold text-purple-600">{accuracy}%</span></p>
                  <p className="text-lg">Alvos Acertados: <span className="font-bold text-green-600">{hitTargets}/{totalTargets}</span></p>
                  <p className="text-lg">Alvos Perdidos: <span className="font-bold text-red-600">{missed}</span></p>
                  
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className={`text-2xl font-bold ${getPerformanceLevel().color}`}>
                      {getPerformanceLevel().emoji} {getPerformanceLevel().text}
                    </p>
                  </div>
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

export default SustainedAttentionGame