import { FolderOpen, LayoutDashboard, Link2, MessageSquarePlus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  description: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Dashboard',
    description: 'Overview and live milestones',
    icon: LayoutDashboard,
  },
  {
    to: '/staging',
    label: 'Staging Hub',
    description: 'Environments, prototype and API health',
    icon: Link2,
  },
  {
    to: '/requests',
    label: 'Change Requests',
    description: 'Submit and track SLA-aligned requests',
    icon: MessageSquarePlus,
  },
  {
    to: '/vault',
    label: 'Resource Vault',
    description: 'Contracts, invoices and brand assets',
    icon: FolderOpen,
  },
]
