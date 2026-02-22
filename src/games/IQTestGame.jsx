import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Brain, Trophy, AlertCircle, RefreshCw } from 'lucide-react';

/* 
 * Basic Logical/Pattern IQ Test
 * Uses CSS shapes and simple patterns.
 */

const IQ_QUESTIONS = [
    {
        id: 1,
        type: 'sequence',
        question: 'Qual o próximo número da sequência: 2, 4, 8, 16, ...?',
        options: ['24', '32', '64', '20'],
        correct: 1, // index of '32'
    },
    {
        id: 2,
        type: 'pattern',
        question: 'Se A = 1, B = 2, C = 3. Qual o valor de F?',
        options: ['4', '5', '6', '7'],
        correct: 2,
    },
    {
        id: 3,
        type: 'logic',
        question: 'Todos os cães latem. Rex não late. Logo:',
        options: [
            'Rex é um gato',
            'Rex é um cão silencioso',
            'Rex não é um cão',
            'Cães não latem'
        ],
        correct: 2,
    },
    {
        id: 4,
        type: 'sequence',
        question: 'Complete a sequência lógica: 1, 1, 2, 3, 5, 8, ...',
        options: ['11', '12', '13', '15'],
        correct: 2,
    },
    {
        id: 5,
        type: 'visual-pattern',
        question: 'Qual a próxima forma lógica?',
        visualSequence: ['●', '●●', '●●●', '?'],
        options: ['●●', '●●●●', '●●●', '●'],
        correct: 1,
    }
];

export default function IQTestGame() {
    const [gameState, setGameState] = useState('menu'); // menu, playing, feedback, finished
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState([]);

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setCurrentQuestionIdx(0);
        setAnswers([]);
    };

    const handleAnswer = (optionIdx) => {
        const isCorrect = optionIdx === IQ_QUESTIONS[currentQuestionIdx].correct;

        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        setAnswers(prev => [...prev, { qId: IQ_QUESTIONS[currentQuestionIdx].id, isCorrect }]);

        if (currentQuestionIdx + 1 < IQ_QUESTIONS.length) {
            setCurrentQuestionIdx(prev => prev + 1);
        } else {
            setGameState('finished');
        }
    };

    if (gameState === 'menu') {
        return (
            <Card className="max-w-2xl mx-auto shadow-xl">
                <CardContent className="p-8 text-center">
                    <Brain className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Teste de Raciocínio Lógico (QI)</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto">
                        Avalie suas habilidades de reconhecimento de padrões, lógica e raciocínio sequencial com este teste padronizado.
                    </p>

                    <Button onClick={startGame} size="lg" className="w-full sm:w-auto text-lg px-12 py-6 bg-purple-600 hover:bg-purple-700">
                        Começar Avaliação
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (gameState === 'playing') {
        const currentQ = IQ_QUESTIONS[currentQuestionIdx];

        return (
            <Card className="max-w-3xl mx-auto shadow-xl">
                <CardContent className="p-8">
                    <div className="mb-8">
                        <div className="flex justify-between text-sm text-gray-500 font-medium tracking-wider uppercase mb-2">
                            <span>Questão {currentQuestionIdx + 1} de {IQ_QUESTIONS.length}</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-600 transition-all duration-300"
                                style={{ width: `${((currentQuestionIdx) / IQ_QUESTIONS.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 mb-8 text-center min-h-[160px] flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                            {currentQ.question}
                        </h3>

                        {currentQ.type === 'visual-pattern' && (
                            <div className="flex items-center justify-center gap-4 text-3xl text-purple-600 dark:text-purple-400 font-bold mb-4">
                                {currentQ.visualSequence.map((item, i) => (
                                    <span key={i} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">{item}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQ.options.map((option, idx) => (
                            <Button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                variant="outline"
                                className="h-auto py-6 text-lg border-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 whitespace-normal text-center"
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (gameState === 'finished') {
        // Preparing the 'showFullReport' structure hook for future monetization
        const showFullReport = true; // In the future, this could be: userState.isPremium

        // Calculate a pseudo IQ score (baseline 100 + score scaled)
        const baseIQ = 90;
        const maxScoreAdd = 45; // Max IQ 135
        const iqScore = baseIQ + Math.round((score / IQ_QUESTIONS.length) * maxScoreAdd);
        const percentile = Math.round((score / IQ_QUESTIONS.length) * 99);

        return (
            <Card className="max-w-3xl mx-auto shadow-xl animate-fade-in">
                <CardContent className="p-8">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trophy className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Avaliação Concluída!</h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 mb-8 justify-center">
                        <div className="bg-purple-50 dark:bg-gray-800 p-6 rounded-xl text-center border shadow-sm flex-1">
                            <div className="text-4xl font-black text-purple-600 dark:text-purple-400 mb-2">{iqScore}</div>
                            <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Desempenho Cognitivo (QI)</div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl text-center border shadow-sm flex-1">
                            <div className="text-4xl font-black text-gray-700 dark:text-gray-300 mb-2">{score}/{IQ_QUESTIONS.length}</div>
                            <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Questões Corretas</div>
                        </div>
                    </div>

                    {/* Premium / Detailed Report Section */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 relative overflow-hidden">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                            Relatório Analítico
                            {!showFullReport && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full uppercase tracking-wider">Pro</span>}
                        </h3>

                        {showFullReport ? (
                            <div className="space-y-4 text-gray-700 dark:text-gray-300 text-sm">
                                <p><strong>Lógica Sequencial:</strong> Desempenho alto em identificação intuitiva de progressões numéricas.</p>
                                <p><strong>Raciocínio Dedutivo:</strong> Habilidade para extrair premissas verdadeiras a partir de afirmações factuais.</p>
                                <p><strong>Percentil Estimado:</strong> Seu desempenho foi melhor ou igual a {percentile}% da amostra padrão.</p>
                                <p className="mt-4 text-xs text-gray-500 italic">* Nota: Este é um teste breve e tem fins de treinamento, não tendo validade como avaliação neuropsicológica clínica certificada.</p>
                            </div>
                        ) : (
                            <div className="absolute inset-0 backdrop-blur-sm bg-white/50 flex flex-col items-center justify-center p-6 text-center">
                                <AlertCircle className="w-8 h-8 text-yellow-500 mb-2" />
                                <h4 className="font-bold mb-1">Análise de Sub-Dimensões Premium</h4>
                                <p className="text-sm text-gray-600 mb-4">Acesse os fatores fluidos e cristalizados e compare percentis populacionais.</p>
                                <Button>Desbloquear Relatório Completo</Button>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex justify-center gap-4">
                        <Button onClick={startGame} size="lg" className="gap-2 bg-purple-600 hover:bg-purple-700">
                            <RefreshCw className="w-5 h-5" />
                            Tentar Novamente
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return null;
}
