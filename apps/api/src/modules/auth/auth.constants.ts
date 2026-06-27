import * as bcrypt from 'bcryptjs'

export const DUMMY_HASH = bcrypt.hashSync('release-hub-timing-equalizer', 10)
