// eslint-disable-next-line no-undef
module.exports = {
	extends: 'eslint:recommended',
	rules: {
		// enable additional rules
		indent: ['error', 'tab'],
		'linebreak-style': ['error', 'unix'],
		quotes: ['error', 'single'],
		semi: ['error', 'always'],

		// override configuration set by extending "eslint:recommended"
		'no-empty': 'warn',
		'no-cond-assign': ['error', 'always'],

		// disable rules from base configurations
		'for-direction': 'off',
	},
	env: {
		es6: true,
		node: true,
	},
	parser: 'babel-eslint',
	parserOptions: {
		ecmaVersion: 2017,
	},
};
