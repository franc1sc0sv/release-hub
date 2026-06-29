import { Injectable, NotImplementedException } from '@nestjs/common'
import { IAiProvider } from '../interfaces/ai-provider.abstract'
import type {
  IAiSuggestInput,
  IAiSuggestResult,
  IAiStreamSummaryInput,
  IAiPrSummaryInput,
  IAiPrSummaryResult,
} from '../interfaces/ai-provider.abstract'
import { SummaryChunkType } from '../types/summary-chunk.type'

@Injectable()
export class AnthropicAiProvider extends IAiProvider {
  suggest(_input: IAiSuggestInput): Promise<IAiSuggestResult> {
    throw new NotImplementedException(
      'AnthropicAiProvider.suggest is not implemented for this pass. ' +
        'Wire the @anthropic-ai/sdk client here as a drop-in replacement for DevAiProvider.',
    )
  }

  summarizePullRequest(_input: IAiPrSummaryInput): Promise<IAiPrSummaryResult> {
    throw new NotImplementedException(
      'AnthropicAiProvider.summarizePullRequest is not implemented for this pass. ' +
        'Wire the @anthropic-ai/sdk client here as a drop-in replacement for DevAiProvider.',
    )
  }

  async *streamSummary(
    _input: IAiStreamSummaryInput,
  ): AsyncIterable<SummaryChunkType> {
    throw new NotImplementedException(
      'AnthropicAiProvider.streamSummary is not implemented for this pass. ' +
        'Wire the @anthropic-ai/sdk streaming client here as a drop-in replacement for DevAiProvider.',
    )
  }
}
