import { defineConfig } from 'tsdown'

export default defineConfig({
	attw: {
		enabled: true,
		profile: 'esm-only',
	},
	dts: true,
	entry: 'src/index.mts',
	exports: true,
	publint: true,
})
