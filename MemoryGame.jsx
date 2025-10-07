import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Brain, RotateCcw, Trophy, Users, Timer } from 'lucide-react'

const emojis = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🥝', '🍍', '🥭', '🍑']

const MemoryGame = () => {
  const [cards, setCards] = useState([])
  const [flippedCards, setFlippedCards] = useState([])
  const [matchedCards, setMatchedCards] = useState([])
  const [moves, setMoves] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

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
    const shuffledEmojis = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false,
        matched: false,
      }))
    setCards(shuffledEmojis)
    setFlippedCards([])
    setMatchedCards([])
    setMoves(0)
    setGameStarted(true)
    setGameWon(false)
    setTime(0)
    setIsRunning(true)
  }

  const handleCardClick = (clickedCard) => {
    if (!gameStarted || gameWon || clickedCard.matched || flippedCards.length === 2) {
      return
    }

    setMoves(prevMoves => prevMoves + 1)

    const newCards = cards.map((card) =>
      card.id === clickedCard.id ? { ...card, flipped: true } : card
    )
    setCards(newCards)

    setFlippedCards((prevFlipped) => [...prevFlipped, clickedCard])
  }

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [card1, card2] = flippedCards

      if (card1.emoji === card2.emoji) {
        setMatchedCards((prevMatched) => [...prevMatched, card1.emoji])
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.emoji === card1.emoji ? { ...card, matched: true } : card
          )
        )
        setFlippedCards([])
      } else {
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === card1.id || card.id === card2.id
                ? { ...card, flipped: false }
                : card
            )
          )
          setFlippedCards([])
        }, 1000)
      }
    }
  }, [flippedCards, cards])

  useEffect(() => {
    if (matchedCards.length === emojis.length && gameStarted) {
      setGameWon(true)
      setIsRunning(false)
    }
  }, [matchedCards, gameStarted])

  const resetGame = () => {
    setGameStarted(false)
    setGameWon(false)
    setIsRunning(false)
    setCards([])
    setFlippedCards([])
    setMatchedCards([])
    setMoves(0)
    setTime(0)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-purple-900 border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Brain className="w-8 h-8 text-purple-600" />
                Jogo da Memória
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Encontre os pares de cartas iguais. Teste sua memória!
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
              <Timer className="w-4 h-4 mr-2" />
              Tempo: {formatTime(time)}
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              Movimentos: {moves}
            </Badge>
            {gameStarted && (
              <Badge variant="default" className="text-lg px-4 py-2">
                Pares Encontrados: {matchedCards.length} / {emojis.length}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {gameWon && (
        <Card className="mb-6 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 border-2 border-green-400 animate-bounce-in">
          <CardContent className="pt-6">
            <div className="text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-green-600 animate-pulse" />
              <h2 className="text-3xl font-bold mb-2">Parabéns! 🎉</h2>
              <p className="text-lg">
                Você encontrou todos os pares em <strong>{formatTime(time)}</strong> e <strong>{moves}</strong> movimentos!
              </p>
              <p className="text-base mt-2 text-gray-600 dark:text-gray-300">
                Sua memória está afiada!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!gameStarted ? (
        <Card className="border-2 border-dashed border-purple-300">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Brain className="w-20 h-20 mx-auto mb-4 text-purple-400" />
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                Clique em "Começar" para iniciar o jogo!
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Como jogar:</strong> Vire duas cartas por vez para encontrar os pares de emojis. Tente encontrar todos os pares com o menor número de movimentos e no menor tempo possível!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-w-4xl mx-auto">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`card-flip ${card.flipped || card.matched ? 'flipped' : ''}`}
                  onClick={() => handleCardClick(card)}
                >
                  <div className="card-front w-full aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center text-4xl cursor-pointer shadow-md hover:shadow-lg transition-all duration-200">
                    ❓
                  </div>
                  <div className="card-back w-full aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center text-4xl shadow-md">
                    {card.emoji}
                  </div>
                </div>
              ))}
            </div>
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
            Este jogo estimula a <strong>memória de curto prazo</strong>, a <strong>atenção sustentada</strong> e a <strong>concentração</strong>, 
            habilidades essenciais para pessoas com TDAH. A natureza visual e interativa ajuda a manter o engajamento.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default MemoryGame
