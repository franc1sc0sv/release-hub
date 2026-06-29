import { Field, ID, InputType, Int } from '@nestjs/graphql'
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator'
import { FlagSortField } from '../../../common/types/flag-sort-field.enum'
import { SortDirection } from '../../../common/types/sort-direction.enum'

@InputType()
export class GetFlagsInput {
  @Field(() => ID)
  @IsString()
  projectId!: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string

  @Field(() => FlagSortField, { nullable: true, defaultValue: FlagSortField.CREATED })
  @IsOptional()
  sortField?: FlagSortField

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sortEnvironment?: string

  @Field(() => SortDirection, { nullable: true, defaultValue: SortDirection.DESC })
  @IsOptional()
  sortDirection?: SortDirection

  @Field(() => Int, { nullable: true, defaultValue: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number
}
