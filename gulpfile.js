const { src, dest, series, parallel } = require("gulp");

const del = require("del");
const shell = require("gulp-shell");
const replace = require("gulp-replace");
const mocha = require("gulp-mocha");
const chai = require("chai");
const gulp_tslint = require("gulp-tslint");
const stylish = require("tslint-stylish");
const ts = require("gulp-typescript");
const sourcemaps = require("gulp-sourcemaps");
const istanbul = require("gulp-istanbul");
const remapIstanbul = require("remap-istanbul/lib/gulpRemapIstanbul");
const rename = require("gulp-rename");
const file = require("gulp-file");
const gulp_uglify = require("gulp-uglify");

// -------------------------------------------------------------------------
// General tasks
// -------------------------------------------------------------------------

/**
 * Cleans build forder
 */
function clean() {
    return del(["./build/**"]);
}

/**
 * Runs Typescript files compilation
 */
function compile() {
    return src("*.js", { read: false })
        .pipe(shell(["tsc"]));
}

// -------------------------------------------------------------------------
// Bundling task
// -------------------------------------------------------------------------

function compileBundlesAmd() {
    const amdTsProject = ts.createProject("tsconfig.json", {
        module: "amd",
        outFile: "class-transformer.amd.js",
        typescript: require("typescript")
    });
    return src("build/bundle/**/*.ts")
        .pipe(amdTsProject()).js
        .pipe(dest("build/package"));
}

function compileBundlesSystem() {
    const systemTsProject = ts.createProject("tsconfig.json", {
        module: "system",
        outFile: "class-transformer.system.js",
        typescript: require("typescript")
    });
    return src("build/bundle/**/*.ts")
        .pipe(systemTsProject()).js
        .pipe(dest("build/package"));
}

function compileBundlesAmdPure() {
    const amdPureTsProject = ts.createProject("tsconfig.json", {
        module: "amd",
        outFile: "class-transformer.pure.amd.js",
        noEmitHelpers: true,
        noImplicitUseStrict: true,
        typescript: require("typescript")
    });
    return src("build/bundle/**/*.ts")
        .pipe(amdPureTsProject()).js
        .pipe(dest("build/package"));
}

function compileBundlesSystemPure() {
    const systemPureTsProject = ts.createProject("tsconfig.json", {
        module: "system",
        outFile: "class-transformer.pure.system.js",
        noEmitHelpers: true,
        noImplicitUseStrict: true,
        typescript: require("typescript")
    });
    return src("build/bundle/**/*.ts")
        .pipe(systemPureTsProject()).js
        .pipe(dest("build/package"));
}

/**
 * Compiles and compiles bundles.
 */
const compileBundles = parallel(compileBundlesAmd, compileBundlesSystem, compileBundlesAmdPure, compileBundlesSystemPure);

/**
 * Copies all source files into destination folder in a correct structure to build bundles.
 */
function bundleCopySources() {
    return src(["./src/**/*.ts"])
        .pipe(dest("./build/bundle/class-transformer"));
}

/**
 * Creates special main file for bundle build.
 */
function bundleCopyMainFile() {
    return src("./package.json", { read: false })
        .pipe(file("class-transformer.ts", 'export * from "./class-transformer/index";'))
        .pipe(dest("./build/bundle"));
}

function uglifyAmd() {
    return src(`./build/package/class-transformer.pure.amd.js`)
        .pipe(gulp_uglify())
        .pipe(rename(`class-transformer.pure.amd.min.js`))
        .pipe(dest("./build/package"));
}

function uglifySystem() {
    return src(`./build/package/class-transformer.pure.system.js`)
        .pipe(gulp_uglify())
        .pipe(rename(`class-transformer.pure.system.min.js`))
        .pipe(dest("./build/package"));
}

function uglifyAmdPure() {
    return src(`./build/package/class-transformer.amd.js`)
        .pipe(gulp_uglify())
        .pipe(rename(`class-transformer.amd.min.js`))
        .pipe(dest("./build/package"));
}

function uglifySystemPure() {
    return src(`./build/package/class-transformer.system.js`)
        .pipe(gulp_uglify())
        .pipe(rename(`class-transformer.system.min.js`))
        .pipe(dest("./build/package"));
}

/**
 * Uglifys bundles.
 */
