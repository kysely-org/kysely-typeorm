import type { JSONColumnType as KyselyJSONColumnType } from 'kysely'
import { describe, expectTypeOf, it } from 'vitest'
import type {
	Generated,
	GeneratedAlways,
	JSONColumnType,
	KyselifyEntity,
	NonAttribute,
} from '../../src/index.mjs'

type Video = { size: number; bitrate: number }
type Videos = { [key: string]: Video }

describe('branded types', () => {
	it('should not leak brands into index signature values', () => {
		expectTypeOf(Object.values({} as JSONColumnType<Videos>)).toEqualTypeOf<
			Video[]
		>()
		expectTypeOf(
			Object.entries({} as NonNullable<JSONColumnType<Videos | null>>),
		).toEqualTypeOf<[string, Video][]>()
		expectTypeOf(Object.values({} as Generated<Videos>)).toEqualTypeOf<
			Video[]
		>()
		expectTypeOf(Object.values({} as GeneratedAlways<Videos>)).toEqualTypeOf<
			Video[]
		>()
		expectTypeOf(Object.values({} as NonAttribute<Videos>)).toEqualTypeOf<
			Video[]
		>()
	})

	it('should still kyselify branded index signature columns', () => {
		class VideoEntity {
			videos: JSONColumnType<Videos | null>
		}

		expectTypeOf<KyselifyEntity<VideoEntity>>().toEqualTypeOf<{
			videos: KyselyJSONColumnType<Videos | null>
		}>()
	})
})
