import { Injectable } from '@nestjs/common'
import { IFlagsmithClient } from '../interfaces/flagsmith-client.abstract'
import { stringifyFlagsmithValue } from '../utils/stringify-flagsmith-value'
import type {
  IFlagsmithProjectsResult,
  IFlagsmithClientError,
  IAllEnvironmentFlagsResult,
  IAllEnvironmentFlag,
  IFlagsmithEnvironmentNamesResult,
  IFlagsmithWriteResult,
} from '../interfaces/integration.interfaces'

interface FlagsmithEnvironmentResponse {
  api_key: string
  name: string
}

interface FlagsmithProjectResponse {
  id: number
  name: string
}

interface FlagsmithFeatureStateResponse {
  feature: { name: string; created_date: string | null }
  enabled: boolean
  feature_state_value: string | number | boolean | null
}

type FetchEnvRichResult =
  | {
      ok: true
      flags: Array<{ key: string; createdAt: string | null; enabled: boolean; value: string | null }>
    }
  | { ok: false; error: IFlagsmithClientError }

type ListEnvironmentsResult =
  | { ok: true; environments: FlagsmithEnvironmentResponse[] }
  | { ok: false; error: IFlagsmithClientError }

interface FlagsmithEnvironmentFeatureStateResponse {
  id: number
  feature: number
  environment: number
  enabled: boolean
  feature_state_value: string | number | boolean | null
  multivariate_feature_state_values: unknown[]
}

interface FlagsmithFeatureIdResponse {
  id: number
  name: string
}

type ResolveIdResult = { ok: true; id: number | null } | { ok: false; error: IFlagsmithClientError }

type FetchFeatureStateResult =
  | { ok: true; state: FlagsmithEnvironmentFeatureStateResponse | null }
  | { ok: false; error: IFlagsmithClientError }

@Injectable()
export class FlagsmithClient extends IFlagsmithClient {
  private async unexpectedError(res: Response): Promise<IFlagsmithClientError> {
    const detail = await res.text().catch(() => '')
    const trimmed = detail.trim().slice(0, 300)
    const suffix = trimmed.length > 0 ? `: ${trimmed}` : ''
    return { kind: 'unexpected', message: `Flagsmith responded with ${res.status}${suffix}` }
  }

