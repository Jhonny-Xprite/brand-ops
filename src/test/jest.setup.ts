import React from 'react'
import '@testing-library/jest-dom'

const MOTION_PROP_KEYS = new Set([
  'animate',
  'exit',
  'initial',
  'layout',
  'layoutId',
  'transition',
  'variants',
  'whileDrag',
  'whileFocus',
  'whileHover',
  'whileInView',
  'whileTap',
])

const stripMotionProps = (props: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(props).filter(([key]) => !MOTION_PROP_KEYS.has(key)))

const createMotionComponent = (tagName: string) =>
  React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
    ({ children, ...props }, ref) =>
      React.createElement(tagName, { ...stripMotionProps(props), ref }, children),
  )

jest.mock('framer-motion', () => {
  const motion = new Proxy(
    {},
    {
      get: (_target, property: string) => createMotionComponent(property || 'div'),
    },
  )

  const passthrough = ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children)

  return {
    __esModule: true,
    AnimatePresence: passthrough,
    LayoutGroup: passthrough,
    MotionConfig: passthrough,
    motion,
    useReducedMotion: () => false,
  }
})
