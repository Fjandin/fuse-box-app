const path = require('path');
const fs = require('fs');

const {
    FuseBox,
    Sparky,
    EnvPlugin,
    WebIndexPlugin,
    CSSModules,
    CSSPlugin,
    PostCSSPlugin,
    CSSResourcePlugin,
    CopyPlugin,
    ImageBase64Plugin,
    QuantumPlugin
} = require('fuse-box');
  
let fuse;
let app;
let vendor;
let isProduction;

Sparky.task('config', () => {
    const alias = fs.readdirSync('./app').reduce((a, b) => ({...a, [b]: `~/${b}`}), {});
    fuse = FuseBox.init({
        alias,
        useTypescriptCompiler: true,
        homeDir: 'app',
        output: 'build/$name.js',
        tsConfig: './tsconfig.json',
        sourceMaps: !isProduction,
        hash: isProduction,
        target: 'browser',
        plugins: [
            EnvPlugin({NODE_ENV: isProduction ? 'production' : 'development'}),
            // ImageBase64Plugin({useDefault: true}),
            CopyPlugin({useDefault: true, dest: 'assets', files: ['*.jpg']}),
            [
                PostCSSPlugin([require('postcss-cssnext')], {sourceMaps: !isProduction}),
                CSSModules({root: './app'}),
                CSSResourcePlugin({
                    dist: './build/assets',
                    resolve: (f) => `/assets/${f}`
                }),
                !isProduction ? CSSPlugin() : CSSPlugin({
                    group: 'app.css',
                    inject: (file) => `/${file}`,
                    outFile: `build/app.css`
                })
            ],
            WebIndexPlugin({
                template: 'app/index.html',
                target: 'index.html'
            }),
            isProduction && QuantumPlugin({
                bakeApiIntoBundle: 'vendor',
                treeshake: true,
                uglify: true
            })
        ]
    });
    app = fuse.bundle('app').instructions('> index.ts');
});

Sparky.task('clean', () => Sparky.src('build/').clean('build/'));

Sparky.task('default', ['clean', 'config'], () => {
    // We override dev server to auto fallback to index.html
    fuse.dev({root: false}, (server) => {
        const app = server.httpServer.app;
        app.use("/", require('express').static(path.resolve('./build')));
        app.use("/", require('express').static(path.resolve('./app')));
        app.get('*', (req, res) => res.sendFile(path.resolve('./build/index.html')));
        
    });
    app.watch().hmr();
    return fuse.run();
});

Sparky.task('prod-env', () => {
    isProduction = true;
});

Sparky.task('build', ['prod-env', 'clean', 'config'], () => {
    return fuse.run();
});