  async listProjects(baseUrl: string, apiKey: string): Promise<IFlagsmithProjectsResult> {
    const base = baseUrl.replace(/\/$/, '')
    const headers = { Authorization: `Token ${apiKey}`, 'Content-Type': 'application/json' }

    try {
      const res = await fetch(`${base}/api/v1/projects/`, { headers })
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: { kind: 'auth', message: 'Invalid or expired Flagsmith API token' } }
      }
      if (!res.ok) {
        return { ok: false, error: await this.unexpectedError(res) }
      }
      const body = (await res.json()) as
        | { results?: FlagsmithProjectResponse[] }
        | FlagsmithProjectResponse[]
      const projects = Array.isArray(body) ? body : (body.results ?? [])
      return { ok: true, projects: projects.map((p) => ({ id: String(p.id), name: p.name })) }
    } catch {
      return { ok: false, error: { kind: 'network', message: 'Could not reach Flagsmith instance' } }
    }
  }

  async fetchAllEnvironmentFlags(
    baseUrl: string,
    apiKey: string,
    projectId: string,
  ): Promise<IAllEnvironmentFlagsResult> {
    const base = baseUrl.replace(/\/$/, '')
    const headers = { Authorization: `Token ${apiKey}`, 'Content-Type': 'application/json' }

    const environmentsResult = await this.listEnvironments(base, headers, projectId)
    if (!environmentsResult.ok) return { ok: false, error: environmentsResult.error }

    const envList = environmentsResult.environments
    const envResults = await Promise.all(
      envList.map((env) => this.fetchEnvFlagsRich(base, env.api_key)),
    )

    for (const result of envResults) {
      if (!result.ok) return { ok: false, error: result.error }
    }

    const envNames = envList.map((e) => e.name)
    const environmentDetails = envList.map((e) => ({ name: e.name, apiKey: e.api_key }))
    const flagMap = new Map<string, IAllEnvironmentFlag>()

    for (let i = 0; i < envList.length; i++) {
      const envName = envList[i].name
      const result = envResults[i]
      if (!result.ok) continue

      for (const flag of result.flags) {
        const existing = flagMap.get(flag.key)
        if (existing) {
          existing.states[envName] = flag.enabled
          existing.values[envName] = flag.value
        } else {
          flagMap.set(flag.key, {
            key: flag.key,
            createdAt: flag.createdAt,
            states: { [envName]: flag.enabled },
            values: { [envName]: flag.value },
          })
        }
      }
    }

    const flags = Array.from(flagMap.values()).map((flag) => {
      const states: Record<string, boolean> = {}
      const values: Record<string, string | null> = {}
      for (const name of envNames) {
        states[name] = flag.states[name] ?? false
        values[name] = flag.values[name] ?? null
      }
      return { key: flag.key, createdAt: flag.createdAt, states, values }
    })

    return { ok: true, data: { environments: envNames, environmentDetails, flags } }
  }

  async listEnvironmentNames(
    baseUrl: string,
    apiKey: string,
    projectId: string,
  ): Promise<IFlagsmithEnvironmentNamesResult> {
    const base = baseUrl.replace(/\/$/, '')
    const headers = { Authorization: `Token ${apiKey}`, 'Content-Type': 'application/json' }
    const result = await this.listEnvironments(base, headers, projectId)
    if (!result.ok) return { ok: false, error: result.error }
    return { ok: true, names: result.environments.map((e) => e.name) }
  }

  async setFeatureStateEnabled(
    baseUrl: string,
    apiKey: string,
    environmentApiKey: string,
    flagKey: string,
    enabled: boolean,
  ): Promise<IFlagsmithWriteResult> {
    const base = baseUrl.replace(/\/$/, '')
    const headers = { Authorization: `Token ${apiKey}`, 'Content-Type': 'application/json' }

    const current = await this.fetchFeatureState(base, headers, environmentApiKey, flagKey)
    if (!current.ok) return { ok: false, error: current.error }
    if (current.state === null) {
      return { ok: false, error: { kind: 'notFound', message: `Flag "${flagKey}" was not found in this environment` } }
    }

    const state = current.state

    try {
      const res = await fetch(
        `${base}/api/v1/environments/${encodeURIComponent(environmentApiKey)}/featurestates/${state.id}/`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            id: state.id,
            feature: state.feature,
            environment: state.environment,
            enabled,
            feature_state_value: state.feature_state_value,
            multivariate_feature_state_values: state.multivariate_feature_state_values,
          }),
        },
      )
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: { kind: 'auth', message: 'The Flagsmith token cannot change this flag' } }
      }
      if (!res.ok) {
        return { ok: false, error: await this.unexpectedError(res) }
      }
      return { ok: true }
    } catch {
      return { ok: false, error: { kind: 'network', message: 'Could not reach Flagsmith instance' } }
    }
  }

  async deleteFeature(
    baseUrl: string,
    apiKey: string,
    projectId: string,
    flagKey: string,
  ): Promise<IFlagsmithWriteResult> {
    const base = baseUrl.replace(/\/$/, '')
    const headers = { Authorization: `Token ${apiKey}`, 'Content-Type': 'application/json' }

    const featureId = await this.resolveFeatureId(base, headers, projectId, flagKey)
    if (!featureId.ok) return { ok: false, error: featureId.error }
    if (featureId.id === null) return { ok: true }

    try {
      const res = await fetch(
        `${base}/api/v1/projects/${encodeURIComponent(projectId)}/features/${featureId.id}/`,
        { method: 'DELETE', headers },
      )
      if (res.status === 404) return { ok: true }
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: { kind: 'auth', message: 'The Flagsmith token cannot delete this flag' } }
      }
      if (!res.ok) {
        return { ok: false, error: await this.unexpectedError(res) }
      }
      return { ok: true }
    } catch {
      return { ok: false, error: { kind: 'network', message: 'Could not reach Flagsmith instance' } }
    }
  }

  private async fetchFeatureState(
    base: string,
    headers: Record<string, string>,
    environmentApiKey: string,
    flagKey: string,
  ): Promise<FetchFeatureStateResult> {
    try {
      const res = await fetch(
        `${base}/api/v1/environments/${encodeURIComponent(environmentApiKey)}/featurestates/?feature_name=${encodeURIComponent(flagKey)}`,
        { headers },
      )
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: { kind: 'auth', message: 'Invalid or expired Flagsmith API token' } }
      }
      if (res.status === 404) {
        return { ok: true, state: null }
      }
      if (!res.ok) {
        return { ok: false, error: await this.unexpectedError(res) }
      }
      const body = (await res.json()) as
        | { results?: FlagsmithEnvironmentFeatureStateResponse[] }
        | FlagsmithEnvironmentFeatureStateResponse[]
      const results = Array.isArray(body) ? body : (body.results ?? [])
      return { ok: true, state: results[0] ?? null }
    } catch {
      return { ok: false, error: { kind: 'network', message: 'Could not reach Flagsmith instance' } }
    }
  }

  private async resolveFeatureId(
    base: string,
    headers: Record<string, string>,
    projectId: string,
    flagKey: string,
  ): Promise<ResolveIdResult> {
    try {
      const res = await fetch(
        `${base}/api/v1/projects/${encodeURIComponent(projectId)}/features/?search=${encodeURIComponent(flagKey)}`,
        { headers },
      )
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: { kind: 'auth', message: 'Invalid or expired Flagsmith API token' } }
      }
      if (res.status === 404) {
        return { ok: true, id: null }
      }
      if (!res.ok) {
        return { ok: false, error: await this.unexpectedError(res) }
      }
      const body = (await res.json()) as
        | { results?: FlagsmithFeatureIdResponse[] }
        | FlagsmithFeatureIdResponse[]
      const results = Array.isArray(body) ? body : (body.results ?? [])
      return { ok: true, id: results.find((feature) => feature.name === flagKey)?.id ?? null }
    } catch {
      return { ok: false, error: { kind: 'network', message: 'Could not reach Flagsmith instance' } }
    }
  }

  private async listEnvironments(
    base: string,
    headers: Record<string, string>,
    projectId: string,
  ): Promise<ListEnvironmentsResult> {
    try {
      const res = await fetch(
        `${base}/api/v1/environments/?project=${encodeURIComponent(projectId)}`,
        { headers },
      )
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: { kind: 'auth', message: 'Invalid or expired Flagsmith API token' } }
      }
      if (!res.ok) {
        return { ok: false, error: await this.unexpectedError(res) }
      }
      const body = (await res.json()) as
        | { results?: FlagsmithEnvironmentResponse[] }
        | FlagsmithEnvironmentResponse[]
      return { ok: true, environments: Array.isArray(body) ? body : (body.results ?? []) }
    } catch {
      return { ok: false, error: { kind: 'network', message: 'Could not reach Flagsmith instance' } }
    }
  }

  private async fetchEnvFlagsRich(
    base: string,
    envApiKey: string,
  ): Promise<FetchEnvRichResult> {
    const headers = { 'X-Environment-Key': envApiKey, 'Content-Type': 'application/json' }
    try {
      const res = await fetch(`${base}/api/v1/flags/`, { headers })
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: { kind: 'auth', message: 'Invalid or expired Flagsmith API token' } }
      }
      if (res.status === 404) {
        return { ok: false, error: { kind: 'notFound', message: `Environment not found` } }
      }
      if (!res.ok) {
        return { ok: false, error: await this.unexpectedError(res) }
      }
      const body = (await res.json()) as
        | { results?: FlagsmithFeatureStateResponse[] }
        | FlagsmithFeatureStateResponse[]
      const states = Array.isArray(body) ? body : (body.results ?? [])
      return {
        ok: true,
        flags: states.map((s) => ({
          key: s.feature.name,
          createdAt: s.feature.created_date ?? null,
          enabled: s.enabled,
          value: stringifyFlagsmithValue(s.feature_state_value),
        })),
      }
    } catch {
      return { ok: false, error: { kind: 'network', message: 'Could not reach Flagsmith instance' } }
    }
  }
}
