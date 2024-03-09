/// <reference types="vitest" />
import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";

export default defineConfig({
	plugins: [
		dtsPlugin({ rollupTypes: true })
	],
	build: {
		sourcemap: true,
		minify: false,
		target: "esnext",
		lib: {
			entry: './src/index.ts',
			name: 'facilmap-utils',
			fileName: () => 'facilmap-utils.mjs',
			formats: ['es']
		},
		rollupOptions: {
			external: (id) => id.includes("/node_modules/") || (!id.startsWith("./") && !id.startsWith("../") && /* resolved internal modules */ !id.startsWith("/"))
		}
	},
	test: {
		server: {
			deps: {
				external: [/\/node_modules\//] // Temporary fix for https://discord.com/channels/917386801235247114/1215127757550260225
			}
		}
	}
});
