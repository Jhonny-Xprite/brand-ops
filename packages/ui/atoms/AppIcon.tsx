import type { LucideProps } from 'lucide-react'

import {
  APP_ICON_MAP,
  APP_ICON_SIZES,
  getToneClassName,
  type AppIconName,
  type AppIconSize,
  type AppIconTone,
} from '@/lib/icons/iconSystem'

export interface AppIconProps extends Omit<LucideProps, 'size'> {
  name: AppIconName
  size?: AppIconSize | number
  tone?: AppIconTone
  decorative?: boolean
}

export const AppIcon = ({
  name,
  size = 'md',
  tone = 'default',
  decorative = true,
  className = '',
  ...props
}: AppIconProps) => {
  const Icon = APP_ICON_MAP[name]
  const resolvedSize = typeof size === 'number' ? size : APP_ICON_SIZES[size]

  return (
    <Icon
      size={resolvedSize}
      aria-hidden={decorative}
      focusable={decorative ? 'false' : undefined}
      className={`${getToneClassName(tone)} ${className}`.trim()}
      {...props}
    />
  )
}

export default AppIcon