const uglify = parallel(uglifyAmd, uglifySystem, uglifyAmdPure, uglifySystemPure);

// -------------------------------------------------------------------------
// Packaging and Publishing tasks
// -------------------------------------------------------------------------

/**
 * Publishes a package to npm from ./build/package directory.
 */
function npmPublish() {
    return src("*.js", { read: false })
        .pipe(shell([
            "cd ./build/package && npm publish"
        ]));
}

function packageCompileGetCompiled() {
    const tsProject = ts.createProject("tsconfig.json");
    return src(["./src/**/*.ts", "./typings/**/*.ts"])
        .pipe(sourcemaps.init())
        .pipe(tsProject());
}

function packageCompileDts() {
    return packageCompileGetCompiled().dts
        .pipe(dest("./build/package"));
}

function packageCompileJs() {
    return packageCompileGetCompiled().js
        .pipe(sourcemaps.write(".", { sourceRoot: "", includeContent: true }))
        .pipe(dest("./build/package"));
}

/**
 * Copies all sources to the package directory.
 */
const packageCompile = parallel(packageCompileDts, packageCompileJs);

/**
 * Moves all compiled files to the final package directory.
 */
function packageMoveCompiledFiles() {
    return src("./build/package/src/**/*")
        .pipe(dest("./build/package"));
}

/**
 * Moves all compiled files to the final package directory.
 */
function packageClearCompileDirectory() {
    return del(["./build/package/src/**"]);
}

/**
 * Change the "private" state of the packaged package.json file to public.
 */
function packagePreparePackageFile() {
    return src("./package.json")
        .pipe(replace("\"private\": true,", "\"private\": false,"))
        .pipe(dest("./build/package"));
}

/**
 * This task will replace all typescript code blocks in the README (since npm does not support typescript syntax
 * highlighting) and copy this README file into the package folder.
 */
function packageReadmeFile() {
    return src("./README.md")
        .pipe(replace(/```typescript([\s\S]*?)```/g, "```javascript$1```"))
        .pipe(dest("./build/package"));
}

/**
 * Creates a package that can be published to npm.
 */
const package = series(clean,
    parallel(bundleCopySources, bundleCopyMainFile),
    parallel(compile, compileBundles),
    uglify,
    packageCompile,
    packageMoveCompiledFiles,
    packageClearCompileDirectory,
    parallel(packagePreparePackageFile, packageReadmeFile));

/**
 * Creates a package and publishes it to npm.
 */
const publish = series(package, npmPublish);

// -------------------------------------------------------------------------
// Run tests tasks
// -------------------------------------------------------------------------

/**
 * Runs ts linting to validate source code.
 */
function tslint() {
    return src(["./src/**/*.ts", "./test/**/*.ts", "./sample/**/*.ts"])
        .pipe(gulp_tslint())
        .pipe(gulp_tslint.report(stylish, {
            emitError: true,
            sort: true,
            bell: true
        }));
}

/**
 * Runs before test coverage, required step to perform a test coverage.
 */
function coveragePre() {
    return src(["./build/es5/src/**/*.js"])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
}

/**
 * Runs post coverage operations.
 */
function coveragePost() {
    chai.should();
    chai.use(require("sinon-chai"));
    chai.use(require("chai-as-promised"));

    return src(["./build/es5/test/functional/**/*.js"])
        .pipe(mocha())
        .pipe(istanbul.writeReports());
}

const coverageRun = series(coveragePre, coveragePost);

function coverageRemap() {
    return src("./coverage/coverage-final.json")
        .pipe(remapIstanbul())
        .pipe(dest("./coverage"));
}

/**
 * Compiles the code and runs tests.
 */
const tests = series(compile, coverageRun, coverageRemap, tslint);

exports.clean = clean;
exports.compile = compile;
exports.compileBundles = compileBundles;
exports.bundleCopySources = bundleCopySources;
exports.uglify = uglify;
exports.packageCompile = packageCompile;
exports.packageMoveCompiledFiles = packageMoveCompiledFiles;
exports.packageClearCompileDirectory = packageClearCompileDirectory;
exports.packagePreparePackageFile = packagePreparePackageFile;
exports.packageReadmeFile = packageReadmeFile;
exports.package = package;
exports.publish = publish;
exports.tests = tests;
