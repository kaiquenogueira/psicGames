import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Target, Home, RotateCcw } from 'lucide-react'

const FocusTrainingGame = () => {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [timeLeft, setTimeLeft] = useState(30)
  const [distractors, setDistractors] = useState([])
  const [targetVisible, setTargetVisible] = useState(true)
  const [focusAccuracy, setFocusAccuracy] = useState(100)
  const gameAreaRef = useRef(null)
  const intervalRef = useRef(null)
  const distractorIntervalRef = useRef(null)

  const distractorEmojis = ['🎈', '🎯', '⭐', '🔥', '💎', '🌟', '✨', '🎪', '🎭', '🎨']
  const targetEmoji = '🎯'

  useEffect(() => {
    if (gameStarted && !gameOver) {
      // Timer principal
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Gerar distrações
      distractorIntervalRef.current = setInterval(() => {
        generateDistractor()
      }, Math.max(2000 - (level * 200), 500)) // Mais rápido a cada nível

      return () => {
        clearInterval(intervalRef.current)
        clearInterval(distractorIntervalRef.current)
      }
    }
  }, [gameStarted, gameOver, level])

  const generateDistractor = () => {
    if (!gameAreaRef.current) return

    const rect = gameAreaRef.current.getBoundingClientRect()
    const newDistractor = {
      id: Date.now() + Math.random(),
      emoji: distractorEmojis[Math.floor(Math.random() * distractorEmojis.length)],
      x: Math.random() * (rect.width - 60),
      y: Math.random() * (rect.height - 60),
      duration: Math.random() * 2000 + 1000 // 1-3 segundos
    }

    setDistractors(prev => [...prev, newDistractor])

    // Remove distrator após sua duração
    setTimeout(() => {
      setDistractors(prev => prev.filter(d => d.id !== newDistractor.id))
    }, newDistractor.duration)
  }

  const handleTargetClick = () => {
    if (!gameStarted || gameOver) return
    
    setScore(prev => prev + 10 * level)
    setFocusAccuracy(prev => Math.min(100, prev + 2))
    
    // Aumenta nível a cada 50 pontos
    if ((score + 10 * level) % 50 === 0) {
      setLevel(prev => prev + 1)
      setTimeLeft(prev => prev + 5) // Bônus de tempo
    }
  }

  const handleDistractorClick = () => {
    if (!gameStarted || gameOver) return
    
    setFocusAccuracy(prev => Math.max(0, prev - 10))
    setScore(prev => Math.max(0, prev - 5))
  }

  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setLevel(1)
    setTimeLeft(30)
    setDistractors([])
    setFocusAccuracy(100)
  }

  const endGame = () => {
    setGameOver(true)
    setGameStarted(false)
    clearInterval(intervalRef.current)
    clearInterval(distractorIntervalRef.current)
    setDistractors([])
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameOver(false)
    setScore(0)
    setLevel(1)
    setTimeLeft(30)
    setDistractors([])
    setFocusAccuracy(100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100 dark:from-gray-900 dark:via-red-900 dark:to-orange-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Target className="w-12 h-12 text-red-600 dark:text-red-400 mr-3" />
              <CardTitle className="text-3xl bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Treino de Foco
              </CardTitle>
            </div>
            <CardDescription className="text-lg">
              Mantenha o foco no alvo central e ignore as distrações!
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Pontuação: {score}
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Nível: {level}
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Tempo: {timeLeft}s
              </Badge>
              <Badge 
                variant={focusAccuracy >= 70 ? "default" : "destructive"} 
                className="text-lg px-4 py-2"
              >
                Foco: {focusAccuracy}%
              </Badge>
            </div>

            {!gameStarted && !gameOver && (
              <div className="text-center space-y-4">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Clique apenas no alvo central 🎯 e ignore todas as outras distrações que aparecerem!
                </p>
                <Button onClick={startGame} size="lg" className="bg-red-600 hover:bg-red-700">
                  Começar Treino
                </Button>
              </div>
            )}

            {gameStarted && (
              <div 
                ref={gameAreaRef}
                className="relative w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg border-4 border-red-300 dark:border-red-600 overflow-hidden"
              >
                {/* Alvo Central */}
                <div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform duration-200"
                  onClick={handleTargetClick}
                >
                  <div className="text-6xl animate-pulse">🎯</div>
                </div>

                {/* Distrações */}
                {distractors.map(distractor => (
                  <div
                    key={distractor.id}
                    className="absolute cursor-pointer hover:scale-110 transition-transform duration-200 animate-bounce"
                    style={{
                      left: `${distractor.x}px`,
                      top: `${distractor.y}px`
                    }}
                    onClick={handleDistractorClick}
                  >
                    <div className="text-4xl">{distractor.emoji}</div>
                  </div>
                ))}

                {/* Instruções durante o jogo */}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg">
                  <p className="text-sm">Clique apenas no 🎯 central!</p>
                </div>
              </div>
            )}

            {gameOver && (
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  Treino Concluído!
                </h3>
                <div className="space-y-2">
                  <p className="text-lg">Pontuação Final: <span className="font-bold text-red-600">{score}</span></p>
                  <p className="text-lg">Nível Alcançado: <span className="font-bold text-orange-600">{level}</span></p>
                  <p className="text-lg">Precisão do Foco: <span className="font-bold text-yellow-600">{focusAccuracy}%</span></p>
                </div>
                <div className="flex justify-center gap-4">
                  <Button onClick={resetGame} variant="outline" size="lg">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Jogar Novamente
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

export default FocusTrainingGame