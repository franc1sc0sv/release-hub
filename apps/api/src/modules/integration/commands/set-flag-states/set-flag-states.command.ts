import type { ISetFlagStateTarget } from '../../interfaces/flagsmith-sync.interfaces'

export class SetFlagStatesCommand {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
    public readonly targets: ISetFlagStateTarget[],
  ) {}
}
