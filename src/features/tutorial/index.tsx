"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDeckStore } from '@/stores/useDeckStore';
import { useAchievementsStore } from '@/stores/useAchievementsStore';
import { useWalletStore } from '@/stores/useWalletStore';
import { Card2D } from '@/features/game/components/Card2D';
import { TheRitualModal } from '@/components/shared/TheRitualModal';
import { Swords, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function TutorialFeature() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showRitualModal, setShowRitualModal] = useState(false);
  const { getAvailableCards } = useDeckStore();
  const { incrementProgress, initialize } = useAchievementsStore();
  const { walletAddress } = useWalletStore();

  const totalSteps = 12;

  const [ritualCompleted, setRitualCompleted] = useState(false);
  const [tutorialStarted, setTutorialStarted] = useState(false);

  useEffect(() => {
    initialize();
    incrementProgress('tutorial_start');

    if (walletAddress) {
      setCurrentStep(1);
      setCompletedSteps(new Set());
      setRitualCompleted(false);

      Promise.all([
        fetch(`/api/player/ritual-status/${walletAddress}`, { credentials: 'include' }).then(r => r.ok ? r.json() : null),
        fetch(`/api/player/tutorial-status/${walletAddress}`, { credentials: 'include' }).then(r => r.ok ? r.json() : null)
      ]).then(([ritualData, tutorialData]) => {
        if (ritualData) {
          setRitualCompleted(ritualData.hasCompletedRitual === true);
          if (!ritualData.hasCompletedRitual) localStorage.removeItem('ritual_completed');
        }
        if (tutorialData) {
          if (!tutorialData.hasCompletedTutorial) {
            localStorage.removeItem('tutorial_completed');
            localStorage.removeItem('tutorial_progress');
          }
          setCurrentStep(tutorialData.currentStep || 1);
          setCompletedSteps(new Set(tutorialData.completedSteps || []));
        }
      }).catch(() => {});
    } else {
      const savedProgress = localStorage.getItem('tutorial_progress');
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setCurrentStep(progress.currentStep || 1);
        setCompletedSteps(new Set(progress.completedSteps || []));
      }
    }
  }, [initialize, incrementProgress, walletAddress]);

  const saveProgress = (step: number, completed: Set<number>) => {
    localStorage.setItem('tutorial_progress', JSON.stringify({
      currentStep: step,
      completedSteps: Array.from(completed)
    }));
    if (walletAddress) {
      fetch('/api/player/tutorial-progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ walletAddress, currentStep: step, completedSteps: Array.from(completed) })
      }).catch(() => {});
    }
  };

  const allCards = getAvailableCards();
  const exampleAvatar = allCards.find(c => c.type === 'avatar');
  const exampleLevel1Avatar = allCards.find(c => c.type === 'avatar' && 'level' in c && (c as any).level === 1) || exampleAvatar;
  const exampleLevel2Avatar = allCards.find(c => c.type === 'avatar' && 'level' in c && (c as any).level === 2);
  const exampleSpell = allCards.find(c => c.type === 'spell');
  const exampleQuickSpell = allCards.find(c => c.type === 'quickSpell');
  const exampleEquipment = allCards.find(c => c.type === 'equipment' || c.type === 'ritualArmor');
  const exampleField = allCards.find(c => c.type === 'field');
  const exampleItem = allCards.find(c => c.type === 'item');
  const examplePassiveCard = allCards.find(c => c.type === 'avatar' && 'passiveSkill' in c && (c as any).passiveSkill) || exampleAvatar;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      const newCompleted = new Set(completedSteps).add(currentStep);
      setCompletedSteps(newCompleted);
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveProgress(nextStep, newCompleted);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      saveProgress(prevStep, completedSteps);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const markTutorialCompleted = () => {
    localStorage.setItem('tutorial_completed', 'true');
    if (walletAddress) {
      fetch('/api/player/tutorial-progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ walletAddress, completed: true })
      }).catch(() => {});
    }
  };

  const handleSkip = () => {
    markTutorialCompleted();
    if (!ritualCompleted) { setShowRitualModal(true); return; }
    router.push('/cards');
  };

  const handleComplete = () => {
    markTutorialCompleted();
    const allCompleted = new Set(Array.from({ length: totalSteps }, (_, i) => i + 1));
    saveProgress(totalSteps, allCompleted);
    incrementProgress('tutorial_complete');
    router.push('/tutorial/interactive');
  };

  const handleRitualComplete = async (faction: string, element: string, deckId: string) => {
    if (walletAddress) {
      try {
        await fetch('/api/player/complete-ritual', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ walletAddress, faction, element, starterDeckId: deckId })
        });
      } catch { /* silently fail */ }
    }
    setRitualCompleted(true);
    setShowRitualModal(false);
    toast.success('Welcome to Spektrum! Your starter deck is ready.');
    router.push('/cards');
  };

  const tutorialSteps = [
    {
      title: '',
      content: (
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
            <h3 className="font-bold text-orange-400 mb-2">Your Goal</h3>
            <p className="text-sm text-gray-200">
              Reduce your opponent's Active Avatar to 0 HP while protecting your own. Strategize with spektra, skills, and timing to claim victory!
            </p>
          </div>
          <p className="text-sm text-gray-400">This tutorial will teach you everything you need to start playing. Take your time!</p>
        </div>
      )
    },
    {
      title: 'Card Types: Avatars',
      content: (
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
            <h3 className="font-bold text-orange-400 mb-2">Avatar Cards</h3>
            <p className="text-sm text-gray-200 mb-3">Your fighters on the battlefield. Each avatar has Health, Attack, Skills, and can have Passive abilities.</p>
          </div>
          <div className="flex justify-center">
            {exampleAvatar && <div className="w-56"><Card2D card={exampleAvatar} /></div>}
          </div>
        </div>
      )
    },
    {
      title: 'Level 1 vs Level 2 Avatars',
      content: (
        <div className="space-y-4">
          <p className="text-orange-400 mb-4">Avatars come in two levels, each with different strategic purposes.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
              <h3 className="font-bold text-orange-400 mb-3">Level 1 Avatars</h3>
              <ul className="space-y-2 text-sm text-gray-200 mb-3">
                <li>• <strong>Lower Stats:</strong> 4-8 HP, deal 2-4 damage</li>
                <li>• <strong>Spektra Generation:</strong> Perfect for early game</li>
                <li>• <strong>Consistent:</strong> Easy to play multiple copies</li>
              </ul>
              {exampleLevel1Avatar && <div className="flex justify-center mt-3"><div className="w-48"><Card2D card={exampleLevel1Avatar} /></div></div>}
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
              <h3 className="font-bold text-orange-400 mb-3">Level 2 Avatars</h3>
              <ul className="space-y-2 text-sm text-gray-200 mb-3">
                <li>• <strong>Higher Stats:</strong> 8-12 HP, deal 4-8 damage</li>
                <li>• <strong>Powerful Effects:</strong> Often have passive skills</li>
                <li>• <strong>Game Changers:</strong> Turn the tide of battle</li>
              </ul>
              {exampleLevel2Avatar && <div className="flex justify-center mt-3"><div className="w-48"><Card2D card={exampleLevel2Avatar} /></div></div>}
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-yellow-600">
            <h3 className="font-bold text-orange-400 mb-2">Strategic Tips</h3>
            <ul className="space-y-1 text-sm text-gray-200">
              <li>• Use Level 1 avatars for early spektra generation</li>
              <li>• Save Level 2 avatars for mid-to-late game</li>
              <li>• Balance both levels: typically 8-12 Level 1s and 2-4 Level 2s</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: 'Action Cards: Part 1',
      content: (
        <div className="space-y-4">
          <p className="text-orange-400 mb-4">Action cards provide powerful effects to support your strategy.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
              <h4 className="font-semibold text-orange-400 mb-2">Spell Cards</h4>
              <p className="text-sm text-gray-200 mb-3">Played during your Main Phase, go to the graveyard after use.</p>
              {exampleSpell && <div className="flex justify-center"><div className="w-44"><Card2D card={exampleSpell} /></div></div>}
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
              <h4 className="font-semibold text-orange-400 mb-2">Quick Spell Cards</h4>
              <p className="text-sm text-gray-200 mb-3">Can be played instantly, even during your opponent's turn!</p>
              {exampleQuickSpell && <div className="flex justify-center"><div className="w-44"><Card2D card={exampleQuickSpell} /></div></div>}
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
            <h4 className="font-semibold text-orange-400 mb-2">Equipment Cards (Ritual Armor)</h4>
            <p className="text-sm text-gray-200 mb-3">Attach to avatars to enhance their abilities or provide protection.</p>
            {exampleEquipment && <div className="flex justify-center"><div className="w-44"><Card2D card={exampleEquipment} /></div></div>}
          </div>
        </div>
      )
    },
    {
      title: 'Action Cards: Part 2',
      content: (
        <div className="space-y-4">
          <p className="text-orange-400 mb-4">Utility and battlefield-altering action cards.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
              <h4 className="font-semibold text-orange-400 mb-2">Field Cards</h4>
              <p className="text-sm text-gray-200 mb-3">Change the battlefield itself, affecting all avatars for a limited duration.</p>
              {exampleField && <div className="flex justify-center"><div className="w-44"><Card2D card={exampleField} /></div></div>}
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
              <h4 className="font-semibold text-orange-400 mb-2">Item Cards</h4>
              <p className="text-sm text-gray-200 mb-3">Utility cards for drawing cards, healing, or searching your deck.</p>
              {exampleItem && <div className="flex justify-center"><div className="w-44"><Card2D card={exampleItem} /></div></div>}
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
            <h3 className="font-bold text-orange-400 mb-2">Building Your Action Card Mix</h3>
            <ul className="space-y-1 text-sm text-gray-200">
              <li>• Include 3-5 damage spells for offense</li>
              <li>• Add 2-3 Quick Spells for defense and surprise plays</li>
              <li>• Consider 1-2 Equipment cards to boost key avatars</li>
              <li>• Add utility Items for card draw and deck searching</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: 'The Spektra System',
      content: (
        <div className="space-y-4">
          <p className="text-orange-400">Spektra is the fuel for playing cards.</p>
          <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
            <h3 className="font-bold text-orange-400 mb-3">Spektra Types</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2"><span className="w-3 h-3 bg-red-500 rounded-full"></span><span>Fire</span></div>
              <div className="flex items-center space-x-2"><span className="w-3 h-3 bg-blue-500 rounded-full"></span><span>Water</span></div>
              <div className="flex items-center space-x-2"><span className="w-3 h-3 bg-yellow-500 rounded-full"></span><span>Ground</span></div>
              <div className="flex items-center space-x-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span><span>Air</span></div>
              <div className="flex items-center space-x-2 col-span-2"><span className="w-3 h-3 bg-gray-500 rounded-full"></span><span>Neutral (Can be used as any type)</span></div>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
            <h3 className="font-bold text-orange-400 mb-2">How to Generate Spektra</h3>
            <ol className="text-sm text-gray-200 space-y-2 list-decimal list-inside">
              <li>During your Main Phase, drag an <strong>Avatar card</strong> from your hand to the Spektra Zone</li>
              <li>The avatar becomes spektra of its element type</li>
              <li>You can only add <strong>1 card per turn</strong> to your spektra zone</li>
              <li>Use accumulated spektra to play more powerful cards</li>
            </ol>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg border border-orange-500 text-orange-100">
            <p className="text-xs text-gray-200"><strong>Important:</strong> Only Avatar cards can be used for spektra generation.</p>
          </div>
        </div>
      )
    },
    {
      title: 'Building Your Deck',
      content: (
        <div className="space-y-4">
          <p className="text-orange-400">A well-constructed deck is key to victory.</p>
          <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
            <h3 className="font-bold text-orange-400 mb-3">Deck Requirements</h3>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>• <strong>Deck Size:</strong> 40-60 cards (minimum 40, maximum 60)</li>
              <li>• <strong>Maximum 4 copies</strong> of the same card by base name</li>
              <li>• <strong>Mix card types</strong> - Balance Avatars and Action cards</li>
            </ul>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-yellow-600">
            <h3 className="font-bold text-orange-400 mb-2">Deck Building Tips</h3>
            <ul className="space-y-1 text-sm text-gray-200">
              <li>• Include 12-15 Avatar cards for consistent board presence</li>
              <li>• Add support spells to boost avatars or weaken opponents</li>
              <li>• Consider element synergies (Fire, Water, Ground, Air, Neutral)</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: 'The 7 Battle Phases',
      content: (
        <div className="space-y-4">
          <p className="text-orange-400 mb-4">Each turn follows a structured 7-phase system.</p>
          <div className="space-y-3">
            {[
              { num: '1', name: 'Setup Phase', desc: 'Place your initial avatar on the battlefield', highlight: false },
              { num: '2', name: 'Refresh Phase', desc: 'Reset your spektra and prepare for the turn', highlight: false },
              { num: '3', name: 'Draw Phase', desc: 'Draw one card from your deck', highlight: false },
              { num: '4', name: 'Main Phase', desc: 'Play cards, generate spektra, or activate abilities', highlight: true },
              { num: '5', name: 'Battle Phase', desc: 'Declare attacks with your active avatar', highlight: true },
              { num: '6', name: 'Damage Phase', desc: 'Resolve combat damage and effects', highlight: true },
              { num: '7', name: 'End Phase', desc: 'Discard down to hand limit and end your turn', highlight: false },
            ].map(phase => (
              <div key={phase.num} className={`bg-gray-800 p-3 rounded-lg border ${phase.highlight ? 'border-orange-500' : 'border-gray-600'}`}>
                <h4 className="font-bold text-sm text-orange-400">{phase.num}. {phase.name}</h4>
                <p className="text-xs text-gray-300">{phase.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-400 italic mt-4">Most of your strategy happens during the Main and Battle phases!</p>
        </div>
      )
    },
    {
      title: 'Understanding Passive Skills',
      content: (
        <div className="space-y-4">
          <p className="text-orange-400">Some Avatar cards have Passive Skills that provide continuous benefits.</p>
          <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
            <h3 className="font-bold text-orange-400 mb-3">Passive Skill Scopes</h3>
            <div className="space-y-3">
              <div className="bg-gray-700 p-3 rounded border border-purple-500">
                <h4 className="font-semibold text-sm text-orange-400 mb-1">Active Scope</h4>
                <p className="text-xs text-gray-300">Only works when this avatar is in the <strong>Active position</strong>.</p>
              </div>
              <div className="bg-gray-700 p-3 rounded border border-purple-500">
                <h4 className="font-semibold text-sm text-orange-400 mb-1">Active or Reserve Scope</h4>
                <p className="text-xs text-gray-300">Works whether the avatar is <strong>Active OR in Reserve</strong>.</p>
              </div>
            </div>
          </div>
          {examplePassiveCard && 'passiveSkill' in examplePassiveCard && (examplePassiveCard as any).passiveSkill && (
            <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
              <h3 className="font-bold text-orange-400 mb-3">Example:</h3>
              <div className="flex justify-center"><div className="w-56"><Card2D card={examplePassiveCard} /></div></div>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Shop Navigation Guide',
      content: (
        <div className="space-y-4">
          <p className="text-orange-400 mb-4">The Shop is where you can purchase cards and build your collection.</p>
          <div className="space-y-3">
            <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
              <h3 className="font-bold text-orange-400 mb-3">Booster Packs</h3>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• <strong>Beginner Pack:</strong> 5 cards with common/uncommon focus</li>
                <li>• <strong>Advanced Pack:</strong> 5 cards with higher rare chance</li>
                <li>• <strong>Expert Pack:</strong> 5 cards with guaranteed rare or better</li>
              </ul>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
              <h3 className="font-bold text-orange-400 mb-3">Premade Decks</h3>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• <strong>Fire - Kobar &amp; Borah:</strong> Aggressive fire-based deck</li>
                <li>• <strong>Water - Kujana &amp; Kuhaka:</strong> Control water-based deck</li>
                <li>• Perfect for beginners or testing new strategies</li>
              </ul>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
              <h3 className="font-bold text-orange-400 mb-3">Payment &amp; Wallet</h3>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• Connect your Solana wallet (Phantom, Solflare, etc.) to make purchases</li>
                <li>• Purchased packs appear in your Inventory</li>
                <li>• Cards are minted as cNFTs when you open packs</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Deck Builder Walkthrough',
      content: (
        <div className="space-y-4">
          <p className="text-orange-400 mb-4">The Deck Builder is your workshop for creating and managing your decks.</p>
          <div className="space-y-3">
            <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
              <h3 className="font-bold text-orange-400 mb-3">Creating a New Deck</h3>
              <ol className="space-y-2 text-sm text-gray-200 list-decimal list-inside">
                <li>Click <strong>"New Deck"</strong> to start building</li>
                <li>Give your deck a name</li>
                <li>Browse your card collection on the left side</li>
                <li>Click cards to add them to your deck on the right</li>
                <li>Deck must have <strong>40-60 cards</strong> to save</li>
              </ol>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-yellow-600">
              <h3 className="font-bold text-orange-400 mb-2">Important Deck Rules</h3>
              <ul className="space-y-1 text-sm text-gray-200">
                <li>• Decks must have <strong>40-60 cards</strong></li>
                <li>• You can have up to <strong>5 saved decks</strong></li>
                <li>• Changes aren't saved until you click "Save Deck"</li>
                <li>• Your active deck is used when you start a battle</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Ready to Play!',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-spektrum-orange to-orange-500 text-white p-6 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-2">Tutorial Complete!</h3>
            <p className="text-sm opacity-90">You've learned the fundamentals of Spektrum Trading Card Game</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
            <h3 className="font-bold text-orange-400 mb-3">What You've Learned</h3>
            <ul className="space-y-1 text-sm text-gray-200">
              <li>Avatar and Action card types</li>
              <li>All 5 action card types (Spell, Quick Spell, Equipment, Field, Item)</li>
              <li>The Spektra system and generation rules</li>
              <li>Deck building rules (40-60 cards, 4-copy limit)</li>
              <li>The 7 battle phases</li>
              <li>Passive skill scopes (Active vs Active/Reserve)</li>
            </ul>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-orange-500 text-orange-100">
            <h3 className="font-bold text-orange-400 mb-2">Next Steps</h3>
            <ol className="space-y-2 text-sm text-gray-200 list-decimal list-inside">
              <li>Build your first deck in the Deck Builder</li>
              <li>Try a battle against the AI to practice</li>
              <li>Collect more cards from Booster Packs</li>
              <li>Experiment with different strategies and combos</li>
            </ol>
          </div>
          <p className="text-center text-orange-400 font-semibold">Good luck, Summoner! May your cards guide you to victory!</p>
        </div>
      )
    }
  ];

  const currentContent = tutorialSteps[currentStep - 1];

  return (
    <div className="flex flex-col items-center pb-24 pt-14 overflow-y-auto" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
      <div className="max-w-md mx-auto p-4 w-full">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg p-4 mb-4 border-2 border-yellow-400" style={{ boxShadow: '0 0 30px rgba(249, 115, 22, 0.3)' }}>
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-3xl font-bold text-white">Tutorial</h1>
            <button onClick={handleSkip} className="text-sm text-white hover:text-gray-100 transition-colors underline">
              Skip &rarr;
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-black/30 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-white whitespace-nowrap">{currentStep}/{totalSteps}</span>
          </div>
        </div>

        <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl shadow-lg p-6 mb-6 text-white border-2 border-orange-500" style={{ boxShadow: '0 0 30px rgba(249, 115, 22, 0.3)' }}>
          {!tutorialStarted ? (
            <>
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-3 text-orange-400">Welcome to Spektrum TCG!</h2>
                <p className="text-sm opacity-95 mb-3 text-gray-200">
                  Welcome, Summoner! Spektrum is a strategic trading card game where you'll build powerful decks and battle opponents using Avatars and Action cards.
                </p>
                <p className="text-sm opacity-95 text-gray-200">
                  Follow the guide to learn about card types, spektra, phases, and deck building. Then jump into the interactive tutorial battle!
                </p>
              </div>
              <button
                onClick={() => setTutorialStarted(true)}
                className="w-full mb-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center shadow-lg border border-blue-500"
              >
                <Swords className="w-4 h-4 mr-2" />
                Start Tutorial
              </button>
              {!ritualCompleted && (
                <button
                  onClick={() => setShowRitualModal(true)}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-orange-400 hover:to-orange-500 transition-all flex items-center justify-center shadow-lg"
                  style={{ boxShadow: '0 0 15px rgba(249, 115, 22, 0.6)' }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Begin The Ritual
                </button>
              )}
            </>
          ) : (
            <>
              <div className="mb-4">
                {currentContent.title && (
                  <h2 className="text-xl font-bold text-orange-400 mb-4">{currentContent.title}</h2>
                )}
                <div className="text-gray-200 text-sm">{currentContent.content}</div>
              </div>
              <div className="flex justify-between items-center space-x-3 mt-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    currentStep === 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-orange-600 border border-gray-600 hover:border-orange-500'
                  }`}
                >
                  &larr; Prev
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                    <div
                      key={step}
                      className={`w-2 h-2 rounded-full transition-all ${
                        step === currentStep ? 'bg-orange-500 w-6 shadow-lg'
                          : completedSteps.has(step) ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                      style={step === currentStep ? { boxShadow: '0 0 8px rgba(249, 115, 22, 0.8)' } : {}}
                    />
                  ))}
                </div>
                {currentStep < totalSteps ? (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-400 hover:to-orange-500 transition-all text-sm shadow-lg"
                    style={{ boxShadow: '0 0 15px rgba(249, 115, 22, 0.6)' }}
                  >
                    Next &rarr;
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-400 hover:to-green-500 transition-all text-sm shadow-lg"
                  >
                    Play!
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <TheRitualModal
        isOpen={showRitualModal}
        onClose={() => { setShowRitualModal(false); router.push('/cards'); }}
        onComplete={handleRitualComplete}
      />
    </div>
  );
}
