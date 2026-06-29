import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class ExportResultType {
  @Field(() => String)
  url: string

  @Field(() => String)
  filename: string
}
