import type {IsolationLevel as KyselyIsolationLevel} from 'kysely'
import type {IsolationLevel as TypeORMIsolationLevel} from 'typeorm/driver/types/IsolationLevel'

export const ISOLATION_LEVELS = {
  'read committed': 'READ COMMITTED',
  'read uncommitted': 'READ UNCOMMITTED',
  'repeatable read': 'REPEATABLE READ',
  serializable: 'SERIALIZABLE',
  snapshot: null,
} as const satisfies Record<KyselyIsolationLevel, TypeORMIsolationLevel | null>
