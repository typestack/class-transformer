import "es6-shim";
import {Gulpclass, Task, SequenceTask, MergedTask} from "gulpclass";

const gulp = require("gulp");
const del = require("del");
const shell = require("gulp-shell");
const replace = require("gulp-replace");
const mocha = require("gulp-mocha");
const chai = require("chai");
const tslint = require("gulp-tslint");
const stylish = require("tslint-stylish");
const ts = require("gulp-typescript");
const sourcemaps = require("gulp-sourcemaps");
const istanbul = require("gulp-istanbul");
const remapIstanbul = require("remap-istanbul/lib/gulpRemapIstanbul");
const rename = require("gulp-rename");
const file = require("gulp-file");
const uglify = require("gulp-uglify");

@Gulpclass()
export class Gulpfile {

    // -------------------------------------------------------------------------
    // General tasks
    // -------------------------------------------------------------------------

    /**
     * Cleans build folder.
     */
    @Task()
    clean(cb: Function) {
        return del(["./build/**"], cb);
    }

    /**
     * Runs typescript files compilation.
     */
    @Task()
    compile() {
        return gulp.src("*.js", { read: false })
            .pipe(shell(["tsc"]));
    }

    // -------------------------------------------------------------------------
    // Bundling task
    // -------------------------------------------------------------------------

    /**
     * Compiles and compiles bundles.
     */
    @MergedTask()
    compileBundles() {
        const amdTsProject = ts.createProject("tsconfig.json", {
            module: "amd",
            outFile: "class-transformer.amd.js",
            typescript: require("typescript")
        });
        const systemTsProject = ts.createProject("tsconfig.json", {
            module: "system",
            outFile: "class-transformer.system.js",
            typescript: require("typescript")
        });
        const amdPureTsProject = ts.createProject("tsconfig.json", {
            module: "amd",
            outFile: "class-transformer.pure.amd.js",
            noEmitHelpers: true,
            noImplicitUseStrict: true,
            typescript: require("typescript")
        });
        const systemPureTsProject = ts.createProject("tsconfig.json", {
            module: "system",
            outFile: "class-transformer.pure.system.js",
            noEmitHelpers: true,
            noImplicitUseStrict: true,
            typescript: require("typescript")
        });

        return [
            gulp.src("build/bundle/**/*.ts")
                .pipe(amdTsProject()).js
                .pipe(gulp.dest("build/package")),

            gulp.src("build/bundle/**/*.ts")
                .pipe(systemTsProject()).js
                .pipe(gulp.dest("build/package")),

            gulp.src("build/bundle/**/*.ts")
                .pipe(amdPureTsProject()).js
                .pipe(gulp.dest("build/package")),

            gulp.src("build/bundle/**/*.ts")
                .pipe(systemPureTsProject()).js
                .pipe(gulp.dest("build/package"))
        ];
    }

    /**
     * Copies all source files into destination folder in a correct structure to build bundles.
     */
    @Task()
    bundleCopySources() {
        return gulp.src(["./src/**/*.ts"])
            .pipe(gulp.dest("./build/bundle/class-transformer"));
    }

    /**
     * Creates special main file for bundle build.
     */
    @Task()
    bundleCopyMainFile() {
        return gulp.src("./package.json", { read: false })
            .pipe(file("class-transformer.ts", `export * from "./class-transformer/index";`))
            .pipe(gulp.dest("./build/bundle"));
    }

    /**
     * Uglifys bundles.
     */
    @MergedTask()
    uglify() {
        return [
            gulp.src(`./build/package/class-transformer.pure.amd.js`)
                .pipe(uglify())
                .pipe(rename(`class-transformer.pure.amd.min.js`))
                .pipe(gulp.dest("./build/package")),

            gulp.src(`./build/package/class-transformer.pure.system.js`)
                .pipe(uglify())
                .pipe(rename(`class-transformer.pure.system.min.js`))
                .pipe(gulp.dest("./build/package")),

            gulp.src(`./build/package/class-transformer.amd.js`)
                .pipe(uglify())
                .pipe(rename(`class-transformer.amd.min.js`))
                .pipe(gulp.dest("./build/package")),

            gulp.src(`./build/package/class-transformer.system.js`)
                .pipe(uglify())
                .pipe(rename(`class-transformer.system.min.js`))
                .pipe(gulp.dest("./build/package")),
        ];
    }
    
