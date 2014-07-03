module.exports = function ( grunt ) {

    grunt.initConfig({

        build_dir: 'build',
        compile_dir: 'bin',
        src_dir: 'src',
        vendor_dir: 'vendor',

        app_files: {
            javascript: [ 'src/**/*.js' ],

            app_tpl: [ 'src/app/**/*.tpl.html' ],
            common_tpl: [ 'src/common/**/*.tpl.html' ],

            html: 'src/index.html',
            less: 'src/less/main.less'
        },
        vendor_files: {
            javascript: [
                '<%= vendor_dir %>/jquery/dist/jquery.js',
                '<%= vendor_dir %>/angular/angular.js',
                '<%= vendor_dir %>/angular-bootstrap/ui-bootstrap-tpls.js',
                '<%= vendor_dir %>/angular-ui-router/release/angular-ui-router.js'
            ],
            stylesheets: [
                '<%= vendor_dir %>/bootstrap/dist/css/bootstrap.css'
            ],
            assets: [
                '<%= vendor_dir %>/bootstrap/dist/fonts/glyphicons-halflings-regular.eot',
                '<%= vendor_dir %>/bootstrap/dist/fonts/glyphicons-halflings-regular.svg',
                '<%= vendor_dir %>/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf',
                '<%= vendor_dir %>/bootstrap/dist/fonts/glyphicons-halflings-regular.woff'
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
        
          compile_js: {
            options: {
              banner: '<%= banner %>'
            },
            src: [ 
              '<%= vendor_files.javascript %>', 
              '<%= build_dir %>/src/**/*.js'
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
            }

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
          process: function ( contents, path ) {
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
  
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-html2js');

    grunt.registerTask('default', ['clean', 'copy', 'concat', 'uglify', 'html2js', 'index']);
    grunt.registerTask('build', [
        'clean', 
        'copy:from_src_js_to_build', 
        'copy:from_src_assets_to_build', 
        'copy:from_vendor_css_to_build', 
        'copy:from_vendor_js_to_build', 
        'copy:from_vendor_assets_to_build',
        'concat:build_css', 
        'html2js', 
        'index'
    ]);


 };