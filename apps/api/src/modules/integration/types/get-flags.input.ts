import { Field, ID, InputType, Int } from '@nestjs/graphql'
import { IsOptional, IsString, IsInt, IsArray, IsEnum, Min } from 'class-validator'
import { FlagSortField } from '../../../common/types/flag-sort-field.enum'
import { SortDirection } from '../../../common/types/sort-direction.enum'
import { FlagDeploymentStatus } from '../../../common/types/flag-deployment-status.enum'
import { FlagActivityFilter } from '../../../common/types/flag-activity-filter.enum'

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

  @Field(() => [FlagDeploymentStatus], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(FlagDeploymentStatus, { each: true })
  statuses?: FlagDeploymentStatus[]

  @Field(() => FlagActivityFilter, { nullable: true })
  @IsOptional()
  @IsEnum(FlagActivityFilter)
  activity?: FlagActivityFilter

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number
}
