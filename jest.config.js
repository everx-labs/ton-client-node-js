module.exports = {
	moduleFileExtensions: [
		'js',
	],
	transform: {
		'^.+\\.js$': 'babel-jest',
	},
	testPathIgnorePatterns: [
		"<rootDir>/node_modules/",
	],
};
