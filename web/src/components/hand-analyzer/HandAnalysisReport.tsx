import React, { useMemo } from 'react';
import { HandHistory, Card as CardType } from '@/types/poker';
import Card from '@/components/poker/Card';

interface HandAnalysisReportProps {
    handHistory: HandHistory | null;
}

const HandAnalysisReport: React.FC<HandAnalysisReportProps> = ({ handHistory }) => {
    const analysis = useMemo(() => {
        if (!handHistory) return null;

        const hero = handHistory.players.find(p => p.isHero);
        const heroHand = hero?.cards || [];
        const board = [
            ...(handHistory.flop?.cards || []),
            handHistory.turn?.card,
            handHistory.river?.card
        ].filter((c): c is CardType => !!c);

        // Helper to format cards for text
        const formatCards = (cards: CardType[]) => {
            return cards.map(c => `${c.rank}${c.suit}`).join('');
        };

        return {
            hero,
            heroHand,
            board,
            preflopSummary: generatePreflopAnalysis(handHistory, hero),
            flopSummary: generateStreetAnalysis(handHistory, 'flop'),
            turnSummary: generateStreetAnalysis(handHistory, 'turn'),
            riverSummary: generateStreetAnalysis(handHistory, 'river'),
            finalVerdict: generateVerdict(handHistory, hero)
        };
    }, [handHistory]);

    if (!handHistory || !analysis) {
        return (
            <div className="bg-[#1a1a1a] rounded-xl p-8 text-center border border-gray-800">
                <p className="text-gray-400 font-open-sans">Selecione uma mão para ver a análise detalhada.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#1E1E1E] rounded-xl border border-[#333] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-[#252525] px-6 py-4 border-b border-[#333] flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🤖</span>
                    <h2 className="text-white font-montserrat font-bold text-lg">
                        Análise Estratégica da Mão
                    </h2>
                </div>
                <div className="text-xs text-gray-400 font-mono">
                    #{handHistory.handId}
                </div>
            </div>

            <div className="p-6 space-y-8 font-open-sans">
                {/* Preflop Section */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[#00FF8C] text-xl">📌</span>
                        <h3 className="text-white font-bold text-lg">1. Análise Preflop</h3>
                    </div>

                    <div className="bg-[#121212] rounded-lg p-4 border border-[#333]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="text-gray-300">Sua Mão:</div>
                            <div className="flex gap-2">
                                {analysis.heroHand.map((card, i) => (
                                    <div key={i} className="w-10">
                                        <Card card={card} />
                                    </div>
                                ))}
                            </div>
                            <div className="text-gray-300 ml-4">
                                Posição: <span className="text-white font-bold">{analysis.hero?.position || 'Unknown'}</span>
                            </div>
                        </div>

                        <p className="text-gray-300 leading-relaxed">
                            {analysis.preflopSummary}
                        </p>
                    </div>
                </section>

                {/* Flop Section - Only if Hero didn't fold preflop AND flop exists */}
                {handHistory.flop && !didHeroFold(handHistory, 'preflop') && (
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[#00FF8C] text-xl">📌</span>
                            <h3 className="text-white font-bold text-lg">2. Análise do Flop</h3>
                        </div>

                        <div className="bg-[#121212] rounded-lg p-4 border border-[#333]">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-gray-300">Board:</div>
                                <div className="flex gap-2">
                                    {handHistory.flop.cards.map((card, i) => (
                                        <div key={i} className="w-10">
                                            <Card card={card} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p className="text-gray-300 leading-relaxed">
                                {analysis.flopSummary}
                            </p>
                        </div>
                    </section>
                )}

                {/* Turn Section - Only if Hero didn't fold previously AND turn exists */}
                {handHistory.turn && !didHeroFold(handHistory, 'flop') && !didHeroFold(handHistory, 'preflop') && (
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[#00FF8C] text-xl">📌</span>
                            <h3 className="text-white font-bold text-lg">3. Análise do Turn</h3>
                        </div>

                        <div className="bg-[#121212] rounded-lg p-4 border border-[#333]">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-gray-300">Turn Card:</div>
                                <div className="w-10">
                                    {handHistory.turn.card && <Card card={handHistory.turn.card} />}
                                </div>
                            </div>

                            <p className="text-gray-300 leading-relaxed">
                                {analysis.turnSummary}
                            </p>
                        </div>
                    </section>
                )}

                {/* River Section - Only if Hero didn't fold previously AND river exists */}
                {handHistory.river && !didHeroFold(handHistory, 'turn') && !didHeroFold(handHistory, 'flop') && !didHeroFold(handHistory, 'preflop') && (
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[#00FF8C] text-xl">📌</span>
                            <h3 className="text-white font-bold text-lg">4. Análise do River</h3>
                        </div>

                        <div className="bg-[#121212] rounded-lg p-4 border border-[#333]">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-gray-300">River Card:</div>
                                <div className="w-10">
                                    {handHistory.river.card && <Card card={handHistory.river.card} />}
                                </div>
                            </div>

                            <p className="text-gray-300 leading-relaxed">
                                {analysis.riverSummary}
                            </p>
                        </div>
                    </section>
                )}

                {/* Verdict Section */}
                <section className="mt-8 pt-6 border-t border-[#333]">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">🧠</span>
                        <h3 className="text-white font-bold text-lg">Veredito Final</h3>
                    </div>

                    <div className="bg-gradient-to-r from-[#1a1a1a] to-[#252525] rounded-lg p-6 border-l-4 border-[#00FF8C]">
                        <p className="text-white font-medium text-lg leading-relaxed">
                            {analysis.finalVerdict}
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

import { calculateEquityVsRandom, getHandRankDescription, parseHand, parseBoard } from '@/lib/poker/equity-calculator';

// ... (keep existing imports and component structure until helper functions)

// --- Helper Functions for Real Analysis Generation ---

function didHeroFold(hand: HandHistory, street: 'preflop' | 'flop' | 'turn' | 'river'): boolean {
    const heroName = hand.players.find(p => p.isHero)?.name;
    if (!heroName) return false;

    const actions = street === 'preflop' ? hand.preflop : hand[street]?.actions;
    return actions?.some(a => a.player === heroName && a.action === 'fold') || false;
}

function generatePreflopAnalysis(hand: HandHistory, hero: any): string {
    if (!hero) return "Hero não identificado nesta mão.";

    const position = hero.position || "Unknown";
    const action = hand.preflop?.find(a => a.player === hero.name)?.action;
    const heroHandStr = hero.cards.map((c: any) => `${c.rank}${c.suit}`).join('');

    // Simple preflop strength check (can be improved with ranges)
    const equity = calculateEquityVsRandom(heroHandStr, '', 1000)?.heroEquity || 0;

    let analysis = `Você está jogando da posição **${position}** com **${heroHandStr}**. `;
    analysis += `Sua equidade contra uma mão aleatória é de **${equity}%**. `;

    if (action === 'raise') {
        if (equity > 60) analysis += "Com essa força de mão, o raise é obrigatório para extrair valor. ";
        else analysis += "Raise agressivo, tentando roubar os blinds ou isolar. ";
    } else if (action === 'call') {
        analysis += "Call especulativo. Cuidado para não ser dominado. ";
    } else if (action === 'fold') {
        if (equity > 60) analysis += "Fold conservador. Essa mão geralmente tem valor para jogar. ";
        else analysis += "Fold correto. Mão marginal fora de posição. ";
    }

    return analysis;
}

function generateStreetAnalysis(hand: HandHistory, street: 'flop' | 'turn' | 'river'): string {
    const streetData = hand[street];
    if (!streetData) return "";

    const hero = hand.players.find(p => p.isHero);
    if (!hero) return "";

    const heroHandStr = hero.cards ? hero.cards.map((c: any) => `${c.rank}${c.suit}`).join('') : '';

    if (!heroHandStr) return "Hero não identificado ou sem cartas.";

    // Build board string up to this street
    let boardCards = [...(hand.flop?.cards || [])];
    if ((street === 'turn' || street === 'river') && hand.turn?.card) boardCards.push(hand.turn.card);
    if (street === 'river' && hand.river?.card) boardCards.push(hand.river.card);

    const boardStr = boardCards.map(c => `${c.rank}${c.suit}`).join('');

    // Calculate Hand Strength
    const parsedHand = parseHand(heroHandStr);
    const parsedBoard = parseBoard(boardStr);
    let handRank = "Desconhecido";

    if (parsedHand && parsedBoard) {
        handRank = getHandRankDescription([...parsedHand, ...parsedBoard]);
    }

    // Calculate Equity vs Random (as a baseline proxy for strength)
    const equityResult = calculateEquityVsRandom(heroHandStr, boardStr, 1000);
    const equity = equityResult?.heroEquity || 0;

    // Analyze Action & Pot Odds
    const actions = streetData.actions || [];
    const heroAction = actions.find(a => a.player === hero.name);
    const lastBet = actions.slice().reverse().find(a => a.action === 'bet' || a.action === 'raise' && a.player !== hero.name);

    let text = `No ${street}, você tem **${handRank}**. `;
    text += `Sua equidade estimada (vs range aleatório) é de **${equity}%**. `;

    if (lastBet && heroAction?.action === 'call') {
        // Calculate Pot Odds (Simplified)
        const betAmount = lastBet.amount || 0;
        const potBeforeBet = calculatePotSize(hand, street);
        const totalPot = potBeforeBet + betAmount + betAmount; // Pot + Bet + Call
        const potOdds = (betAmount / totalPot) * 100;

        text += `Você enfrentou uma aposta de ${betAmount}. `;
        text += `Pot Odds: **${Math.round(potOdds)}%**. `;

        if (equity > potOdds) {
            text += "✅ **Call EV+**. Sua equidade é maior que as pot odds, justificando o call matemático. ";
        } else {
            text += "⚠️ **Call EV-**. Matematicamente, você não tem equidade suficiente para pagar, a menos que espere extrair muito valor futuro (Implied Odds). ";
        }
    } else if (heroAction?.action === 'bet' || heroAction?.action === 'raise') {
        if (equity > 70) text += "Aposta por **Valor**. Você tem uma mão muito forte e está extraindo fichas. ";
        else if (equity < 40) text += "Aposta por **Blefe**. Você está tentando fazer mãos melhores foldarem. ";
        else text += "Aposta por **Proteção/Valor Fino**. ";
    } else if (heroAction?.action === 'check') {
        if (equity > 80) text += "Slowplay? Com essa força, considerar apostar pode ser melhor. ";
        else text += "Check padrão para controle de pote. ";
    }

    return text;
}

function generateVerdict(hand: HandHistory, hero: any): string {
    const winner = hand.showdown?.winners[0];
    const isHeroWinner = winner === hero?.name;

    // Check if Hero folded at any point
    if (didHeroFold(hand, 'preflop')) {
        return "🛡️ **Fold Disciplinado.** Você evitou se envolver em uma situação marginal fora de posição. A preservação de fichas é tão importante quanto ganhá-las.";
    }
    if (didHeroFold(hand, 'flop') || didHeroFold(hand, 'turn') || didHeroFold(hand, 'river')) {
        return "🛑 **Boa Leitura.** Saber a hora de parar é uma habilidade essencial. Você identificou o perigo e economizou fichas importantes para spots melhores.";
    }

    if (isHeroWinner) {
        return "🏆 **Vitória Sólida.** Você jogou sua mão de forma a maximizar o valor. Revise se houve alguma street onde poderia ter extraído ainda mais.";
    } else if (winner) {
        return "📉 **Aprendizado.** O resultado não foi favorável. Verifique a análise street-by-street acima para ver se houve algum call EV- ou oportunidade de fold que passou despercebida.";
    } else {
        return "😐 **Pote Dividido/Sem Showdown.** Mão disputada. O importante é que a linha de raciocínio tenha sido matematicamente correta.";
    }
}

function calculatePotSize(hand: HandHistory, currentStreet: 'flop' | 'turn' | 'river'): number {
    let pot = (hand.smallBlind || 0) + (hand.bigBlind || 0) + (hand.ante || 0) * hand.maxPlayers;

    // Add preflop action
    hand.preflop?.forEach(a => pot += a.amount || 0);

    if (currentStreet === 'flop') return pot;

    // Add flop action
    hand.flop?.actions?.forEach(a => pot += a.amount || 0);

    if (currentStreet === 'turn') return pot;

    // Add turn action
    hand.turn?.actions?.forEach(a => pot += a.amount || 0);

    return pot;
}

export default HandAnalysisReport;
