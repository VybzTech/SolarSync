import {
  FolderOpen,
  GitBranch,
  LayoutDashboard,
  MessageSquarePlus,
  Target,
} from 'lucide-react'
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
    label: 'Overview',
    description: 'Phase 1 roadmap and live status',
    icon: LayoutDashboard,
  },
  {
    to: '/lifecycle',
    label: 'SDLC Lifecycle',
    description: 'How the work moves from scope to handover',
    icon: GitBranch,
  },
  {
    to: '/milestones',
    label: 'Milestones & Deliverables',
    description: 'What is being built, and what it costs',
    icon: Target,
  },
  {
    to: '/documents',
    label: 'Documents',
    description: 'Contracts, invoices and brand assets',
    icon: FolderOpen,
  },
  {
    to: '/requests',
    label: 'Change Requests',
    description: 'Submit and track SLA-aligned requests',
    icon: MessageSquarePlus,
  },
]
