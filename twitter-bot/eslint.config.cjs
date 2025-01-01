// eslint.config.cjs

module.exports = [
	{
		languageOptions: {
			parserOptions: {
				ecmaVersion: 13,
				impliedStrict: true,
			}
		},
		rules: {
			"no-trailing-spaces": "error",
			"linebreak-style": ["error", "unix"],
			"quotes": ["error", "double"],
			"one-var": ["error", "never"],
			"brace-style": ["error", "allman", { allowSingleLine: true }],
			"space-before-blocks": "warn",
			"func-call-spacing": "error",
			"space-before-function-paren": "error",
			"space-in-parens": ["error", "always", { exceptions: ["{}"] }],
			"keyword-spacing": "error",
			"comma-spacing": "error",
			"space-unary-ops": "error",
			"block-spacing": "error",
			"arrow-spacing": "error",
			"key-spacing": "error",
			"comma-style": "error",
			"space-infix-ops": "error",
			"array-bracket-spacing": "error",
			"object-curly-spacing": ["error", "always"],
			"no-multi-spaces": "error",
			"operator-linebreak": "error",
			"function-paren-newline": "warn",
			"arrow-body-style": ["error", "always"],
			"no-template-curly-in-string": "error",
			"no-new-object": "error",
			"no-extra-parens": ["error", "all", { conditionalAssign: false }],
			"no-empty-function": "error",
			"no-empty": ["warn", { allowEmptyCatch: true }],
			"no-eq-null": "error",
			"no-extra-bind": "error",
			"no-self-compare": "error",
			"no-useless-call": "error",
			"no-undefined": "error",
			"no-array-constructor": "error",
			"prefer-destructuring": ["error",
				{
					VariableDeclarator: { array: false, object: true }, AssignmentExpression: { array: false, object: false } }, { enforceForRenamedProperties: false
				}
			],
			"object-shorthand": "warn",
			"prefer-spread": "warn",
			"prefer-template": "warn",
			"no-loop-func": "warn",
			"prefer-rest-params": "warn",
			"no-new-func": "warn",
			"no-unneeded-ternary": "warn",
			"no-process-exit": "off",
			"require-await": "warn",
			"indent": ["error", "tab", { MemberExpression: 0 }],
			"no-tabs": 0,
		},
	},
];
