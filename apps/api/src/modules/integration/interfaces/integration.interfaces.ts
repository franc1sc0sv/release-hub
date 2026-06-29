export interface IFlagEnvironmentState {
  name: string
  enabled: boolean
}

export interface IFlagRef {
  key: string
  createdAt: string | null
  environments: IFlagEnvironmentState[]
}

export interface IAllEnvironmentFlag {
  key: string
  createdAt: string | null
  states: Record<string, boolean>
}

export interface IAllEnvironmentFlagsData {
  environments: string[]
  flags: IAllEnvironmentFlag[]
}

export type IAllEnvironmentFlagsResult =
  | { ok: true; data: IAllEnvironmentFlagsData }
  | { ok: false; error: IFlagsmithClientError }

export type IFlagsmithEnvironmentNamesResult =
  | { ok: true; names: string[] }
  | { ok: false; error: IFlagsmithClientError }

export interface IConnectionSettings {
  flagsmithApiKey: string | null
  flagsmithUrl: string | null
}

export interface IUpdateConnectionSettingsData {
  flagsmithApiKey?: string | null
  flagsmithUrl?: string | null
}

export interface IFlagsmithEnvironmentFlag {
  key: string
  enabled: boolean
}

export interface IFlagsmithEnvironmentFlags {
  staging: IFlagsmithEnvironmentFlag[]
  production: IFlagsmithEnvironmentFlag[]
}

export interface IFlagsmithClientError {
  kind: 'network' | 'auth' | 'notFound' | 'unexpected'
  message: string
}

export type IFlagsmithResult =
  | { ok: true; data: IFlagsmithEnvironmentFlags }
  | { ok: false; error: IFlagsmithClientError }

export interface IFlagsmithProject {
  id: string
  name: string
}

export type IFlagsmithProjectsResult =
  | { ok: true; projects: IFlagsmithProject[] }
  | { ok: false; error: IFlagsmithClientError }
