import type { ICreateSummaryProfileRuleData, ICreateSummaryProfileExampleData } from '../../interfaces/summary-profile.interfaces'

export class UpdateSummaryProfileCommand {
  constructor(
    readonly profileId: string,
    readonly name: string,
    readonly description: string | null,
    readonly outputTemplate: string | null,
    readonly rules: ICreateSummaryProfileRuleData[],
    readonly examples: ICreateSummaryProfileExampleData[],
    readonly userId: string,
  ) {}
}
