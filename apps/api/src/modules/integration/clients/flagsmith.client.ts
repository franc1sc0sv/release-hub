import { Injectable } from '@nestjs/common'
import { IFlagsmithClient } from '../interfaces/flagsmith-client.abstract'
import type {
  IFlagsmithResult,
  IFlagsmithProjectsResult,
  IFlagsmithEnvironmentFlag,
  IFlagsmithClientError,
  IAllEnvironmentFlagsResult,
  IAllEnvironmentFlag,
  IFlagsmithEnvironmentNamesResult,
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
}

type FetchEnvResult =
  | { ok: true; flags: IFlagsmithEnvironmentFlag[] }
  | { ok: false; error: IFlagsmithClientError }

type FetchEnvRichResult =
  | { ok: true; flags: Array<{ key: string; createdAt: string | null; enabled: boolean }> }
  | { ok: false; error: IFlagsmithClientError }

type ListEnvironmentsResult =
  | { ok: true; environments: FlagsmithEnvironmentResponse[] }
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

  async fetchFlags(
    baseUrl: string,
    apiKey: string,
    projectId: string,
  ): Promise<IFlagsmithResult> {
    const base = baseUrl.replace(/\/$/, '')
    const headers = { Authorization: `Token ${apiKey}`, 'Content-Type': 'application/json' }

    const environmentsResult = await this.listEnvironments(base, headers, projectId)
    if (!environmentsResult.ok) return { ok: false, error: environmentsResult.error }

    const stagingEnv = environmentsResult.environments.find((e) => /staging/i.test(e.name))
    const productionEnv = environmentsResult.environments.find((e) => /prod(uction)?/i.test(e.name))

    const [stagingResult, productionResult] = await Promise.all([
      stagingEnv
        ? this.fetchEnvFlags(base, stagingEnv.api_key)
        : Promise.resolve<FetchEnvResult>({ ok: true, flags: [] }),
      productionEnv
        ? this.fetchEnvFlags(base, productionEnv.api_key)
        : Promise.resolve<FetchEnvResult>({ ok: true, flags: [] }),
    ])

    if (!stagingResult.ok) return { ok: false, error: stagingResult.error }
    if (!productionResult.ok) return { ok: false, error: productionResult.error }

    return {
      ok: true,
      data: {
        staging: stagingResult.flags,
        production: productionResult.flags,
      },
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
    const flagMap = new Map<string, IAllEnvironmentFlag>()

    for (let i = 0; i < envList.length; i++) {
      const envName = envList[i].name
      const result = envResults[i]
      if (!result.ok) continue

      for (const flag of result.flags) {
        const existing = flagMap.get(flag.key)
        if (existing) {
          existing.states[envName] = flag.enabled
        } else {
          flagMap.set(flag.key, {
            key: flag.key,
            createdAt: flag.createdAt,
            states: { [envName]: flag.enabled },
          })
        }
      }
    }

    const flags = Array.from(flagMap.values()).map((flag) => {
      const states: Record<string, boolean> = {}
      for (const name of envNames) {
        states[name] = flag.states[name] ?? false
      }
      return { key: flag.key, createdAt: flag.createdAt, states }
    })

    return { ok: true, data: { environments: envNames, flags } }
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

  private async fetchEnvFlags(
    base: string,
    envApiKey: string,
  ): Promise<FetchEnvResult> {
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
        flags: states.map((s) => ({ key: s.feature.name, enabled: s.enabled })),
      }
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
        })),
      }
    } catch {
      return { ok: false, error: { kind: 'network', message: 'Could not reach Flagsmith instance' } }
    }
  }
}
