import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Trophy, RotateCcw, Users, FolderTree, Clock, Zap } from 'lucide-react'

const OrganizationGame = ({ isMultiplayer = false, onScoreUpdate, onGameComplete, roomCode, sessionId, scoreMode = 'realtime', matchDuration = null }) => {
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
  
  // Estados para touch/mobile
  const [selectedItem, setSelectedItem] = useState(null)
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const dragElementRef = useRef(null)
  const containerRef = useRef(null)

  // Configurar event listeners para touch com { passive: false }
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStartPassive = (e) => {
      if (!selectedItem) return
      
      const touch = e.touches[0]
      const target = e.target.closest('[data-draggable-item]')
      if (!target) return
      
      const itemId = target.dataset.draggableItem
      const item = items.find(i => i.id === itemId && !i.placed)
      if (!item) return
      
      const rect = target.getBoundingClientRect()
      
      setSelectedItem(item)
      setTouchStartPos({ x: touch.clientX, y: touch.clientY })
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      })
      setIsDragging(false)
      
      // Prevenir scroll apenas quando necessário
      e.preventDefault()
    }

    const handleTouchMovePassive = (e) => {
      if (!selectedItem) return
      
      const touch = e.touches[0]
      const deltaX = Math.abs(touch.clientX - touchStartPos.x)
      const deltaY = Math.abs(touch.clientY - touchStartPos.y)
      
      // Iniciar drag se moveu mais de 10px
      if (!isDragging && (deltaX > 10 || deltaY > 10)) {
        setIsDragging(true)
        setDraggedItem(selectedItem)
        e.preventDefault() // Prevenir scroll durante drag
      }
      
      if (isDragging && dragElementRef.current) {
        dragElementRef.current.style.position = 'fixed'
        dragElementRef.current.style.left = `${touch.clientX - dragOffset.x}px`
        dragElementRef.current.style.top = `${touch.clientY - dragOffset.y}px`
        dragElementRef.current.style.zIndex = '1000'
        dragElementRef.current.style.pointerEvents = 'none'
        dragElementRef.current.style.transform = 'scale(1.1)'
        dragElementRef.current.style.opacity = '0.8'
        e.preventDefault()
      }
    }

    const handleTouchEndPassive = (e) => {
      if (!selectedItem) return
      
      if (isDragging) {
        const touch = e.changedTouches[0]
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
        
        // Encontrar a categoria de destino
        let targetCategory = null
        let element = elementBelow
        
        while (element && !targetCategory) {
          if (element.dataset && element.dataset.category) {
            targetCategory = element.dataset.category
            break
          }
          element = element.parentElement
        }
        
        if (targetCategory) {
          handleItemDrop(selectedItem, targetCategory)
        }
        
        // Reset do elemento visual
        if (dragElementRef.current) {
          dragElementRef.current.style.position = ''
          dragElementRef.current.style.left = ''
          dragElementRef.current.style.top = ''
          dragElementRef.current.style.zIndex = ''
          dragElementRef.current.style.pointerEvents = ''
          dragElementRef.current.style.transform = ''
          dragElementRef.current.style.opacity = ''
        }
        
        setDraggedItem(null)
      }
      
      setSelectedItem(null)
      setIsDragging(false)
    }

    // Adicionar listeners com { passive: false } apenas quando necessário
    container.addEventListener('touchstart', handleTouchStartPassive, { passive: false })
    container.addEventListener('touchmove', handleTouchMovePassive, { passive: false })
    container.addEventListener('touchend', handleTouchEndPassive, { passive: false })

    return () => {
      container.removeEventListener('touchstart', handleTouchStartPassive)
      container.removeEventListener('touchmove', handleTouchMovePassive)
      container.removeEventListener('touchend', handleTouchEndPassive)
    }
  }, [selectedItem, touchStartPos, isDragging, dragOffset, items])

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

  // Funções para touch/mobile - simplificadas para usar apenas com clique
  const handleTouchStart = (e, item) => {
    // Apenas para compatibilidade - a lógica principal está no useEffect
    return
  }

  const handleTouchMove = (e) => {
    // Apenas para compatibilidade - a lógica principal está no useEffect
    return
  }

  const handleTouchEnd = (e) => {
    // Apenas para compatibilidade - a lógica principal está no useEffect
    return
  }

  const handleItemClick = (item) => {
    if (selectedItem && selectedItem.id === item.id) {
      // Deselecionar se clicar no mesmo item
      setSelectedItem(null)
    } else {
      // Selecionar item
      setSelectedItem(item)
    }
  }

  const handleCategoryClick = (categoryName) => {
    if (selectedItem && !selectedItem.placed) {
      handleItemDrop(selectedItem, categoryName)
      setSelectedItem(null)
    }
  }

  const handleItemDrop = (item, categoryName) => {
    if (!item || item.placed) return
    
    // Verificar se está na categoria correta
    if (item.category === categoryName) {
      // Correto!
      const newItems = items.map(i => 
        i.id === item.id ? { ...i, placed: true } : i
      )
      setItems(newItems)
      
      const newCategories = categories.map(cat => 
        cat.name === categoryName 
          ? { ...cat, items: [...cat.items, item] }
          : cat
      )
      setCategories(newCategories)
      
      const newCorrect = correctPlacements + 1
      setCorrectPlacements(newCorrect)
      
      // Adicionar pontos
      const points = Math.max(100 - time, 10) * level
      const newScore = score + points
      setScore(newScore)
      if (isMultiplayer && scoreMode !== 'final_only' && onScoreUpdate) onScoreUpdate(newScore)
      
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
            if (isMultiplayer && onGameComplete) onGameComplete(newScore)
          }
        }, 1000)
      }
    } else {
      // Errado - penalidade de tempo
      setTime(time + 3)
    }
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

  const handleDrop = (e, categoryName) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem.placed) return
    
    handleItemDrop(draggedItem, categoryName)
    setDraggedItem(null)
  }

  // Disparar resultado final ao concluir (ganho ou timer)
  useEffect(() => {
    if (gameWon && isMultiplayer && typeof onGameComplete === 'function') {
      onGameComplete(score)
    }
  }, [gameWon])

  const resetGame = () => {
    setLevel(1)
    setScore(0)
    setTime(0)
    setGameStarted(false)
    setGameWon(false)
    setIsRunning(false)
    setItems([])
    setCategories([])
    setSelectedItem(null)
    setIsDragging(false)
    setDraggedItem(null)
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
                  <strong>Como jogar:</strong> 
                  <br />
                  <strong>Desktop:</strong> Arraste cada item para a categoria correta.
                  <br />
                  <strong>Mobile:</strong> Toque em um item para selecioná-lo, depois toque na categoria correta. Ou arraste o item diretamente.
                  <br />
                  Organize todos os itens o mais rápido possível. Cuidado! Colocar na categoria errada adiciona 3 segundos ao seu tempo.
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
                    ref={selectedItem && selectedItem.id === item.id ? dragElementRef : null}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => handleItemClick(item)}
                    className={`w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-700 dark:to-pink-700 rounded-lg flex items-center justify-center text-4xl cursor-move hover:scale-110 transition-transform shadow-md select-none ${
                      selectedItem && selectedItem.id === item.id 
                        ? 'ring-4 ring-blue-400 ring-opacity-75 scale-110' 
                        : ''
                    } ${isDragging && selectedItem && selectedItem.id === item.id ? 'opacity-50' : ''}`}
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
                data-category={category.name}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, category.name)}
                onClick={() => handleCategoryClick(category.name)}
                className={`border-2 border-dashed transition-all duration-200 cursor-pointer ${
                  selectedItem && !selectedItem.placed
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                    : 'border-teal-300 hover:border-teal-500'
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-lg text-center flex items-center justify-center gap-2">
                    {category.name}
                    {selectedItem && !selectedItem.placed && (
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-normal">
                        (toque para organizar)
                      </span>
                    )}
                  </CardTitle>
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
