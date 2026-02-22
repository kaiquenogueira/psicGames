import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Trophy, RotateCcw, Users, Eye, Clock, Zap } from 'lucide-react'
import { playSuccess, playError } from '../utils/audio.js'

const AttentionGame = ({ isMultiplayer = false, onScoreUpdate, onGameComplete, roomCode, sessionId, scoreMode = 'realtime', matchDuration = null }) => {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [targetEmoji, setTargetEmoji] = useState('')
  const [found, setFound] = useState(0)
  const [targetCount, setTargetCount] = useState(3)
  const [errorItemId, setErrorItemId] = useState(null)
  const [streak, setStreak] = useState(0)
  const [grid, setGrid] = useState([])

  const allEmojis = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎻', '⚽', '🏀', '🎾', '🏐', '🎱', '🎳', '🎲', '🎰', '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒']

  useEffect(() => {
    let interval
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const initializeGame = () => {
    // Selecionar emoji alvo
    const target = allEmojis[Math.floor(Math.random() * allEmojis.length)]
    setTargetEmoji(target)

    // Determinar quantidade de alvos baseado no nível
    const count = Math.min(3 + level, 8)
    setTargetCount(count)

    // Criar grid com emojis
    const gridSize = Math.min(20 + (level * 5), 50)
    const newGrid = []

    // Adicionar alvos
    for (let i = 0; i < count; i++) {
      newGrid.push({ id: i, emoji: target, isTarget: true, found: false })
    }

    // Adicionar distrações
    while (newGrid.length < gridSize) {
      const randomEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)]
      if (randomEmoji !== target) {
        newGrid.push({
          id: newGrid.length,
          emoji: randomEmoji,
          isTarget: false,
          found: false
        })
      }
    }

    // Embaralhar
    newGrid.sort(() => Math.random() - 0.5)

    setGrid(newGrid)
    setFound(0)
    setGameStarted(true)
    setGameWon(false)
    setIsRunning(true)
  }

  // Auto-start em multiplayer
  useEffect(() => {
    if (isMultiplayer && !gameStarted) {
      initializeGame()
    }
  }, [isMultiplayer, gameStarted])

  // Timer opcional de partida (matchDuration em segundos)
  useEffect(() => {
    if (!gameStarted || !matchDuration) return
    const timeout = setTimeout(() => {
      setIsRunning(false)
      setGameWon(true)
    }, matchDuration * 1000)
    return () => clearTimeout(timeout)
  }, [gameStarted, matchDuration])

  const handleEmojiClick = (item) => {
    if (!gameStarted || gameWon || item.found) return

    if (item.isTarget) {
      // Acertou!
      playSuccess()
      const newGrid = grid.map(g =>
        g.id === item.id ? { ...g, found: true } : g
      )
      setGrid(newGrid)

      const newFound = found + 1
      setFound(newFound)

      // Adicionar pontos e analisar streak
      const points = Math.max(100 - time, 10) * level
      const newScore = score + points
      setScore(newScore)

      const newStreak = streak + 1
      if (newStreak >= 2) {
        setTime(prev => Math.max(0, prev - 2)) // Bônus de tempo para reduzir ansiedade
        setStreak(0)
      } else {
        setStreak(newStreak)
      }

      if (isMultiplayer && scoreMode !== 'final_only' && onScoreUpdate) onScoreUpdate(newScore)

      if (newFound === targetCount) {
        // Completou o nível!
        setIsRunning(false)
        setTimeout(() => {
          if (level < 5) {
            setLevel(level + 1)
            setTime(0)
            initializeGame()
          } else {
            setGameWon(true)
            if (isMultiplayer && onGameComplete) onGameComplete(newScore)
          }
        }, 1000)
      }
    } else {
      // Errou - penalidade de tempo, reset de streak e facilitação de nível
      playError()
      setErrorItemId(item.id)
      setStreak(0)

      // Encontrar um distrator para remover (facilitar)
      const distractors = grid.filter(g => !g.isTarget && !g.found && g.id !== item.id)
      if (distractors.length > 0) {
        const toRemove = distractors[Math.floor(Math.random() * distractors.length)]
        setGrid(prev => prev.filter(g => g.id !== toRemove.id))
      }

      setTimeout(() => setErrorItemId(null), 300)
      setTime(time + 5)
    }
  }

  const resetGame = () => {
    setLevel(1)
    setScore(0)
    setTime(0)
    setGameStarted(false)
    setGameWon(false)
    setIsRunning(false)
  }

  // Disparar resultado final ao concluir (ganho ou timer)
  useEffect(() => {
    if (gameWon && isMultiplayer && typeof onGameComplete === 'function') {
      onGameComplete(score)
    }
  }, [gameWon])

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="mb-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-orange-900 border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Eye className="w-8 h-8 text-orange-600" />
                Jogo de Atenção Visual
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Encontre todos os emojis alvos o mais rápido possível!
              </CardDescription>
            </div>
            <Button onClick={gameStarted ? resetGame : initializeGame} size="lg">
              <RotateCcw className="w-4 h-4 mr-2" />
              {gameStarted ? 'Reiniciar' : 'Começar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center flex-wrap">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Nível: {level}
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              Tempo: {formatTime(time)}
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              Pontos: {score}
            </Badge>
            {gameStarted && (
              <Badge variant="default" className="text-lg px-4 py-2">
                <Eye className="w-4 h-4 mr-2" />
                Encontrados: {found} / {targetCount}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {gameWon && (() => {
        const showFullReport = true; // In the future: userState.isPremium
        return (
          <Card className="mb-6 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 border-2 border-yellow-400 animate-bounce-in">
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-600 animate-pulse" />
                <h2 className="text-3xl font-bold mb-2">Parabéns! 🎉</h2>
                <p className="text-lg">
                  Você completou o treino com <strong>{score}</strong> pontos!
                </p>
              </div>

              {/* Premium / Detailed Report Section */}
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 border border-orange-200 dark:border-orange-700/50 relative overflow-hidden">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Relatório Analítico de Atenção Escaneada
                  {!showFullReport && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full uppercase tracking-wider">Pro</span>}
                </h3>

                {showFullReport ? (
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 text-sm">
                    <p><strong>Acurácia de Escaneamento:</strong> Excelente. Você encontrou todos os alvos.</p>
                    <p><strong>Custo de Tempo Adicional (Erros):</strong> {time > (level * 10) ? 'Foi um pouco alto devido aos cliques incorretos.' : 'Mínimo. Você filtrou bem os distratores visuais.'}</p>
                    <p className="mt-4 text-xs text-gray-500 italic">* Nota: A capacidade de varredura visual é crucial para desenvolvimento de foco sob carga de estímulos.</p>
                  </div>
                ) : (
                  <div className="absolute inset-0 backdrop-blur-sm bg-white/60 dark:bg-gray-800/80 flex flex-col items-center justify-center p-6 text-center">
                    <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
                    <h4 className="font-bold mb-1 dark:text-gray-100">Análise Premium de Desempenho</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Veja onde você está comparado à média, além das métricas aprofundadas sobre varredura visual.</p>
                    <Button className="bg-orange-500 hover:bg-orange-600">Desbloquear Relatório</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {!gameStarted ? (
        <Card className="border-2 border-dashed border-orange-300">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Eye className="w-20 h-20 mx-auto mb-4 text-orange-400" />
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                Clique em "Começar" para iniciar o jogo!
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Como jogar:</strong> Você verá um emoji alvo no topo. Encontre e clique em todos os emojis iguais no grid o mais rápido possível. Cuidado! Clicar no emoji errado adiciona 5 segundos ao seu tempo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/50 dark:to-yellow-900/50 border-2 border-orange-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-lg font-semibold mb-3">Encontre este emoji:</p>
                <div className="text-8xl mb-2 animate-pulse">{targetEmoji}</div>
                <p className="text-gray-600 dark:text-gray-300">
                  Faltam {targetCount - found} para completar o nível
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {grid.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleEmojiClick(item)}
                    disabled={item.found}
                    className={`
                      aspect-square rounded-lg text-3xl md:text-4xl
                      transition-all duration-200
                      ${item.found
                        ? 'bg-green-200 dark:bg-green-800 scale-110 opacity-50'
                        : 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 hover:scale-110 hover:shadow-lg cursor-pointer'
                      }
                      ${errorItemId === item.id ? 'animate-shake bg-red-200 dark:bg-red-800' : ''}
                      flex items-center justify-center
                    `}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card className="mt-6 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5" />
            Benefícios para TDAH
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-300">
            Este jogo ajuda a desenvolver <strong>atenção seletiva</strong> e <strong>concentração visual</strong>,
            habilidades importantes para pessoas com TDAH. A progressão de níveis mantém o desafio adequado e estimulante.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default AttentionGame
