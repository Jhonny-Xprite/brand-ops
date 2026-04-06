import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, RotateCcw, Zap, Waves, Activity } from 'lucide-react'
import { MotionButton } from '../atoms'

interface PhysicsPreset {
  name: string
  icon: React.ReactNode
  stiffness: number
  damping: number
  mass: number
  description: string
}

const PRESETS: PhysicsPreset[] = [
  {
    name: 'Haptic (Standard)',
    icon: <Zap className="h-4 w-4" />,
    stiffness: 500,
    damping: 15,
    mass: 1,
    description: 'Rígido, autoritário, resposta instantânea (O Zag do Brand-Ops).'
  },
  {
    name: 'Liquid (Flow)',
    icon: <Waves className="h-4 w-4" />,
    stiffness: 100,
    damping: 20,
    mass: 1,
    description: 'Suave, orgânico, focado em continuidade e fluidez.'
  },
  {
    name: 'Impact (Aggressive)',
    icon: <Activity className="h-4 w-4" />,
    stiffness: 1000,
    damping: 10,
    mass: 0.5,
    description: 'Ação crítica, vibração residual, atenção máxima.'
  }
]

/**
 * MotionSandbox Molecule: Interactive Physics Lab
 * Allows real-time testing of brand 'Strategic Emotion' via motion physics.
 */
export const MotionSandbox: React.FC = () => {
  const [currentPreset, setCurrentPreset] = useState<PhysicsPreset>(PRESETS[0])
  const [toggle, setToggle] = useState(false)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-10 glass-l1 rounded-[40px]">
      {/* Controls Card */}
      <div className="space-y-8">
        <header>
          <h4 className="text-xl font-display font-bold text-text mb-2">Laboratório de Física de Marca</h4>
          <p className="text-sm text-text-muted font-medium">
            Escolha uma "Emoção Estratégica" e teste a resposta tátil do sistema.
          </p>
        </header>

        <div className="space-y-4">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setCurrentPreset(preset)}
              className={`w-full p-4 rounded-2xl flex items-start gap-4 transition-all duration-300 border ${
                currentPreset.name === preset.name 
                  ? 'bg-action-primary/10 border-action-primary text-action-primary' 
                  : 'bg-white/5 border-transparent hover:bg-white/10 text-white/40'
              }`}
            >
              <div className={`p-2 rounded-xl ${currentPreset.name === preset.name ? 'bg-action-primary text-white' : 'bg-white/5'}`}>
                {preset.icon}
              </div>
              <div className="text-left">
                <div className="font-bold text-sm tracking-tight">{preset.name}</div>
                <div className="text-[10px] opacity-60 font-medium mt-1">{preset.description}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-6 border-t border-white/5 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Stiffness</div>
            <div className="text-lg font-mono font-bold text-action-primary">{currentPreset.stiffness}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Damping</div>
            <div className="text-lg font-mono font-bold text-action-primary">{currentPreset.damping}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Mass</div>
            <div className="text-lg font-mono font-bold text-action-primary">{currentPreset.mass}</div>
          </div>
        </div>
      </div>

      {/* Visualizer Area */}
      <div className="relative flex flex-col items-center justify-center bg-black/40 rounded-[32px] overflow-hidden min-h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-br from-action-primary/5 to-transparent flex items-center justify-center opacity-50" />
        
        {/* The Physical Entity to be Tested */}
        <motion.div
          layout
          key={toggle ? 'on' : 'off'}
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: toggle ? -100 : 0 }}
          transition={{
            type: 'spring',
            stiffness: currentPreset.stiffness,
            damping: currentPreset.damping,
            mass: currentPreset.mass
          }}
          className="relative z-10 w-32 h-32 rounded-[40px] bg-gradient-to-br from-action-primary to-action-secondary shadow-[0_0_50px_rgba(0,186,199,0.3)] flex items-center justify-center"
        >
          <div className="h-4 w-4 bg-white/20 rounded-full blur-md" />
        </motion.div>

        {/* Action Controls */}
        <div className="absolute bottom-8 flex gap-4 z-20">
          <MotionButton 
            onClick={() => setToggle(!toggle)}
            variant="primary" 
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4 fill-current" /> Launch Reactivity
          </MotionButton>
          <MotionButton 
            onClick={() => setToggle(false)}
            variant="secondary" 
            className="w-12 h-12 p-0 flex items-center justify-center"
          >
            <RotateCcw className="h-4 w-4" />
          </MotionButton>
        </div>

        {/* Trace Lines */}
        <div className="absolute w-full h-[1px] bg-white/5 bottom-1/2 translate-y-[-50px]" />
        <div className="absolute w-full h-[1px] bg-white/5 bottom-1/2 translate-y-[50px]" />
      </div>
    </div>
  )
}

export default MotionSandbox
