export interface FlagChangeTarget {
  flagKey: string
  environmentName: string
  currentEnabled: boolean
  nextEnabled: boolean
}

export interface FlagDeleteTarget {
  flagKey: string
  environments: string[]
}
