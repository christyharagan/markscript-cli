#!/usr/bin/env node
var path = require('path');
var fs = require('fs');
var core = require('markscript-core');
var p = require('typescript-package');
var Yargs = require('yargs');
var ts = require('typescript');
var markscript_init_1 = require('markscript-init');
var cwd = process.cwd();
var markscriptFile;
var isTypeScript;
if (fs.existsSync(path.join(cwd, 'markscriptfile.ts'))) {
    markscriptFile = path.join(cwd, 'markscriptfile.ts');
    isTypeScript = true;
}
else if (fs.existsSync(path.join(cwd, 'markscriptfile.js'))) {
    markscriptFile = path.join(cwd, 'markscriptfile.js');
    isTypeScript = false;
}
var yargs = Yargs
    .usage('Build your MarkScript project.\nUsage: markscript <task>')
    .demand(1)
    .command('init', 'Initialise a new MarkScript project')
    .help('help')
    .version(p.getPackageJson(cwd).version);
var build;
if (markscriptFile) {
    if (isTypeScript) {
        var options = {
            module: 1 /* CommonJS */,
            target: 1 /* ES5 */,
            moduleResolution: 1 /* Classic */
        };
        function req(module, filename) {
            module._compile(ts.transpile(fs.readFileSync(filename).toString(), options), filename);
        }
        require.extensions['.ts'] = req;
    }
    var buildFile = require(markscriptFile).build;
    if (!buildFile) {
        console.error('markscriptfile should export a const value called "build" of type MarkScript.Build');
        process.exit(1);
    }
    var plugins = [core.coreBuildPlugin];
    if (buildFile.plugins) {
        plugins = plugins.concat(buildFile.plugins);
    }
    var pkgDir = buildFile.pkgDir || cwd;
    process.chdir(pkgDir);
    build = new core.Build({
        buildConfig: buildFile.buildConfig,
        plugins: plugins,
        pkgDir: pkgDir,
        buildModelPersistanceFolder: buildFile.buildModelPersistanceFolder,
        isTypeScript: isTypeScript,
        runtime: buildFile.runtime,
        tasks: buildFile.tasks,
        buildModelPersistance: 1 /* NO_SOURCE */
    });
    Object.keys(build.tasks).forEach(function (taskName) {
        yargs.command(taskName, build.tasks[taskName].description);
    });
}
var argv = yargs.argv;
var taskName = argv._[0];
var taskPromise;
if (taskName === 'init') {
    taskPromise = markscript_init_1.init();
}
else {
    taskPromise = build.runTasks(taskName);
}
taskPromise.catch(function (e) {
    if (e.stack) {
        console.error(e.stack);
    }
    else {
        console.error(e);
    }
    process.exit(1);
}).then(function () {
    process.exit(0);
});
