import { registerEnumType } from '@nestjs/graphql'
import { GithubAuthMode } from '@release-hub/db'

registerEnumType(GithubAuthMode, { name: 'GithubAuthMode' })

export { GithubAuthMode }
