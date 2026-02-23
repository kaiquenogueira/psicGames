import React, { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Gamepad2, Home, Users, Eye, Sparkles, FolderTree, Target, Zap, Focus, Brain, Palette } from 'lucide-react'
import { useAccessibility } from './contexts/AccessibilityContext.jsx'
import AttentionGame from './games/AttentionGame'
import SequenceGame from './games/SequenceGame'
import OrganizationGame from './games/OrganizationGame'
import FocusTrainingGame from './games/FocusTrainingGame'
import ReactionTimeGame from './games/ReactionTimeGame'
import SustainedAttentionGame from './games/SustainedAttentionGame'
import MultiplayerRoom from './MultiplayerRoom'
import MultiplayerGameWrapper from './MultiplayerGameWrapper'
import ContinuousPerformanceGame from './games/ContinuousPerformanceGame'
import IQTestGame from './games/IQTestGame'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [multiplayerData, setMultiplayerData] = useState(null)
  const { isHighContrast, toggleHighContrast } = useAccessibility()

  const adhdGames = [
    {
      id: 'attention',
      title: 'Jogo de Atenção Visual',
      description: 'Encontre os emojis alvos rapidamente. Desenvolve atenção seletiva!',
      iconUrl: '/icons/attention.png',
      category: 'adhd'
    },
    {
      id: 'cpt',
      title: 'Atenção Seletiva (CPT)',
      description: 'Teste neuropsicológico limpo para avaliar controle de impulsos. Baixa estimulação.',
      iconUrl: '/icons/cpt.png',
      category: 'adhd'
    },
    {
      id: 'sequence',
      title: 'Jogo de Sequência',
      description: 'Memorize e repita sequências. Treina memória de trabalho!',
      iconUrl: '/icons/sequence.png',
      category: 'adhd'
    },
    {
      id: 'organization',
      title: 'Jogo de Organização',
      description: 'Organize itens por categoria. Desenvolve habilidades organizacionais!',
      iconUrl: '/icons/organization.png',
      category: 'adhd'
    },
    {
      id: 'focus-training',
      title: 'Treino de Foco',
      description: 'Mantenha o foco no centro enquanto ignora distrações. Melhora concentração!',
      iconUrl: '/icons/focus-training.png',
      category: 'adhd'
    },
    {
      id: 'reaction-time',
      title: 'Tempo de Reação',
      description: 'Clique rapidamente quando ver o sinal. Treina velocidade de processamento!',
      iconUrl: '/icons/reaction-time.png',
      category: 'adhd'
    },
    {
      id: 'sustained-attention',
      title: 'Atenção Sustentada',
      description: 'Mantenha a atenção por períodos prolongados. Desenvolve resistência mental!',
      iconUrl: '/icons/sustained-attention.png',
      category: 'adhd'
    },
    {
      id: 'iq-test',
      title: 'Teste de QI Genérico',
      description: 'Avaliação lógica, identificação de padrões e raciocínio sequencial.',
      iconUrl: '/icons/iq-test.png',
      category: 'assessment'
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 relative">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleHighContrast}
        className={`absolute top-4 right-4 z-50 rounded-full transition-colors ${isHighContrast ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-white/50 dark:bg-black/50 hover:bg-white/80'}`}
        title="Alternar Modo de Alto Contraste (Acessibilidade)"
      >
        <Palette className="h-5 w-5" />
      </Button>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <Gamepad2 className="w-16 h-16 text-purple-600 dark:text-purple-400 mr-3 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Vocem
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Plataforma focada no desenvolvimento e avaliação de habilidades cognitivas.
          </p>
        </div>

        {/* Jogos para TDAH */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Jogos para Concentração e Foco
            </h2>

          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {adhdGames.map((game, index) => {
              return (
                <Card
                  key={game.id}
                  className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border-2 hover:border-orange-500/50 dark:hover:border-orange-500/50 animate-slide-up overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setCurrentView(game.id)}
                >
                  <CardHeader>
                    <div className="w-24 h-24 rounded-2xl overflow-hidden mb-5 shadow-2xl border border-black/5 dark:border-white/10 relative">
                      <img src={game.iconUrl} alt={`Ícone do ${game.title}`} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">{game.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{game.description}</CardDescription>
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
            Vocem - Desenvolvido para focar no que importa! 🧠
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
        case 'cpt':
          GameComponent = ContinuousPerformanceGame
          break
        case 'iq-test':
          GameComponent = IQTestGame
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
          initialPlayers={multiplayerData?.players}
          initialStarted={true}
          scoreMode={multiplayerData?.scoreMode || 'realtime'}
          matchDuration={multiplayerData?.matchDuration || null}
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
      case 'cpt':
        return <ContinuousPerformanceGame />
      case 'iq-test':
        return <IQTestGame />
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
    <div className="relative">
      {currentView !== 'home' && (
        <Button
          variant="outline"
          size="icon"
          onClick={toggleHighContrast}
          className={`absolute top-4 right-4 z-50 rounded-full transition-colors ${isHighContrast ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-black/20 text-white hover:bg-black/40 border-none'}`}
          title="Alternar Modo de Alto Contraste (Acessibilidade)"
        >
          <Palette className="h-5 w-5" />
        </Button>
      )}
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
