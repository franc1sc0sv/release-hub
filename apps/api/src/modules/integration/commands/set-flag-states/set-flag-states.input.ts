import { Field, ID, InputType } from '@nestjs/graphql'
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

@InputType()
export class FlagStateTargetInput {
  @Field(() => String)
  @IsString()
  flagKey: string

  @Field(() => String)
  @IsString()
  environmentName: string

  @Field(() => Boolean)
  @IsBoolean()
  enabled: boolean
}

@InputType()
export class SetFlagStatesInput {
  @Field(() => ID)
  @IsString()
  projectId: string

  @Field(() => [FlagStateTargetInput])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => FlagStateTargetInput)
  targets: FlagStateTargetInput[]
}
