import type {
  IFlagsmithProjectsResult,
  IAllEnvironmentFlagsResult,
  IFlagsmithEnvironmentNamesResult,
  IFlagsmithWriteResult,
} from './integration.interfaces'

export abstract class IFlagsmithClient {
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
  abstract setFeatureStateEnabled(
    baseUrl: string,
    apiKey: string,
    environmentApiKey: string,
    flagKey: string,
    enabled: boolean,
  ): Promise<IFlagsmithWriteResult>
  abstract deleteFeature(
    baseUrl: string,
    apiKey: string,
    projectId: string,
    flagKey: string,
  ): Promise<IFlagsmithWriteResult>
}
