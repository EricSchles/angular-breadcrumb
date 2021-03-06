'use strict';

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>\n(function (window, angular, undefined) {\n',
        footer: '})(window, window.angular);\n',
        stripBanners: true
      },
      dist: {
        src: ['src/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      sources: {
        options: {
          jshintrc: 'src/.jshintrc'
        },
        src: ['src/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      sources: {
        files: '<%= jshint.sources.src %>',
        tasks: ['jshint:sources', 'karma']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'karma']
      },
      sample: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        tasks: 'copy:breadcrumb',
        files: [
          'sample/*.{css,js,html}',
          'sample/controllers/*.{css,js,html}',
          'sample/views/*.{css,js,html}',
          'src/*.js'
        ]
      }
    },
    copy: {
      breadcrumb: {
        files: [
          {
            flatten: true,
            expand: true,
            src: [
              'src/angular-breadcrumb.js'
            ],
            dest: 'sample/asset/'
          }
        ]
      },
      asset: {
        files: [
          {
            flatten: true,
            expand: true,
            src: [
              'dist/angular-breadcrumb.js',
              'bower_components/angular/angular.js',
              'bower_components/angular-ui-router/release/angular-ui-router.js',
              'bower_components/angular-ui-bootstrap-bower/ui-bootstrap-tpls.js',
              'bower_components/bootstrap.css/css/bootstrap.css',
              'bower_components/underscore/underscore.js'
            ],
            dest: 'sample/asset/'
          }
        ]
      },
      img: {
        files: [
          {
            flatten: true,
            expand: true,
            src: [
                'bower_components/bootstrap.css/img/glyphicons-halflings.png'
            ],
            dest: 'sample/img/'
          }
        ]
      }
    },
    connect: {
      options: {
        port: 9000,
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, 'sample')
            ];
          }
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= connect.options.port %>/index.html'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-conventional-changelog');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-open');

  // Default task.
  grunt.registerTask('default', ['jshint', 'karma', 'concat', 'uglify']);

  grunt.registerTask('test', ['jshint', 'karma']);

  grunt.registerTask('sample', ['concat', 'copy:asset', 'copy:img', 'connect:livereload', 'open', 'watch']);

};
