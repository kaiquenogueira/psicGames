import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Trophy, RotateCcw, Users, FolderTree, Clock, Zap } from 'lucide-react'

const OrganizationGame = () => {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [draggedItem, setDraggedItem] = useState(null)
  const [correctPlacements, setCorrectPlacements] = useState(0)

  const itemsByCategory = {
    'Frutas': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒'],
    'Animais': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
    'Esportes': ['⚽', '🏀', '🎾', '🏐', '🎱', '🏓', '🏸', '🥊'],
    'Veículos': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑'],
    'Comidas': ['🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍰', '🍪'],
    'Instrumentos': ['🎸', '🎹', '🎺', '🎻', '🥁', '🎷', '🪕', '🎤']
  }

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
    // Selecionar categorias baseado no nível
    const numCategories = Math.min(2 + level, 4)
    const allCategories = Object.keys(itemsByCategory)
    const selectedCategories = []
    
    while (selectedCategories.length < numCategories) {
      const randomCat = allCategories[Math.floor(Math.random() * allCategories.length)]
      if (!selectedCategories.includes(randomCat)) {
        selectedCategories.push(randomCat)
      }
    }
    
    // Criar itens para organizar
    const itemsPerCategory = Math.min(3 + Math.floor(level / 2), 6)
    const newItems = []
    
    selectedCategories.forEach(category => {
      const categoryItems = itemsByCategory[category]
      for (let i = 0; i < itemsPerCategory; i++) {
        newItems.push({
          id: `${category}-${i}`,
          emoji: categoryItems[i % categoryItems.length],
          category: category,
          placed: false
        })
      }
    })
    
    // Embaralhar itens
    newItems.sort(() => Math.random() - 0.5)
    
    // Criar categorias com arrays vazios
    const newCategories = selectedCategories.map(cat => ({
      name: cat,
      items: []
    }))
    
    setItems(newItems)
    setCategories(newCategories)
    setCorrectPlacements(0)
    setGameStarted(true)
    setGameWon(false)
    setTime(0)
    setIsRunning(true)
  }

  const handleDragStart = (e, item) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, categoryName) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem.placed) return
    
    // Verificar se está na categoria correta
    if (draggedItem.category === categoryName) {
      // Correto!
      const newItems = items.map(item => 
        item.id === draggedItem.id ? { ...item, placed: true } : item
      )
      setItems(newItems)
      
      const newCategories = categories.map(cat => 
        cat.name === categoryName 
          ? { ...cat, items: [...cat.items, draggedItem] }
          : cat
      )
      setCategories(newCategories)
      
      const newCorrect = correctPlacements + 1
      setCorrectPlacements(newCorrect)
      
      // Adicionar pontos
      const points = Math.max(100 - time, 10) * level
      setScore(score + points)
      
      // Verificar se completou o nível
      const totalItems = items.length
      if (newCorrect === totalItems) {
        setIsRunning(false)
        setTimeout(() => {
          if (level < 5) {
            setLevel(level + 1)
            setTime(0)
            initializeGame()
          } else {
            setGameWon(true)
          }
        }, 1000)
      }
    } else {
      // Errado - penalidade de tempo
      setTime(time + 3)
    }
    
    setDraggedItem(null)
  }

  const resetGame = () => {
    setLevel(1)
    setScore(0)
    setTime(0)
    setGameStarted(false)
    setGameWon(false)
    setIsRunning(false)
    setItems([])
    setCategories([])
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-6 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-teal-900 border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <FolderTree className="w-8 h-8 text-teal-600" />
                Jogo de Organização
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Organize os itens nas categorias corretas!
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
                Organizados: {correctPlacements} / {items.length}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {gameWon && (
        <Card className="mb-6 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900 border-2 border-green-400 animate-bounce-in">
          <CardContent className="pt-6">
            <div className="text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-green-600 animate-pulse" />
              <h2 className="text-3xl font-bold mb-2">Parabéns! 🎉</h2>
              <p className="text-lg">
                Você completou todos os níveis com <strong>{score}</strong> pontos!
              </p>
              <p className="text-base mt-2 text-gray-600 dark:text-gray-300">
                Suas habilidades de organização estão excelentes!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!gameStarted ? (
        <Card className="border-2 border-dashed border-teal-300">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FolderTree className="w-20 h-20 mx-auto mb-4 text-teal-400" />
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                Clique em "Começar" para iniciar o jogo!
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Como jogar:</strong> Arraste cada item para a categoria correta. Organize todos os itens o mais rápido possível. Cuidado! Colocar na categoria errada adiciona 3 segundos ao seu tempo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Itens para Organizar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 min-h-[80px] p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                {items.filter(item => !item.placed).map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    className="w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-700 dark:to-pink-700 rounded-lg flex items-center justify-center text-4xl cursor-move hover:scale-110 transition-transform shadow-md"
                  >
                    {item.emoji}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card
                key={category.name}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, category.name)}
                className="border-2 border-dashed border-teal-300 hover:border-teal-500 transition-colors"
              >
                <CardHeader>
                  <CardTitle className="text-lg text-center">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[120px] flex flex-wrap gap-2 p-3 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                    {category.items.map((item) => (
                      <div
                        key={item.id}
                        className="w-14 h-14 bg-gradient-to-br from-green-200 to-teal-200 dark:from-green-700 dark:to-teal-700 rounded-lg flex items-center justify-center text-3xl shadow-md"
                      >
                        {item.emoji}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
            Este jogo desenvolve <strong>habilidades organizacionais</strong> e <strong>categorização</strong>, 
            fundamentais para pessoas com TDAH. Ajuda a treinar o cérebro a classificar informações e 
            manter a ordem, habilidades que podem ser transferidas para o dia a dia.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default OrganizationGame
