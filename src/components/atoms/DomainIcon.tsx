import {
  DOMAIN_ICON_MAP,
  type DomainIconName,
} from '@/lib/icons/iconSystem'

import { AppIcon, type AppIconProps } from './AppIcon'

export interface DomainIconProps extends Omit<AppIconProps, 'name'> {
  domain: DomainIconName
}

export const DomainIcon = ({ domain, ...props }: DomainIconProps) => {
  return <AppIcon name={DOMAIN_ICON_MAP[domain]} {...props} />
}

export default DomainIcon
