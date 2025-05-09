import type { AvailableRoles, WorkspaceSeatType } from '@speckle/shared'

type BaseSettingsMenuItem = {
  title: string
  disabled?: boolean
  tooltipText?: string
  permission?: AvailableRoles[]
}

export type GenericSettingsMenuItem = BaseSettingsMenuItem & {
  route: string
}

export type WorkspaceSettingsMenuItem = BaseSettingsMenuItem & {
  name: string
  route: (slug: string) => string
}

export enum WorkspaceUserActionTypes {
  RemoveMember = 'remove-member',
  LeaveWorkspace = 'leave-workspace',
  MakeAdmin = 'make-admin',
  RemoveAdmin = 'remove-admin',
  MakeGuest = 'make-guest',
  MakeMember = 'make-member',
  UpgradeEditor = 'upgrade-editor',
  DowngradeEditor = 'downgrade-editor'
}

export type WorkspaceUserUpdateShowOptions = {
  isActiveUserWorkspaceAdmin?: boolean
  isActiveUserTargetUser?: boolean
  targetUserCurrentRole?: string
  targetUserCurrentSeatType?: WorkspaceSeatType
  isDomainCompliant?: boolean
}

type WorkspaceUserActionsMenuConfig = {
  title: string
  show: (options: WorkspaceUserUpdateShowOptions) => boolean
}

export type WorkspaceUserActionsDialogConfig = {
  title: string
  mainMessage: string | ((seatType?: WorkspaceSeatType) => string)
  showRoleInfo?: boolean
  buttonText: string
  seatCountMessage?: boolean
}

export type WorkspaceUserActionConfig = {
  menu: WorkspaceUserActionsMenuConfig
  dialog: WorkspaceUserActionsDialogConfig
}
