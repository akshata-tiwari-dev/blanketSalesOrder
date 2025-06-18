const {dest, series, src} = require('gulp');
const ts = require('gulp-typescript');
const del = require('del');

const codeCoverageFolder = 'coverage';
const tsConfigFile = 'tsconfig.json';

function clean() {
    console.log('Running clean');
    const tsProject = ts.createProject(tsConfigFile);
    const tsConfigOutDir = tsProject.config.compilerOptions.outDir;
    return del([codeCoverageFolder, `${tsConfigOutDir}/**`, `!${tsConfigOutDir}`]);
}

function copyAdditionalFiles() {
    console.log('Copying additional files');
    const tsProject = ts.createProject(tsConfigFile);
    const tsConfigOutDir = tsProject.config.compilerOptions.outDir;
    const tsConfigSrcDir = tsProject.config.compilerOptions.rootDir;

    const spaTsJsxFiles = new Promise((resolve, reject) => {
        src(`${tsConfigSrcDir}/feature/SPATSJSX/view/assets/*`)
            .pipe(dest(`${tsConfigOutDir}/feature/SPATSJSX/view/assets`))
            .on('end', resolve)
            .on('error', reject);
    });

    return Promise.all([spaTsJsxFiles]);
}

function buildTypeScript() {
    console.log('Transpiling TypeScript to JS');
    return new Promise((resolve, reject) => {
        const tsProject = ts.createProject(tsConfigFile);
        const tsResult = tsProject.src().pipe(tsProject());
        const tsConfigOutDir = tsProject.config.compilerOptions.outDir;
        tsResult.js
            .pipe(dest(tsConfigOutDir))
            .on('end', () => {
                console.log('Transpiling done!');

                resolve();
            })
            .on('error', reject);
    });
}

function build() {
    console.log('Building project...');
    return new Promise((resolve, reject) => {
        try {
            series(
                buildTypeScript,
                copyAdditionalFiles
            )((_) => {
                console.log('Building complete');
                resolve();
            });
        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
}

module.exports = {
    build,
    clean
};
