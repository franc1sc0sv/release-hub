import { registerEnumType } from '@nestjs/graphql'
import { OrgRole } from '@release-hub/db'

registerEnumType(OrgRole, { name: 'OrgRole' })

export { OrgRole }