    // -------------------------------------------------------------------------
    // Packaging and Publishing tasks
    // -------------------------------------------------------------------------

    /**
     * Publishes a package to npm from ./build/package directory.
     */
    @Task()
    npmPublish() {
        return gulp.src("*.js", { read: false })
            .pipe(shell([
                "cd ./build/package && npm publish"
            ]));
    }

    /**
     * Copies all sources to the package directory.
     */
    @MergedTask()
    packageCompile() {
        const tsProject = ts.createProject("tsconfig.json");
        const tsResult = gulp.src(["./src/**/*.ts", "./typings/**/*.ts"])
            .pipe(sourcemaps.init())
            .pipe(tsProject());

        return [
            tsResult.dts.pipe(gulp.dest("./build/package")),
            tsResult.js
                .pipe(sourcemaps.write(".", { sourceRoot: "", includeContent: true }))
                .pipe(gulp.dest("./build/package"))
        ];
    }

    /**
     * Moves all compiled files to the final package directory.
     */
    @Task()
    packageMoveCompiledFiles() {
        return gulp.src("./build/package/src/**/*")
            .pipe(gulp.dest("./build/package"));
    }

    /**
     * Moves all compiled files to the final package directory.
     */
    @Task()
    packageClearCompileDirectory(cb: Function) {
        return del([
            "./build/package/src/**"
        ], cb);
    }

    /**
     * Change the "private" state of the packaged package.json file to public.
     */
    @Task()
    packagePreparePackageFile() {
        return gulp.src("./package.json")
            .pipe(replace("\"private\": true,", "\"private\": false,"))
            .pipe(gulp.dest("./build/package"));
    }

    /**
     * This task will replace all typescript code blocks in the README (since npm does not support typescript syntax
     * highlighting) and copy this README file into the package folder.
     */
    @Task()
    packageReadmeFile() {
        return gulp.src("./README.md")
            .pipe(replace(/```typescript([\s\S]*?)```/g, "```javascript$1```"))
            .pipe(gulp.dest("./build/package"));
    }

    /**
     * Creates a package that can be published to npm.
     */
    @SequenceTask()
    package() {
        return [
            "clean",
            ["bundleCopySources", "bundleCopyMainFile"],
            ["compile", "compileBundles"],
            ["uglify"],
            "packageCompile",
            "packageMoveCompiledFiles",
            "packageClearCompileDirectory",
            ["packagePreparePackageFile", "packageReadmeFile"]
        ];
    }

    /**
     * Creates a package and publishes it to npm.
     */
    @SequenceTask()
    publish() {
        return ["package", "npmPublish"];
    }

    // -------------------------------------------------------------------------
    // Run tests tasks
    // -------------------------------------------------------------------------

    /**
     * Runs ts linting to validate source code.
     */
    @Task()
    tslint() {
        return gulp.src(["./src/**/*.ts", "./test/**/*.ts", "./sample/**/*.ts"])
            .pipe(tslint())
            .pipe(tslint.report(stylish, {
                emitError: true,
                sort: true,
                bell: true
            }));
    }

    /**
     * Runs before test coverage, required step to perform a test coverage.
     */
    @Task()
    coveragePre() {
        return gulp.src(["./build/es5/src/**/*.js"])
            .pipe(istanbul())
            .pipe(istanbul.hookRequire());
    }

    /**
     * Runs post coverage operations.
     */
    @Task("coveragePost", ["coveragePre"])
    coveragePost() {
        chai.should();
        chai.use(require("sinon-chai"));
        chai.use(require("chai-as-promised"));

        return gulp.src(["./build/es5/test/functional/**/*.js"])
            .pipe(mocha())
            .pipe(istanbul.writeReports());
    }

    @Task()
    coverageRemap() {
        return gulp.src("./coverage/coverage-final.json")
            .pipe(remapIstanbul())
            .pipe(gulp.dest("./coverage"));
    }

    /**
     * Compiles the code and runs tests.
     */
    @SequenceTask()
    tests() {
        return ["compile", "coveragePost", "coverageRemap", "tslint"];
    }

}