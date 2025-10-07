import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Search, RotateCcw, Trophy, Users, Timer } from 'lucide-react'

const images = [
  {
    id: 1,
    src1: 'https://via.placeholder.com/400x300/FF5733/FFFFFF?text=Imagem+1a',
    src2: 'https://via.placeholder.com/400x300/FF5733/FFFFFF?text=Imagem+1b',
    differences: [
      { x: 50, y: 50, radius: 20 },
      { x: 150, y: 100, radius: 15 },
      { x: 250, y: 150, radius: 25 },
      { x: 300, y: 200, radius: 10 },
      { x: 100, y: 250, radius: 18 },
      { x: 200, y: 70, radius: 22 },
      { x: 350, y: 80, radius: 12 }
    ]
  },
  {
    id: 2,
    src1: 'https://via.placeholder.com/400x300/33FF57/FFFFFF?text=Imagem+2a',
    src2: 'https://via.placeholder.com/400x300/33FF57/FFFFFF?text=Imagem+2b',
    differences: [
      { x: 70, y: 70, radius: 25 },
      { x: 180, y: 120, radius: 18 },
      { x: 280, y: 180, radius: 20 },
      { x: 120, y: 220, radius: 15 },
      { x: 320, y: 60, radius: 10 },
      { x: 80, y: 180, radius: 22 },
      { x: 220, y: 250, radius: 17 }
    ]
  }
]

const SpotDifferenceGame = () => {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [currentImage, setCurrentImage] = useState(null)
  const [foundDifferences, setFoundDifferences] = useState([])
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const canvasRef1 = useRef(null)
  const canvasRef2 = useRef(null)

  useEffect(() => {
    let interval
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    if (currentImage) {
      loadImagesToCanvas()
    }
  }, [currentImage])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const initializeGame = () => {
    const randomImage = images[Math.floor(Math.random() * images.length)]
    setCurrentImage(randomImage)
    setFoundDifferences([])
    setGameStarted(true)
    setGameWon(false)
    setTime(0)
    setIsRunning(true)
  }

  const loadImagesToCanvas = () => {
    const canvas1 = canvasRef1.current
    const canvas2 = canvasRef2.current
    
    if (!canvas1 || !canvas2 || !currentImage) return
    
    const ctx1 = canvas1.getContext('2d')
    const ctx2 = canvas2.getContext('2d')
    
    // Set canvas size first
    canvas1.width = 400
    canvas1.height = 300
    canvas2.width = 400
    canvas2.height = 300
    
    const img1 = new Image()
    img1.crossOrigin = "anonymous"
    img1.onload = () => {
      ctx1.clearRect(0, 0, canvas1.width, canvas1.height)
      ctx1.drawImage(img1, 0, 0, canvas1.width, canvas1.height)
      drawFoundDifferences(ctx1)
    }
    img1.onerror = () => {
      // Fallback: draw a colored rectangle with text
      ctx1.fillStyle = '#FF5733'
      ctx1.fillRect(0, 0, canvas1.width, canvas1.height)
      ctx1.fillStyle = 'white'
      ctx1.font = '20px Arial'
      ctx1.textAlign = 'center'
      ctx1.fillText('Imagem 1', canvas1.width/2, canvas1.height/2)
      drawFoundDifferences(ctx1)
    }
    img1.src = currentImage.src1

    const img2 = new Image()
    img2.crossOrigin = "anonymous"
    img2.onload = () => {
      ctx2.clearRect(0, 0, canvas2.width, canvas2.height)
      ctx2.drawImage(img2, 0, 0, canvas2.width, canvas2.height)
      drawFoundDifferences(ctx2)
    }
    img2.onerror = () => {
      // Fallback: draw a colored rectangle with text
      ctx2.fillStyle = '#33FF57'
      ctx2.fillRect(0, 0, canvas2.width, canvas2.height)
      ctx2.fillStyle = 'white'
      ctx2.font = '20px Arial'
      ctx2.textAlign = 'center'
      ctx2.fillText('Imagem 2', canvas2.width/2, canvas2.height/2)
      drawFoundDifferences(ctx2)
    }
    img2.src = currentImage.src2
  }

  const drawFoundDifferences = (ctx) => {
    foundDifferences.forEach(diff => {
      ctx.beginPath()
      ctx.arc(diff.x, diff.y, diff.radius, 0, Math.PI * 2, false)
      ctx.strokeStyle = 'cyan'
      ctx.lineWidth = 3
      ctx.stroke()
    })
  }

  const handleClick = (e) => {
    if (!gameStarted || gameWon) return

    const canvas = e.target
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    currentImage.differences.forEach((diff, index) => {
      const distance = Math.sqrt((x - diff.x) ** 2 + (y - diff.y) ** 2)
      if (distance < diff.radius && !foundDifferences.some(fd => fd.x === diff.x && fd.y === diff.y)) {
        setFoundDifferences(prev => [...prev, diff])
        
        // Redraw both canvases
        loadImagesToCanvas()

        if (foundDifferences.length + 1 === currentImage.differences.length) {
          setGameWon(true)
          setIsRunning(false)
        }
      }
    })
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameWon(false)
    setIsRunning(false)
    setCurrentImage(null)
    setFoundDifferences([])
    setTime(0)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-blue-900 border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Search className="w-8 h-8 text-blue-600" />
                Jogo dos 7 Erros
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Encontre as 7 diferenças entre as duas imagens!
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
              Diferenças Encontradas: {foundDifferences.length} / {currentImage ? currentImage.differences.length : 7}
            </Badge>
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
                Você encontrou todas as 7 diferenças em <strong>{formatTime(time)}</strong>!
              </p>
              <p className="text-base mt-2 text-gray-600 dark:text-gray-300">
                Sua percepção visual é excelente!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!gameStarted ? (
        <Card className="border-2 border-dashed border-blue-300">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Search className="w-20 h-20 mx-auto mb-4 text-blue-400" />
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                Clique em "Começar" para iniciar o jogo!
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Como jogar:</strong> Duas imagens aparentemente idênticas serão exibidas. Encontre e clique nas 7 diferenças entre elas o mais rápido possível!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <canvas ref={canvasRef1} onClick={handleClick} className="w-full h-auto rounded-lg shadow-md border-2 border-blue-200"></canvas>
              <canvas ref={canvasRef2} onClick={handleClick} className="w-full h-auto rounded-lg shadow-md border-2 border-blue-200"></canvas>
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
            Este jogo aprimora a <strong>atenção aos detalhes</strong>, a <strong>percepção visual</strong> e a <strong>concentração sustentada</strong>, 
            habilidades cruciais para indivíduos com TDAH. O desafio de encontrar diferenças em um tempo limitado ajuda a manter o foco.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default SpotDifferenceGame
