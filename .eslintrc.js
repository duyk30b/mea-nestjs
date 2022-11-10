module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		tsconfigRootDir: __dirname,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint/eslint-plugin'],
	extends: ['plugin:@typescript-eslint/recommended'],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	ignorePatterns: ['dist/*'],
	rules: {
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'no-console': 0,
		'no-tabs': 0,                                                             // không cho sử dụng tab
		'no-param-reassign': 0,                                                   // sửa params của function sẽ lỗi
		'no-unused-vars': 0,                                                      // khai báo biến mà không sử dụng
		'no-underscore-dangle': 0,                                                // dùng dấu gạch dưới _
		'no-multi-spaces': [1, { ignoreEOLComments: true }],
		'prefer-template': 0,                                                     // Bắt buộc dùng template string khi cộng chuỗi, vcc
		'no-multiple-empty-lines': [1, { max: 1, maxEOF: 0 }],                    // Số dòng trống tối đa
		'max-len': [
			1, {
				code: 160,
				ignoreComments: true,
				ignoreUrls: true,
				ignoreStrings: true,
			},
		],
		'indent': [1, 'tab', { ignoredNodes: ['PropertyDefinition'] }],
		'semi': [1, 'never'],                                                     // dấu ; cuối dòng
		'quotes': [1, 'single', { allowTemplateLiterals: false }],
		'quote-props': [1, 'consistent-as-needed'],                               // dấu quote ở key của object -> dùng 1 cách nhất quán
		'arrow-parens': 1,                                                        // bắt buộc (a)=>{} thay vì a=>{}
		'@typescript-eslint/no-unused-vars': 0,
		'comma-dangle': [
			1, {
				arrays: 'always-multiline',
				objects: 'always-multiline',
				imports: 'always-multiline',
				exports: 'always-multiline',
				// functions: 'always-multiline',
			},
		],
		'comma-spacing': [1, { before: false, after: true }],                     // space trước và sau dấu ,
		'comma-style': [1, 'last'],
		'key-spacing': [1, { mode: 'strict' }],                                   // space trước và sau dấu : trong object
		'block-spacing': [1, 'always'],                                           // space sau {, eg: {return} => { return }
		'computed-property-spacing': [1, 'never'],                                // space trong property, eg: abc[ 'x'] => abc['x']
		'spaced-comment': [1, 'always'],                                          // space khi comment, eg: //abc => // abc
		'object-curly-spacing': [1, 'always'],                                    // space trong object, eg: {a:2} => { a:2 }
		'object-curly-newline': [1, { multiline: true }],                         // quy tắc xuống dòng của { và }
		'object-property-newline': [1, { allowAllPropertiesOnSameLine: true }],   // quy tắc xuống dòng của property
		'object-shorthand': [1, 'always'],
		'array-bracket-spacing': [1, 'never'],                                    // space trong array, eg: [ 1,2, 3 ] => [1,2, 3] 
		'array-bracket-newline': [1, { multiline: true }],                        // quy tắc xuống dòng với dấu [ và ] trong mảng
		'array-element-newline': [1, 'consistent'],                               // quy tắc xuống dòng với các item trong mảng
		'operator-linebreak': [1, 'before'],                                      // dấu ||, ?, +, = ở đầu dòng
		'padded-blocks': [1, { blocks: 'never', classes: 'never' }],              // Dòng trống sau { và trước }
		'padding-line-between-statements': [                                      // quy tắc cách 1 dòng
			1,
			{ blankLine: 'always', prev: '*', next: ['class', 'function', 'export'] },
			{ blankLine: 'always', prev: ['import'], next: '*' },
			{ blankLine: 'never', prev: ['import'], next: ['import'] },
			{ blankLine: 'any', prev: ['export'], next: ['export'] },
		],
		'lines-between-class-members': [1, 'always', { exceptAfterSingleLine: true }], // Dòng trống giữa các properties trong Class
		'import/prefer-default-export': 0,                                        // nếu export 1 biến thì mặc định phải là default
		'function-paren-newline': [1, 'multiline'],                               // quy tắc xuống dòng của dấu ( và )
		'function-call-argument-newline': [1, 'consistent'],                      // quy tắc xuống dòng của các argument
		'nonblock-statement-body-position': [1, 'beside'],                        // không cho xuống dòng với if else không có {}
		'no-useless-escape': 1,                                                   // không cho viết ký tự bình thường thêm \ như "\a" -> "a"
		'prefer-destructuring': [1, { object: true, array: true }],               // Bắt buộc dùng destructuring
	},
}
