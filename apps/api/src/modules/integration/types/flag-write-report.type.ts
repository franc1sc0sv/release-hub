import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class FlagWriteResultType {
  @Field(() => String)
  flagKey: string

  @Field(() => String, { nullable: true })
  environmentName: string | null

  @Field(() => Boolean)
  ok: boolean

  @Field(() => String, { nullable: true })
  error: string | null
}

@ObjectType()
export class FlagWriteReportType {
  @Field(() => Int)
  succeeded: number

  @Field(() => Int)
  failed: number

  @Field(() => [FlagWriteResultType])
  results: FlagWriteResultType[]
}
