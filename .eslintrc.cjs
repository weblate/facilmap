/** @type {import('eslint').Linter.Config} */
module.exports = {
	root: true,
	ignorePatterns: ["**/dist/*", "**/out/*", "**/out.*/*"],
	parserOptions: {
		parser: "@typescript-eslint/parser",
		project: ["*/tsconfig.json", "*/tsconfig.node.json"],
		extraFileExtensions: [".vue"]
	},
	plugins: ["@typescript-eslint", "import"],
	extends: [
		"plugin:import/typescript",
		"plugin:vue/vue3-essential"
	],
	overrides: [
		{
			extends: ["plugin:@typescript-eslint/disable-type-checked"],
			files: ["**/*.js", "**/*.cjs"]
		}
	],
	env: {
		node: true
	},
	rules: {
		"@typescript-eslint/explicit-module-boundary-types": ["warn", { "allowArgumentsExplicitlyTypedAsAny": true }],
		"import/no-unresolved": ["error", { "ignore": [ "geojson", "virtual:icons" ], "caseSensitive": true }],
		"import/no-extraneous-dependencies": ["error"],
		"@typescript-eslint/no-unused-vars": ["warn", { "args": "none" }],
		"import/no-named-as-default": ["warn"],
		"import/no-duplicates": ["warn"],
		"import/namespace": ["error"],
		"import/default": ["error"],
		"@typescript-eslint/no-extra-non-null-assertion": ["error"],
		"@typescript-eslint/no-non-null-asserted-optional-chain": ["error"],
		"@typescript-eslint/prefer-as-const": ["error"],
		"no-restricted-globals": ["error", "$"],
		"no-restricted-imports": ["error", "vue/types/umd"],
		"vue/multi-word-component-names": ["off"],
		"@typescript-eslint/no-base-to-string": ["error"],
		"@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
		"vue/return-in-computed-property": ["off"],
		"@typescript-eslint/no-floating-promises": ["error"],

		"constructor-super": ["error"],
		"for-direction": ["error"],
		"getter-return": ["error"],
		"no-async-promise-executor": ["error"],
		"no-case-declarations": ["error"],
		"no-class-assign": ["error"],
		"no-compare-neg-zero": ["error"],
		"no-const-assign": ["error"],
		"no-constant-condition": ["error"],
		"no-control-regex": ["error"],
		"no-debugger": ["error"],
		"no-delete-var": ["error"],
		"no-dupe-args": ["error"],
		"no-dupe-class-members": ["error"],
		"no-dupe-else-if": ["error"],
		"no-dupe-keys": ["error"],
		"no-duplicate-case": ["error"],
		"no-empty": ["error"],
		"no-empty-character-class": ["error"],
		"no-empty-pattern": ["error"],
		"no-ex-assign": ["error"],
		"no-extra-boolean-cast": ["error"],
		"no-fallthrough": ["error"],
		"no-func-assign": ["error"],
		"no-global-assign": ["error"],
		"no-import-assign": ["error"],
		"no-inner-declarations": ["error"],
		"no-invalid-regexp": ["error"],
		"no-irregular-whitespace": ["error"],
		"no-misleading-character-class": ["error"],
		"no-mixed-spaces-and-tabs": ["error"],
		"no-new-symbol": ["error"],
		"no-obj-calls": ["error"],
		"no-octal": ["error"],
		"no-prototype-builtins": ["error"],
		"no-regex-spaces": ["error"],
		"no-self-assign": ["error"],
		"no-setter-return": ["error"],
		"no-shadow-restricted-names": ["error"],
		"no-sparse-arrays": ["error"],
		"no-this-before-super": ["error"],
		"no-unexpected-multiline": ["error"],
		"no-unreachable": ["error"],
		"no-unsafe-finally": ["error"],
		"no-unsafe-negation": ["error"],
		"no-unused-labels": ["error"],
		"no-useless-catch": ["error"],
		"no-useless-escape": ["error"],
		"no-with": ["error"],
		"require-yield": ["error"],
		"use-isnan": ["error"],
		"valid-typeof": ["error"]
	},
	"settings": {
		"import/resolver": {
			"typescript": {
				"project": ["tsconfig.json", "*/tsconfig.json"],
			}
		},
	}
};