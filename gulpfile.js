var gulp = require('gulp');
var install = require('gulp-install');
var ts = require('gulp-typescript');
var merge = require('merge2');
var nodemon = require('gulp-nodemon');
var gutil = require("gulp-util");
var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var http = require('http');
var httpProxy = require('http-proxy');
var webpackConfig = require("./webpack.config.js");

var tsServerProject = ts.createProject('tsconfig.json', {
  typescript: require('typescript')
});

var tsClientProject = ts.createProject('tsconfig.json', {
  typescript: require('typescript')
});

var tsCommonProject = ts.createProject('tsconfig.json', {
  typescript: require('typescript')
});

gulp.task('install', () => {
  return gulp.src('package.json')
    .pipe(install());
});

gulp.task('compile-server', () => {
  var tsResult = gulp.src([
    'src/server/**/*.ts',
    'node_modules/angular2/typings/browser.d.ts',
    'typings/**/*.d.ts'
  ]).pipe(ts(tsServerProject));

  return merge([ // Merge the two output streams, so this task is finished when the IO of both operations are done.
    tsResult.js.pipe(gulp.dest('dist/js'))
  ]);
});

gulp.task('compile-client', () => {
  var tsResult = gulp.src([
    'src/client/**/*.ts',
    'src/client/**/*.tsx',
    'node_modules/angular2/typings/browser.d.ts',
    'typings/**/*.d.ts'
  ]).pipe(ts(tsClientProject));

  return merge([ // Merge the two output streams, so this task is finished when the IO of both operations are done.
    tsResult.js.pipe(gulp.dest('dist/js/client'))
  ]);
});

gulp.task('compile-common', () => {
  var tsResult = gulp.src([
    'src/**/*.ts',
    '!src/client/**/*',
    '!src/server/**/*',
    'node_modules/angular2/typings/browser.d.ts',
    'typings/**/*.d.ts'
  ]).pipe(ts(tsCommonProject));

  return merge([ // Merge the two output streams, so this task is finished when the IO of both operations are done.
    tsResult.js.pipe(gulp.dest('dist/js'))
  ]);
});

gulp.task('run-server', function() {
  nodemon({
    script: 'dist/js/server/index.js',
    watch: 'dist/js/server',
    ext: 'js', 
    env: { 'NODE_ENV': 'development' }
  })
});

// Build and watch cycle (another option for development)
// Advantage: No server required, can run app from filesystem
// Disadvantage: Requests are not blocked until bundle is available,
//               can serve an old app on refresh
gulp.task("build-dev", ["webpack:build-dev"], function() {
  gulp.watch(["app/**/*"], ["webpack:build-dev"]);
});

// Production build
gulp.task("build", ["webpack:build"]);

gulp.task("webpack:build", function(callback) {
  // modify some webpack config options
  var myConfig = Object.create(webpackConfig);
  myConfig.plugins = myConfig.plugins.concat(
    new webpack.DefinePlugin({
      "process.env": {
        // This has effect on the react lib size
        "NODE_ENV": JSON.stringify("production")
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin()
  );

  // run webpack
  webpack(myConfig, function(err, stats) {
    if(err) throw new gutil.PluginError("webpack:build", err);
    gutil.log("[webpack:build]", stats.toString({
      colors: true
    }));
    callback();
  });
});

// modify some webpack config options
var myDevConfig = Object.create(webpackConfig);
myDevConfig.devtool = "sourcemap";
myDevConfig.debug = true;

// create a single instance of the compiler to allow caching
var devCompiler = webpack(myDevConfig);

gulp.task("webpack:build-dev", function(callback) {
  // run webpack
  devCompiler.run(function(err, stats) {
    if(err) throw new gutil.PluginError("webpack:build-dev", err);
    gutil.log("[webpack:build-dev]", stats.toString({
      colors: true
    }));
    callback();
  });
});

gulp.task("webpack-dev-server", function() {
  var myConfig = Object.create(webpackConfig);
  myConfig.devtool = "eval";
  myConfig.debug = true;
  myConfig.entry.main.unshift("webpack-dev-server/client?http://localhost:8080/", "webpack/hot/dev-server");
  myConfig.plugins = [
    new webpack.HotModuleReplacementPlugin()
  ];
  
  new WebpackDevServer(webpack(myConfig), {
    publicPath: "/" + myConfig.output.publicPath,
    stats: 'errors-only',
    hot: true
  }).listen(8080, "localhost", function(err) {
    if(err) throw new gutil.PluginError("webpack-dev-server", err);
    gutil.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html");
  });
});

gulp.task('wcompile', ['compile-server', 'compile-client', 'compile-common'], () => {
  gulp.watch(['src/**/*', '!src/client/**/*'], ['compile-server']);
  gulp.watch(['src/**/*', '!src/server/**/*'], ['compile-client']);
  gulp.watch(['src/**/*', '!src/server/**/*', '!src/client/**/*'], ['compile-common']);
});

gulp.task('default', ['wcompile'], () => {
  gulp.start('webpack-dev-server');
  gulp.start('run-server');

  var clientProxy = new httpProxy.createProxyServer({
    target: {
      host: 'localhost',
      port: 8080
    }
  });

  var serverProxy = new httpProxy.createProxyServer({
    target: {
      host: 'localhost',
      port: 8001
    }
  });

  var proxyServer = http.createServer(function (req, res) {
    clientProxy.web(req, res);
  });

  proxyServer.on('upgrade', function (req, socket, head) {
    serverProxy.ws(req, socket, head);
  });

  proxyServer.listen(3000);
});