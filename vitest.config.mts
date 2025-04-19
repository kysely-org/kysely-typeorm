import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		allowOnly: false,
		globalSetup: ['./vitest.setup.mts'],
		typecheck: {
			enabled: true,
			ignoreSourceErrors: true,
		},
	},
})
