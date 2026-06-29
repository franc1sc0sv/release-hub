import type { IFlagsmithResult, IFlagsmithProjectsResult, IAllEnvironmentFlagsResult, IFlagsmithEnvironmentNamesResult } from './integration.interfaces'

export abstract class IFlagsmithClient {
  abstract fetchFlags(
    baseUrl: string,
    apiKey: string,
    projectId: string,
  ): Promise<IFlagsmithResult>
  abstract listProjects(baseUrl: string, apiKey: string): Promise<IFlagsmithProjectsResult>
  abstract fetchAllEnvironmentFlags(
    baseUrl: string,
    apiKey: string,
    projectId: string,
  ): Promise<IAllEnvironmentFlagsResult>
  abstract listEnvironmentNames(
    baseUrl: string,
    apiKey: string,
    projectId: string,
  ): Promise<IFlagsmithEnvironmentNamesResult>
}
