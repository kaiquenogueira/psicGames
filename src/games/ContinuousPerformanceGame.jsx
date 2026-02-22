import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Trophy, RefreshCw, AlertCircle } from 'lucide-react';

/* 
 * Continuous Performance Task (CPT)
 * A visually clean, low-stimulation game ideal for ADHD/neurodivergent users.
 * Goal: Click/Tap ONLY when the target stimulus (Blue Circle) appears. Ignore others (distractors).
 */

const STIMULUS_DURATION = 1000; // How long the shape stays on screen
const INTER_STIMULUS_INTERVAL = 1500; // Time between shapes
const TOTAL_TRIALS = 20;

const STIMULI = [
    { type: 'target', label: 'Círculo Azul', color: 'bg-blue-500', shape: 'rounded-full' },
    { type: 'distractor', label: 'Quadrado Azul', color: 'bg-blue-500', shape: 'rounded-lg' },
    { type: 'distractor', label: 'Círculo Vermelho', color: 'bg-red-500', shape: 'rounded-full' },
    { type: 'distractor', label: 'Quadrado Vermelho', color: 'bg-red-500', shape: 'rounded-lg' },
    { type: 'distractor', label: 'Triângulo Verde', color: 'border-b-green-500', shape: 'triangle' },
];

export default function ContinuousPerformanceGame() {
    const [gameState, setGameState] = useState('menu'); // menu, playing, feedback, finished
    const [currentTrial, setCurrentTrial] = useState(0);
    const [currentStimulus, setCurrentStimulus] = useState(null);

    // Stats
    const [hits, setHits] = useState(0); // Correctly clicked target
    const [misses, setMisses] = useState(0); // Failed to click target
    const [falseAlarms, setFalseAlarms] = useState(0); // Clicked on distractor
    const [correctRejections, setCorrectRejections] = useState(0); // Correctly ignored distractor
    const [reactionTimes, setReactionTimes] = useState([]);

    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackColor, setFeedbackColor] = useState('');

    const stimulusStartTimeRef = useRef(0);
    const trialTimeoutRef = useRef(null);
    const isiTimeoutRef = useRef(null);
    const hasRespondedRef = useRef(false);

    const startGame = () => {
        setGameState('playing');
        setHits(0);
        setMisses(0);
        setFalseAlarms(0);
        setCorrectRejections(0);
        setReactionTimes([]);
        setCurrentTrial(0);
        nextTrial(0);
    };

    const nextTrial = (trialIndex) => {
        if (trialIndex >= TOTAL_TRIALS) {
            endGame();
            return;
        }

        setCurrentTrial(trialIndex + 1);
        hasRespondedRef.current = false;
        setShowFeedback(false);

        // 30% chance for target, 70% for distractor
        const isTarget = Math.random() < 0.3;
        let selectedStimulus;

        if (isTarget) {
            selectedStimulus = STIMULI[0];
        } else {
            const distractors = STIMULI.slice(1);
            selectedStimulus = distractors[Math.floor(Math.random() * distractors.length)];
        }

        setCurrentStimulus(selectedStimulus);
        stimulusStartTimeRef.current = Date.now();

        // Clear previous timeouts
        clearTimeout(trialTimeoutRef.current);
        clearTimeout(isiTimeoutRef.current);

        // Timeout for the stimulus presentation
        trialTimeoutRef.current = setTimeout(() => {
            // Stimulus disappeared. If no response was given during presentation:
            if (!hasRespondedRef.current) {
                if (selectedStimulus.type === 'target') {
                    // It was a target and they missed it
                    setMisses(prev => prev + 1);
                } else {
                    // It was a distractor and they correctly ignored it
                    setCorrectRejections(prev => prev + 1);
                }
            }

            setCurrentStimulus(null); // Hide stimulus

            // Start Inter-Stimulus Interval (blank screen)
            isiTimeoutRef.current = setTimeout(() => {
                nextTrial(trialIndex + 1);
            }, INTER_STIMULUS_INTERVAL);

        }, STIMULUS_DURATION);
    };

    const endGame = () => {
        setGameState('finished');
        clearTimeout(trialTimeoutRef.current);
        clearTimeout(isiTimeoutRef.current);
        setCurrentStimulus(null);
    };

    const handleResponse = useCallback(() => {
        if (gameState !== 'playing' || !currentStimulus || hasRespondedRef.current) return;

        hasRespondedRef.current = true;
        const rt = Date.now() - stimulusStartTimeRef.current;

        if (currentStimulus.type === 'target') {
            // Hit!
            setHits(prev => prev + 1);
            setReactionTimes(prev => [...prev, rt]);
            showBriefFeedback('bg-green-100');
        } else {
            // False Alarm!
            setFalseAlarms(prev => prev + 1);
            showBriefFeedback('bg-red-100');
        }

        // We do NOT clear the timeout here, we let the STIMULUS_DURATION play out 
        // to maintain a consistent rhythm, which is important for CPT testing.
    }, [gameState, currentStimulus]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleResponse();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(trialTimeoutRef.current);
            clearTimeout(isiTimeoutRef.current);
        };
    }, [handleResponse]);

    const showBriefFeedback = (color) => {
        setFeedbackColor(color);
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 200);
    };

    const avgRT = reactionTimes.length > 0
        ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
        : 0;

    const accuracy = Math.round(((hits + correctRejections) / TOTAL_TRIALS) * 100);

    if (gameState === 'menu') {
        return (
            <Card className="max-w-2xl mx-auto shadow-xl">
                <CardContent className="p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Atenção Seletiva (CPT)</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto">
                        Um teste de baixa estimulação focado em medir sua atenção e controle de impulsos. Ideal para neurodivergentes.
                    </p>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8 text-left border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                            Como jogar:
                        </h3>
                        <ul className="space-y-4 text-gray-600 dark:text-gray-300">
                            <li className="flex items-center">
                                1. Observe a tela atentamente. Formas geométricas aparecerão por um breve momento.
                            </li>
                            <li className="flex items-center font-bold text-blue-600 dark:text-blue-400">
                                2. Pressione a tecla ESPAÇO (ou toque na tela) APENAS quando ver um CÍRCULO AZUL.
                                <div className="w-6 h-6 bg-blue-500 rounded-full ml-4 flex-shrink-0"></div>
                            </li>
                            <li className="flex items-center">
                                3. Ignore todas as outras formas e cores. Não faça nada quando elas aparecerem.
                            </li>
                        </ul>
                    </div>

                    <Button onClick={startGame} size="lg" className="w-full sm:w-auto text-lg px-12 py-6 bg-blue-600 hover:bg-blue-700">
                        Começar Teste
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (gameState === 'playing') {
        return (
            <div
                className={`fixed inset-0 flex items-center justify-center transition-colors duration-200 ${showFeedback ? feedbackColor : 'bg-gray-100 dark:bg-gray-900'}`}
                onClick={handleResponse}
            >
                {/* Progress Bar Mini */}
                <div className="absolute top-4 left-4 right-4 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden opacity-50">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(currentTrial / TOTAL_TRIALS) * 100}%` }}></div>
                </div>

                {/* Informational Text minimal */}
                <div className="absolute top-10 text-gray-400 dark:text-gray-600 text-sm font-medium tracking-wider">
                    TOQUE APENAS NO CÍRCULO AZUL
                </div>

                {/* Stimulus Area */}
                <div className="w-64 h-64 flex items-center justify-center">
                    {currentStimulus && (
                        <div className={`
              ${currentStimulus.shape === 'triangle'
                                ? 'w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-b-[100px]'
                                : `w-32 h-32 ${currentStimulus.color} ${currentStimulus.shape} shadow-xl`}
              ${currentStimulus.shape === 'triangle' ? currentStimulus.color : ''}
            `}></div>
                    )}
                </div>
            </div>
        );
    }

    if (gameState === 'finished') {
        // Preparing the 'showFullReport' structure hook for future monetization
        const showFullReport = true; // In the future, this could be: userState.isPremium

        return (
            <Card className="max-w-3xl mx-auto shadow-xl animate-fade-in">
                <CardContent className="p-8">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trophy className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Treino Concluído!</h2>
                        <p className="text-gray-600 dark:text-gray-400">Aqui está a análise do seu desempenho cognitivo.</p>
                    </div>

                    {/* Basic Free Report */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <div className="bg-green-50 dark:bg-gray-800 p-4 rounded-xl text-center border shadow-sm">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{hits}</div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Acertos (Alvos)</div>
                        </div>
                        <div className="bg-red-50 dark:bg-gray-800 p-4 rounded-xl text-center border shadow-sm">
                            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">{falseAlarms}</div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Erros (Impulsos)</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-xl text-center border shadow-sm">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{avgRT}ms</div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Tempo Médio</div>
                        </div>
                        <div className="bg-purple-50 dark:bg-gray-800 p-4 rounded-xl text-center border shadow-sm">
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{accuracy}%</div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Precisão Global</div>
                        </div>
                    </div>

                    {/* Premium / Detailed Report Section */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 relative overflow-hidden">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                            Relatório Clínico Detalhado
                            {!showFullReport && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full uppercase tracking-wider">Pro</span>}
                        </h3>

                        {showFullReport ? (
                            <div className="space-y-4 text-gray-700 dark:text-gray-300 text-sm">
                                <p><strong>Atenção Sustentada:</strong> {misses === 0 ? 'Excelente. Você não deixou passar nenhum alvo.' : `Foram perdidos ${misses} alvos, o que pode indicar pequenas quedas de vigilância.`}</p>
                                <p><strong>Controle Inibitório:</strong> {falseAlarms === 0 ? 'Excepcional. Você conseguiu frear o impulso perfeitamente perante distratores.' : `Houve ${falseAlarms} reações impulsivas a distratores. Clicar nas formas erradas é um indicador clássico de dificuldade de inibição motora.`}</p>
                                <p><strong>Velocidade de Processamento:</strong> {avgRT < 400 ? 'Muito Rápido.' : avgRT < 600 ? 'Na média.' : 'Abaixo da média, indicando cautela ou lentificação.'}</p>
                                <p className="mt-4 text-xs text-gray-500 italic">* Nota: Este é um teste referencial e não substitui um diagnóstico clínico formal.</p>
                            </div>
                        ) : (
                            <div className="absolute inset-0 backdrop-blur-sm bg-white/50 flex flex-col items-center justify-center p-6 text-center">
                                <AlertCircle className="w-8 h-8 text-yellow-500 mb-2" />
                                <h4 className="font-bold mb-1">Conteúdo Premium</h4>
                                <p className="text-sm text-gray-600 mb-4">Acesse as análises de perfil neurocognitivo detalhadas para entender a fundo seus resultados.</p>
                                <Button>Desbloquear Relatório</Button>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex justify-center gap-4">
                        <Button onClick={startGame} size="lg" className="gap-2">
                            <RefreshCw className="w-5 h-5" />
                            Treinar Novamente
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return null;
}
