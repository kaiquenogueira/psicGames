import React, { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Gamepad2, Home, Users, Eye, Sparkles, FolderTree, Target, Zap, Focus } from 'lucide-react'
import AttentionGame from './AttentionGame'
import SequenceGame from './SequenceGame'
import OrganizationGame from './OrganizationGame'
import FocusTrainingGame from './FocusTrainingGame'
import ReactionTimeGame from './ReactionTimeGame'
import SustainedAttentionGame from './SustainedAttentionGame'
import MultiplayerRoom from './MultiplayerRoom'
import MultiplayerGameWrapper from './MultiplayerGameWrapper'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [multiplayerData, setMultiplayerData] = useState(null)

  const adhdGames = [
    {
      id: 'attention',
      title: 'Jogo de Atenção Visual',
      description: 'Encontre os emojis alvos rapidamente. Desenvolve atenção seletiva!',
      icon: Eye,
      color: 'from-orange-500 to-yellow-500',
      category: 'adhd'
    },
    {
      id: 'sequence',
      title: 'Jogo de Sequência',
      description: 'Memorize e repita sequências. Treina memória de trabalho!',
      icon: Sparkles,
      color: 'from-indigo-500 to-purple-500',
      category: 'adhd'
    },
    {
      id: 'organization',
      title: 'Jogo de Organização',
      description: 'Organize itens por categoria. Desenvolve habilidades organizacionais!',
      icon: FolderTree,
      color: 'from-teal-500 to-cyan-500',
      category: 'adhd'
    },
    {
      id: 'focus-training',
      title: 'Treino de Foco',
      description: 'Mantenha o foco no centro enquanto ignora distrações. Melhora concentração!',
      icon: Target,
      color: 'from-red-500 to-orange-500',
      category: 'adhd'
    },
    {
      id: 'reaction-time',
      title: 'Tempo de Reação',
      description: 'Clique rapidamente quando ver o sinal. Treina velocidade de processamento!',
      icon: Zap,
      color: 'from-yellow-500 to-green-500',
      category: 'adhd'
    },
    {
      id: 'sustained-attention',
      title: 'Atenção Sustentada',
      description: 'Mantenha a atenção por períodos prolongados. Desenvolve resistência mental!',
      icon: Focus,
      color: 'from-blue-500 to-indigo-500',
      category: 'adhd'
    }
  ]

  const handleMultiplayerStart = (data) => {
    console.log('📥 handleMultiplayerStart recebeu dados:', data)
    console.log('📥 roomCode recebido:', data?.roomCode)
    setMultiplayerData(data)
    setCurrentView(`multiplayer-${data.gameType}`)
  }

  const handleMultiplayerEnd = () => {
    setMultiplayerData(null)
    setCurrentView('multiplayer')
  }

  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <Gamepad2 className="w-16 h-16 text-purple-600 dark:text-purple-400 mr-3 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Jogos em Família
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Divirta-se com jogos simples e multiplayer para toda a família!
          </p>
        </div>

        {/* Jogos para TDAH */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Jogos para Concentração e Foco
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Especialmente desenvolvidos para ajudar pessoas com TDAH
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {adhdGames.map((game, index) => {
              const Icon = game.icon
              return (
                <Card 
                  key={game.id}
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-orange-400 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setCurrentView(game.id)}
                >
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{game.title}</CardTitle>
                    <CardDescription className="text-sm">{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" size="lg" variant="secondary">
                      Jogar Agora
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-purple-900 border-2 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="w-6 h-6" />
              Modo Multiplayer
            </CardTitle>
            <CardDescription className="text-base">
              Crie ou entre em uma sala para jogar com amigos e familiares
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setCurrentView('multiplayer')}
              size="lg"
              className="w-full"
            >
              <Users className="w-5 h-5 mr-2" />
              Acessar Salas Multiplayer
            </Button>
          </CardContent>
        </Card>

        <div className="mt-12 text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            Plataforma de Jogos em Família - Diversão e desenvolvimento para todas as idades! 🎮
          </p>
        </div>
      </div>
    </div>
  )

  const renderGame = () => {
    if (currentView.startsWith('multiplayer-')) {
      const gameType = currentView.replace('multiplayer-', '')
      let GameComponent

      switch (gameType) {
        case 'attention':
          GameComponent = AttentionGame
          break
        case 'sequence':
          GameComponent = SequenceGame
          break
        case 'organization':
          GameComponent = OrganizationGame
          break
        case 'focus-training':
          GameComponent = FocusTrainingGame
          break
        case 'reaction-time':
          GameComponent = ReactionTimeGame
          break
        case 'sustained-attention':
          GameComponent = SustainedAttentionGame
          break
        default:
          return <div>Jogo não encontrado</div>
      }

      return (
        <MultiplayerGameWrapper
          GameComponent={GameComponent}
          gameType={gameType}
          roomCode={multiplayerData?.roomCode}
          onGameEnd={handleMultiplayerEnd}
          onLeaveRoom={() => setCurrentView('multiplayer')}
        />
      )
    }

    // Jogos single player existentes
    switch (currentView) {
      case 'attention':
        return <AttentionGame />
      case 'sequence':
        return <SequenceGame />
      case 'organization':
        return <OrganizationGame />
      case 'focus-training':
        return <FocusTrainingGame />
      case 'reaction-time':
        return <ReactionTimeGame />
      case 'sustained-attention':
        return <SustainedAttentionGame />
      case 'multiplayer':
        return (
          <MultiplayerRoom 
            onStartGame={handleMultiplayerStart}
            onLeave={() => setCurrentView('home')}
          />
        )
      default:
        return null
    }
  }

  return (
    <div>
      {currentView === 'home' && renderHome()}
      {currentView !== 'home' && (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
          <div className="max-w-6xl mx-auto">
            <Button
              onClick={() => setCurrentView('home')}
              variant="outline"
              className="mb-6"
            >
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Menu
            </Button>
            {renderGame()}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
