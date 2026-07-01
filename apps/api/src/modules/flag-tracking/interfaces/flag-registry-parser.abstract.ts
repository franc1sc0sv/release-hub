export abstract class IFlagRegistryParser {
  abstract parseRegistry(content: string): Set<string>
  abstract parsePatchDiff(patch: string): { added: Set<string>; removed: Set<string> }
}
