import { registerEnumType } from '@nestjs/graphql'
import { ProjectRole } from '@release-hub/shared'

registerEnumType(ProjectRole, { name: 'ProjectRole' })

export { ProjectRole }
