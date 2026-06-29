export abstract class ICodeFlagScanner {
  abstract scan(repoPath: string): Promise<Set<string>>
}
