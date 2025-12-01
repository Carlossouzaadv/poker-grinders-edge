import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HandHistory, Card as CardType } from '@/types/poker';
import Card from '@/components/poker/Card';

interface HandAnalysisReportProps {
    handHistory: HandHistory | null;
}

const HandAnalysisReport: React.FC<HandAnalysisReportProps> = ({ handHistory }) => {
    const { t } = useTranslation();
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
            preflopSummary: generatePreflopAnalysis(handHistory, hero, t),
            flopSummary: generateStreetAnalysis(handHistory, 'flop', t),
            turnSummary: generateStreetAnalysis(handHistory, 'turn', t),
            riverSummary: generateStreetAnalysis(handHistory, 'river', t),
            finalVerdict: generateVerdict(handHistory, hero, t)
        };
    }, [handHistory, t]);

    if (!handHistory || !analysis) {
        return (
            <div className="bg-[#1a1a1a] rounded-xl p-8 text-center border border-gray-800">
                <p className="text-gray-400 font-open-sans">{t('pages.handAnalyzer.analysis.selectHandPrompt')}</p>
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
                        {t('pages.handAnalyzer.analysis.title')}
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
                        <h3 className="text-white font-bold text-lg">{t('pages.handAnalyzer.analysis.preflop.title')}</h3>
                    </div>

                    <div className="bg-[#121212] rounded-lg p-4 border border-[#333]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="text-gray-300">{t('pages.handAnalyzer.analysis.preflop.yourHand')}</div>
                            <div className="flex gap-2">
                                {analysis.heroHand.map((card, i) => (
                                    <div key={i} className="w-10">
                                        <Card card={card} />
                                    </div>
                                ))}
                            </div>
                            <div className="text-gray-300 ml-4">
                                {t('pages.handAnalyzer.analysis.preflop.position')}: <span className="text-white font-bold">{analysis.hero?.position || t('pages.handAnalyzer.analysis.verdict.unknown')}</span>
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
                            <h3 className="text-white font-bold text-lg">{t('pages.handAnalyzer.analysis.flop.title')}</h3>
                        </div>

                        <div className="bg-[#121212] rounded-lg p-4 border border-[#333]">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-gray-300">{t('pages.handAnalyzer.analysis.flop.board')}</div>
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
                            <h3 className="text-white font-bold text-lg">{t('pages.handAnalyzer.analysis.turn.title')}</h3>
                        </div>

                        <div className="bg-[#121212] rounded-lg p-4 border border-[#333]">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-gray-300">{t('pages.handAnalyzer.analysis.turn.card')}</div>
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
                            <h3 className="text-white font-bold text-lg">{t('pages.handAnalyzer.analysis.river.title')}</h3>
                        </div>

                        <div className="bg-[#121212] rounded-lg p-4 border border-[#333]">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-gray-300">{t('pages.handAnalyzer.analysis.river.card')}</div>
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
                        <h3 className="text-white font-bold text-lg">{t('pages.handAnalyzer.analysis.verdict.title')}</h3>
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

function generatePreflopAnalysis(hand: HandHistory, hero: any, t: any): string {
    if (!hero) return t('pages.handAnalyzer.analysis.preflop.heroNotIdentified');

    const position = hero.position || t('pages.handAnalyzer.analysis.verdict.unknown');
    const action = hand.preflop?.find(a => a.player === hero.name)?.action;
    const heroHandStr = hero.cards.map((c: any) => `${c.rank}${c.suit}`).join('');

    // Simple preflop strength check (can be improved with ranges)
    const equity = calculateEquityVsRandom(heroHandStr, '', 1000)?.heroEquity || 0;

    let analysis = t('pages.handAnalyzer.analysis.verdict.playingPosition', { position, hand: heroHandStr }) + ' ';
    analysis += t('pages.handAnalyzer.analysis.preflop.equityVsRandom', { equity: Math.round(equity) }) + ' ';

    if (action === 'raise') {
        if (equity > 60) analysis += t('pages.handAnalyzer.analysis.preflop.strongRaise') + ' ';
        else analysis += t('pages.handAnalyzer.analysis.preflop.aggressiveRaise') + ' ';
    } else if (action === 'call') {
        analysis += t('pages.handAnalyzer.analysis.preflop.speculativeCall') + ' ';
    } else if (action === 'fold') {
        if (equity > 60) analysis += t('pages.handAnalyzer.analysis.preflop.conservativeFold') + ' ';
        else analysis += t('pages.handAnalyzer.analysis.preflop.correctFold') + ' ';
    }

    return analysis;
}

function generateStreetAnalysis(hand: HandHistory, street: 'flop' | 'turn' | 'river', t: any): string {
    const streetData = hand[street];
    if (!streetData) return "";

    const hero = hand.players.find(p => p.isHero);
    if (!hero) return "";

    const heroHandStr = hero.cards ? hero.cards.map((c: any) => `${c.rank}${c.suit}`).join('') : '';

    if (!heroHandStr) return t('pages.handAnalyzer.analysis.verdict.heroNotIdentifiedOrNoCards');

    // Build board string up to this street
    let boardCards = [...(hand.flop?.cards || [])];
    if ((street === 'turn' || street === 'river') && hand.turn?.card) boardCards.push(hand.turn.card);
    if (street === 'river' && hand.river?.card) boardCards.push(hand.river.card);

    const boardStr = boardCards.map(c => `${c.rank}${c.suit}`).join('');

    // Calculate Hand Strength
    const parsedHand = parseHand(heroHandStr);
    const parsedBoard = parseBoard(boardStr);
    let handRank = t('pages.handAnalyzer.analysis.verdict.unknown');

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

    let text = t('pages.handAnalyzer.analysis.verdict.streetAnalysis', { street, handRank }) + ' ';
    text += t('pages.handAnalyzer.analysis.verdict.equityEstimated', { equity: Math.round(equity) }) + ' ';

    if (lastBet && heroAction?.action === 'call') {
        // Calculate Pot Odds (Simplified)
        const betAmount = lastBet.amount || 0;
        const potBeforeBet = calculatePotSize(hand, street);
        const totalPot = potBeforeBet + betAmount + betAmount; // Pot + Bet + Call
        const potOdds = (betAmount / totalPot) * 100;

        text += t('pages.handAnalyzer.analysis.verdict.facedbBet', { amount: betAmount }) + ' ';
        text += t('pages.handAnalyzer.analysis.verdict.potOdds', { potOdds: Math.round(potOdds) }) + ' ';

        if (equity > potOdds) {
            text += t('pages.handAnalyzer.analysis.verdict.callEVPlus') + ' ';
        } else {
            text += t('pages.handAnalyzer.analysis.verdict.callEVMinus') + ' ';
        }
    } else if (heroAction?.action === 'bet' || heroAction?.action === 'raise') {
        if (equity > 70) text += t('pages.handAnalyzer.analysis.verdict.valueBet') + ' ';
        else if (equity < 40) text += t('pages.handAnalyzer.analysis.verdict.bluff') + ' ';
        else text += t('pages.handAnalyzer.analysis.verdict.protectionBet') + ' ';
    } else if (heroAction?.action === 'check') {
        if (equity > 80) text += t('pages.handAnalyzer.analysis.verdict.slowplay') + ' ';
        else text += t('pages.handAnalyzer.analysis.verdict.checkDefault') + ' ';
    }

    return text;
}

function generateVerdict(hand: HandHistory, hero: any, t: any): string {
    const winner = hand.showdown?.winners[0];
    const isHeroWinner = winner === hero?.name;

    // Check if Hero folded at any point
    if (didHeroFold(hand, 'preflop')) {
        return t('pages.handAnalyzer.analysis.verdict.disciplinedFold');
    }
    if (didHeroFold(hand, 'flop') || didHeroFold(hand, 'turn') || didHeroFold(hand, 'river')) {
        return t('pages.handAnalyzer.analysis.verdict.goodRead');
    }

    if (isHeroWinner) {
        return t('pages.handAnalyzer.analysis.verdict.solidVictory');
    } else if (winner) {
        return t('pages.handAnalyzer.analysis.verdict.learning');
    } else {
        return t('pages.handAnalyzer.analysis.verdict.splitPot');
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
