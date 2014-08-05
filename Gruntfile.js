'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('asIconPicker.jquery.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        // -- Clean Config ---------------------------------------------------------
        clean: {
            files: ['dist', 'css']
        },

        // -- Clean Config ---------------------------------------------------------
        copy: {
            fontAwesome: {
                files: [{
                    expand: true,
                    cwd: 'bower_components/fontAwesome/fonts/',
                    src: '**',
                    dest: 'demo/fonts/'
                }, {
                    flatten: true,
                    src: 'bower_components/fontAwesome/css/font-awesome.css',
                    dest: 'demo/css/font-awesome.css'
                }]
            },
            jquery_asTooltip: {
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: 'bower_components/jquery-asTooltip/dist',
                    src: 'jquery-asTooltip.min.js',
                    dest: 'demo/js'
                }, {
                    flatten: true,
                    src: 'bower_components/jquery-asTooltip/css/jquery-asTooltip.css',
                    dest: 'demo/css/jquery-asTooltip.css'
                }]
            },
            jquery_asScrollbar: {
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: 'bower_components/jquery-asScrollbar/dist',
                    src: 'jquery-asScrollbar.min.js',
                    dest: 'demo/js'
                }]
            },
            jquery_wheel: {
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: 'bower_components/jquery-wheel/',
                    src: 'jquery.mousewheel.min.js',
                    dest: 'demo/js'
                }]
            }
        },

        // -- Clean Config ---------------------------------------------------------
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['src/<%= pkg.name %>.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },

        // -- Clean Config ---------------------------------------------------------
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },

        // -- Clean Config ---------------------------------------------------------
        jsbeautifier: {
            files: ["src/**/*.js", 'Gruntfile.js'],
            options: {
                "indent_size": 4,
                "indent_char": " ",
                "indent_level": 0,
                "indent_with_tabs": false,
                "preserve_newlines": true,
                "max_preserve_newlines": 10,
                "jslint_happy": false,
                "brace_style": "collapse",
                "keep_array_indentation": false,
                "keep_function_indentation": false,
                "space_before_conditional": true,
                "eval_code": false,
                "indent_case": false,
                "unescape_strings": false
            }
        },

        // -- Clean Config ---------------------------------------------------------
        jshint: {
            gruntfile: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: 'Gruntfile.js'
            },
            src: {
                options: {
                    jshintrc: 'src/.jshintrc'
                },
                src: ['src/**/*.js']
            }
        },

        // -- Clean Config ---------------------------------------------------------
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            src: {
                files: '<%= jshint.src.src %>',
                tasks: ['jshint:src', 'qunit']
            }
        },

        // -- Clean Config ---------------------------------------------------------
        less: {
            dist: {
                files: {
                    'css/asIconPicker.css': 'less/asIconPicker.less'
                }
            }
        },

        // -- replace Config --------------------------------------------------------
        replace: {
            bower: {
                src: ['bower.json'],
                overwrite: true, // overwrite matched source files
                replacements: [{
                    from: /("version": ")([0-9\.]+)(")/g,
                    to: "$1<%= pkg.version %>$3"
                }]
            },
            jquery: {
                src: ['asIconPicker.jquery.json'],
                overwrite: true, // overwrite matched source files
                replacements: [{
                    from: /("version": ")([0-9\.]+)(")/g,
                    to: "$1<%= pkg.version %>$3"
                }]
            }
        }
    });

    // Load npm plugins to provide necessary tasks.
    require('load-grunt-tasks')(grunt, {
        pattern: ['grunt-*']
    });

    // Default task.
    grunt.registerTask('default', ['js', 'dist', 'css']);

    grunt.registerTask('dist', ['clean', 'concat', 'uglify']);
    grunt.registerTask('css', ['less']);
    grunt.registerTask('version', [
        'replace:bower',
        'replace:jquery'
    ]);
    grunt.registerTask('js', ['jshint', 'jsbeautifier']);
};
