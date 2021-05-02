/*
This file in the main entry point for defining grunt tasks and using grunt plugins.
Click here to learn more. https://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409
*/
module.exports = function (grunt) {
	grunt.initConfig({
		terser: {
			options: {
				ecma: '2016',
				mangle: false
			},
			main: {
				files: {
					"scripts/main.min.js": ['scripts/main.js']
				}
			},
		},
		watch: {
			files: ["scripts/main.js"],
			tasks: ["terser"]
		}
});

	grunt.loadNpmTasks('grunt-terser');
	grunt.loadNpmTasks('grunt-contrib-watch');
};