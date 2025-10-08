import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Trophy, RotateCcw, Users, Sparkles, Zap } from 'lucide-react'

const SequenceGame = ({ 
  isMultiplayer = false, 
  onScoreUpdate, 
  onGameComplete, 
  onGameAction, 
  roomCode, 
  sessionId 
}) => {
  const [gameStarted, setGameStarted] = useState(false)
  const [sequence, setSequence] = useState([])
  const [playerSequence, setPlayerSequence] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [activeColor, setActiveColor] = useState(null)
  const [message, setMessage] = useState('')

  const colors = [
    { id: 0, name: 'Vermelho', color: 'bg-red-500', activeColor: 'bg-red-400 ring-4 ring-red-200 shadow-xl shadow-red-300/50', sound: 'C' },
    { id: 1, name: 'Azul', color: 'bg-blue-500', activeColor: 'bg-blue-400 ring-4 ring-blue-200 shadow-xl shadow-blue-300/50', sound: 'D' },
    { id: 2, name: 'Verde', color: 'bg-green-500', activeColor: 'bg-green-400 ring-4 ring-green-200 shadow-xl shadow-green-300/50', sound: 'E' },
    { id: 3, name: 'Amarelo', color: 'bg-yellow-500', activeColor: 'bg-yellow-400 ring-4 ring-yellow-200 shadow-xl shadow-yellow-300/50', sound: 'F' }
  ]

  const playSound = (colorId) => {
    // Criar um som simples usando Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    const frequencies = [261.63, 293.66, 329.63, 349.23] // C, D, E, F
    oscillator.frequency.value = frequencies[colorId]
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const flashColor = (colorId) => {
    return new Promise((resolve) => {
      setActiveColor(colorId)
      playSound(colorId)
      setTimeout(() => {
        setActiveColor(null)
        setTimeout(resolve, 200)
      }, 600)
    })
  }

  const playSequence = async (seq) => {
    setIsPlaying(true)
    setMessage('Memorize a sequência...')
    
    for (const colorId of seq) {
      await flashColor(colorId)
    }
    
    setIsPlaying(false)
    setMessage('Sua vez! Repita a sequência.')
  }

  const initializeGame = () => {
    const firstColor = Math.floor(Math.random() * 4)
    const newSequence = [firstColor]
    
    setSequence(newSequence)
    setPlayerSequence([])
    setLevel(1)
    setScore(0)
    setGameStarted(true)
    setGameOver(false)
    setMessage('')
    
    setTimeout(() => {
      playSequence(newSequence)
    }, 500)
  }

  // Auto-inicializar o jogo no modo multiplayer
  useEffect(() => {
    if (isMultiplayer && !gameStarted) {
      initializeGame()
    }
  }, [isMultiplayer])

  const handleColorClick = async (colorId) => {
    if (isPlaying || gameOver) return
    
    await flashColor(colorId)
    
    const newPlayerSequence = [...playerSequence, colorId]
    setPlayerSequence(newPlayerSequence)
    
    // Verificar se está correto
    const currentIndex = newPlayerSequence.length - 1
    
    if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
      // Errou!
      setGameOver(true)
      setMessage('Ops! Sequência incorreta. Tente novamente!')
      
      // Notificar o multiplayer sobre o fim do jogo
      if (isMultiplayer && onGameComplete) {
        onGameComplete(score)
      }
      
      return
    }
    
    // Verificar se completou a sequência
    if (newPlayerSequence.length === sequence.length) {
      // Acertou a sequência completa!
      const points = sequence.length * 100
      const newScore = score + points
      setScore(newScore)
      setLevel(level + 1)
      setMessage('Parabéns! Próximo nível...')
      
      // Notificar o multiplayer sobre a atualização do score
      if (isMultiplayer && onScoreUpdate) {
        onScoreUpdate(newScore)
      }
      
      setTimeout(() => {
        const nextColor = Math.floor(Math.random() * 4)
        const newSequence = [...sequence, nextColor]
        setSequence(newSequence)
        setPlayerSequence([])
        playSequence(newSequence)
      }, 1500)
    }
  }

  const resetGame = () => {
    setGameStarted(false)
    setSequence([])
    setPlayerSequence([])
    setLevel(1)
    setScore(0)
    setGameOver(false)
    setMessage('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-indigo-900 border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-indigo-600" />
                Jogo de Sequência
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Memorize e repita a sequência de cores!
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
              <Trophy className="w-4 h-4 mr-2" />
              Pontos: {score}
            </Badge>
            {gameStarted && (
              <Badge variant="default" className="text-lg px-4 py-2">
                Sequência: {sequence.length} cores
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {message && (
        <Card className={`mb-6 ${gameOver ? 'bg-red-100 dark:bg-red-900/30 border-red-300' : 'bg-blue-100 dark:bg-blue-900/30 border-blue-300'} border-2`}>
          <CardContent className="pt-6">
            <p className="text-center text-lg font-semibold">
              {message}
            </p>
          </CardContent>
        </Card>
      )}

      {!gameStarted ? (
        <Card className="border-2 border-dashed border-indigo-300">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Sparkles className="w-20 h-20 mx-auto mb-4 text-indigo-400" />
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                Clique em "Começar" para iniciar o jogo!
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Como jogar:</strong> Observe a sequência de cores que pisca. Depois, repita a sequência clicando nas cores na ordem correta. A cada nível, uma nova cor é adicionada à sequência!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleColorClick(color.id)}
                  disabled={isPlaying || gameOver}
                  className={`
                    aspect-square rounded-2xl
                    ${activeColor === color.id ? `${color.activeColor} scale-110` : color.color}
                    ${isPlaying || gameOver ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer active:scale-95'}
                    transition-all duration-200 shadow-lg
                    flex items-center justify-center
                    text-white font-bold text-xl
                    border-2 border-white/20
                  `}
                >
                  {color.name}
                </button>
              ))}
            </div>
            
            {gameOver && (
              <div className="text-center mt-6">
                <Button onClick={initializeGame} size="lg">
                  Tentar Novamente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
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
            Este jogo trabalha a <strong>memória de trabalho</strong> e a <strong>atenção sustentada</strong>, 
            habilidades fundamentais para pessoas com TDAH. A combinação de estímulos visuais e auditivos 
            ajuda a manter o foco e treinar a capacidade de reter informações temporárias.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default SequenceGame
