const webpack = require("webpack");
const path = require("path");
const glob = require("glob");
const fs = require("fs");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const SentryPlugin = require("@sentry/webpack-plugin");
const WebpackCleanupPlugin = require("webpack-cleanup-plugin");
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");

const SwissVoice = require("./package.json");

const entryPoints = {};
for (const file of glob.sync("src/js/pages/*.js")) {
    entryPoints[path.parse(file).name] = path.resolve(file);
}

module.exports = {
    mode: "production",
    entry: entryPoints,
    output: {
        filename: "[name].bundle.js",
        path: path.resolve("server/swissvoice/static/js")
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                sourceMap: true,
                parallel: true,
                uglifyOptions: {
                    inline: false
                }
            })
        ],
        splitChunks: {
            chunks: "all",
            minSize: 10000

        }
    },
    plugins: [
        new HardSourceWebpackPlugin(),
        new WebpackCleanupPlugin(),
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(SwissVoice.version)
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            Popper: ["popper.js", "default"]
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: "[name].bundle.js.map"
        })
    ]
};

if (fs.existsSync(".sentryclirc")) {
    console.info("SentryPlugin enabled");
    module.exports.plugins.push(
        new SentryPlugin({
            release: SwissVoice.version,
            include: path.resolve("server/swissvoice/static")
        })
    );
} else {
    console.warn("No .sentryclirc file found. Not uploading source maps!");
}