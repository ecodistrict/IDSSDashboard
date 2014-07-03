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
        }

    });
  
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.registerTask('default', ['copy', 'concat', 'uglify', 'html2js']);

 };