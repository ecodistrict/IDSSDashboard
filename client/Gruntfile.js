// Lots of ideas taken from
// https://github.com/ngbp/ngbp/blob/v0.3.2-release/Gruntfile.js
// Copyright (c) 2013 Josh David Miller <josh@joshdmiller.com>
var mongoose = require('mongoose');

module.exports = function ( grunt ) {

    require('load-grunt-tasks')(grunt);

    require('time-grunt')(grunt);

    grunt.initConfig({

        build_dir: 'build',
        compile_dir: 'dist',
        src_dir: 'src',
        vendor_dir: 'vendor',

        app_files: {
            javascript: [ 'src/app/**/*.js', 'src/common/**/*.js', '!src/app/**/*.spec.js', '!src/app/**/*.e2e.js', '!src/common/**/*.spec.js', 'src/assets/**/*.js' ],

            app_tpl: [ 'src/app/**/*.tpl.html' ],
            common_tpl: [ 'src/common/**/*.tpl.html' ],

            html: 'src/index.html',
            less: 'src/less/main.less'
        },
        vendor_files: {
            javascript: [
                '<%= vendor_dir %>/jquery/dist/jquery.js',
                '<%= vendor_dir %>/angular/angular.js',
                '<%= vendor_dir %>/angular-socket-io/socket.js',
                '<%= vendor_dir %>/underscore/underscore.js',
                '<%= vendor_dir %>/angular-http-auth/src/http-auth-interceptor.js',
                '<%= vendor_dir %>/bootstrap/dist/js/bootstrap.js',
                '<%= vendor_dir %>/angular-bootstrap/ui-bootstrap-tpls.js',
                '<%= vendor_dir %>/angular-ui-router/release/angular-ui-router.js',
                '<%= vendor_dir %>/angular-file-upload/angular-file-upload.js',
                '<%= vendor_dir %>/d3/d3.js',
                '<%= vendor_dir %>/crossfilter/crossfilter.js',
                '<%= vendor_dir %>/dcjs/dc.js',
                '<%= vendor_dir %>/angular-flash/dist/angular-flash.js',
                '<%= vendor_dir %>/leaflet/dist/leaflet.js'
            ],
            stylesheets: [
                '<%= vendor_dir %>/dcjs/dc.css',
                '<%= vendor_dir %>/leaflet/dist/leaflet.css'
            ],  
            assets: [
                '<%= vendor_dir %>/bootstrap/dist/fonts/glyphicons-halflings-regular.eot',
                '<%= vendor_dir %>/bootstrap/dist/fonts/glyphicons-halflings-regular.svg',
                '<%= vendor_dir %>/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf',
                '<%= vendor_dir %>/bootstrap/dist/fonts/glyphicons-halflings-regular.woff'
            ]
        },

        // vendor files but only for testing
        vendor_files_test: {
          javascript: [
            '<%= vendor_dir %>/angular-mocks/angular-mocks.js'
          ]
        },

        pkg: grunt.file.readJSON("package.json"),

        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',

        clean: [ 
          '<%= build_dir %>', 
          '<%= compile_dir %>'
        ],

        copy: {
            from_src_assets_to_build: {
                files: [
                  { 
                    src: [ '**' ],
                    dest: '<%= build_dir %>/assets/',
                    cwd: 'src/assets',
                    expand: true
                  }
               ]   
            },
            from_vendor_assets_to_build: {
                files: [
                  { 
                    src: [ '<%= vendor_files.assets %>' ],
                    dest: '<%= build_dir %>/assets/',
                    cwd: '.',
                    expand: true,
                    flatten: true // should we flatten?
                  }
               ]   
            },
            from_src_js_to_build: {
                files: [
                  {
                    src: [ '<%= app_files.javascript %>' ],
                    dest: '<%= build_dir %>/',
                    cwd: '.',
                    expand: true
                  }
                ]
            },
            from_vendor_js_to_build: {
                files: [
                  {
                    src: [ '<%= vendor_files.javascript %>' ],
                    dest: '<%= build_dir %>/',
                    cwd: '.',
                    expand: true
                  }
                ]
            },
            from_vendor_css_to_build: {
                files: [
                  {
                    src: [ '<%= vendor_files.stylesheets %>' ],
                    dest: '<%= build_dir %>/',
                    cwd: '.',
                    expand: true
                  }
                ]
            },
            from_build_assets_to_compile: {
                files: [
                  {
                    src: [ '**' ],
                    dest: '<%= compile_dir %>/assets',
                    cwd: '<%= build_dir %>/assets',
                    expand: true
                  }
                ]
            }
        },

        concat: {
          
          build_css: {
            src: [
              '<%= vendor_files.stylesheets %>',
              '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
            ],
            dest: '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
          },

          compile_css: {
            src: [
              '<%= vendor_files.stylesheets %>',
              '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
            ],
            dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
          },
        
          compile_js: {
            options: {
              banner: '<%= banner %>'
            },
            src: [ 
              '<%= vendor_files.javascript %>', 
              '<%= build_dir %>/src/**/*.js',
              '<%= build_dir %>/templates-app.js',
              '<%= build_dir %>/templates-common.js'
            ],
            dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.js'
          }
        },

        uglify: {
            options: {
                banner: '<%= banner %>'
            }, 
            build: {
                files: {
                    '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.js': '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.js'
                }
            }
        },

        html2js: {
            app: {
                options: {
                    base: 'src/app'
                },
                src: [ '<%= app_files.app_tpl %>' ],
                dest: '<%= build_dir %>/templates-app.js'
            },
            common: {
                options: {
                    base: 'src/common'
                },
                src: [ '<%= app_files.common_tpl %>' ],
                dest: '<%= build_dir %>/templates-common.js'
            }
        },

        less: {
            build: {
                files: {
                    '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css': '<%= app_files.less %>'
                }
            }, 
            compile: {
                options: {
                    cleancss: true,
                    compress: true
                },
                files: {
                    '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css': '<%= app_files.less %>'
                }
            }
        },

        index: {

            build: {
                dir: '<%= build_dir %>',
                src: [
                    '<%= vendor_files.javascript %>',
                    '<%= build_dir %>/src/**/*.js',
                    '<%= html2js.common.dest %>',
                    '<%= html2js.app.dest %>',
                    '<%= vendor_files.stylesheets %>',
                    '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
                ]
            }, 

            compile: {
                dir: '<%= compile_dir %>',
                src: [
                    '<%= concat.compile_js.dest %>',
                    '<%= vendor_files.stylesheets %>',
                    '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
                ]
            }

        },
        // se docs for jshint config http://www.jshint.com/docs/options/
        jshint:{
            files:['gruntFile.js', '<%= app_files.javascript %>'],
            options:{
                boss:true,
                curly:true,
                eqeqeq:true,
                eqnull:true,
                ignores: ['src/assets/ol3/*.js'],
                immed:true,
                latedef:true,
                newcap:true,
                noarg:true,
                sub:true
            }
        },

        // karmaconfig: {
        //   unit: {
        //     dir: '<%= build_dir %>',
        //     src: [ 
        //       '<%= vendor_files.javascript %>',
        //       '<%= vendor_files_test.javascript %>',
        //       '<%= html2js.app.dest %>',
        //       '<%= html2js.common.dest %>',
        //       '<%= html2js.foundation.dest %>'
        //     ]
        //   }
        // },

        karma: {
          unit: {
            configFile: 'karma.conf.js',
            singleRun: true
          },
        },

        protractor: {
          options: {
            keepAlive: true,
            configFile: "protractor.conf.js"
          },
          run: {}
        }

    });

    
    function filterForJS ( files ) {
        return files.filter( function ( file ) {
            return file.match( /\.js$/ );
        });
    }


    function filterForCSS ( files ) {
        return files.filter( function ( file ) {
            return file.match( /\.css$/ );
        });
    }

    grunt.registerMultiTask( 'index', 'Process index.html template', function () {
        var dirRE = new RegExp( '^('+grunt.config('build_dir')+'|'+grunt.config('compile_dir')+')\/', 'g' );
        var jsFiles = filterForJS( this.filesSrc ).map( function ( file ) {
          return file.replace( dirRE, '' );
        });
        var cssFiles = filterForCSS( this.filesSrc ).map( function ( file ) {
          return file.replace( dirRE, '' );
        });

        grunt.file.copy('src/index.html', this.data.dir + '/index.html', { 
          process: function ( contents ) {
            return grunt.template.process( contents, {
              data: {
                scripts: jsFiles,
                styles: cssFiles,
                version: grunt.config( 'pkg.version' )
              }
            });
          }
        });
    });

    // use karma-unit.tpl.js to add karma-unit.js to build dir with dependencies and tests
    // TODO: use this to set files for testing
    // grunt.registerMultiTask( 'karmaconfig', 'Process karma config templates', function () {
    //   var jsFiles = filterForJS( this.filesSrc );
      
    //   grunt.file.copy( 'karma.conf.js', grunt.config( 'build_dir' ) + '/karma-unit.js', { 
    //     process: function ( contents, path ) {
    //       return grunt.template.process( contents, {
    //         data: {
    //           scripts: jsFiles
    //         }
    //       });
    //     }
    //   });
    // });

    grunt.registerTask('drop_test_db', 'drop test database', function() {
        // // async mode
        // var done = this.async();
        var connection = mongoose.createConnection('mongodb://localhost:27017/idssdashboard');

        connection.on('open', function () { 
          connection.db.dropDatabase(function(err) {
            if(err) {
              console.log(err);
            } else {
              console.log('Successfully dropped db');
            }
            connection.close();
          });
        });
    });

    grunt.registerTask('default', ['build', 'compile']);
    grunt.registerTask('build', [
        'jshint',
        'clean', 
        'html2js', 
        'less:build', 
        'copy:from_src_js_to_build', 
        'copy:from_src_assets_to_build', 
        'copy:from_vendor_css_to_build', 
        'copy:from_vendor_js_to_build', 
        'copy:from_vendor_assets_to_build',
        'concat:build_css', 
        'index:build'
    ]);
    grunt.registerTask( 'compile', [
        'less:compile', 
        'copy:from_build_assets_to_compile', 
        'concat:compile_js', 
        'concat:compile_css',
        'uglify', 
        'index:compile'
    ]);
    grunt.registerTask('test', [
        'drop_test_db',
        'karma',
        'protractor:run'
    ]);

 };