import { Field, ID, InputType, Int, registerEnumType } from '@nestjs/graphql'
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { SortDirection } from '../../../common/types/sort-direction.enum'
import {
  BranchActivityRange,
  BranchCleanupSortField,
  BranchProtectionFilter,
  BranchSignalFilter,
} from '../interfaces/repo-ops.interfaces'

registerEnumType(BranchCleanupSortField, { name: 'BranchCleanupSortField' })
registerEnumType(BranchActivityRange, { name: 'BranchActivityRange' })
registerEnumType(BranchProtectionFilter, { name: 'BranchProtectionFilter' })
registerEnumType(BranchSignalFilter, { name: 'BranchSignalFilter' })

@InputType()
export class BranchCleanupPageInput {
  @Field(() => ID)
  @IsString()
  projectId: string

  @Field(() => Int, { nullable: true, defaultValue: 15 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string

  @Field(() => BranchCleanupSortField, { nullable: true })
  @IsOptional()
  @IsEnum(BranchCleanupSortField)
  sortField?: BranchCleanupSortField

  @Field(() => SortDirection, { nullable: true, defaultValue: SortDirection.DESC })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  authorFilter?: string

  @Field(() => BranchActivityRange, { nullable: true })
  @IsOptional()
  @IsEnum(BranchActivityRange)
  activity?: BranchActivityRange

  @Field(() => BranchProtectionFilter, { nullable: true })
  @IsOptional()
  @IsEnum(BranchProtectionFilter)
  protection?: BranchProtectionFilter

  @Field(() => [BranchSignalFilter], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(BranchSignalFilter, { each: true })
  signals?: BranchSignalFilter[]
}
