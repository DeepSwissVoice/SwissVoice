const webpack = require("webpack");
const path = require("path");
const fs = require("fs");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const SentryPlugin = require("@sentry/webpack-plugin");

const swissvoice = require("./package.json");

module.exports = {
    mode: "production",
    entry: {
        index: path.resolve("src", "js", "index.js"),
        about: path.resolve("src", "js", "about.js"),
        stats: path.resolve("src", "js", "stats.js")
    },
    output: {
        filename: "[name]-bundle.js",
        path: path.resolve("server", "swissvoice", "static", "js")
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                sourceMap: true,
                uglifyOptions: {
                    inline: false
                }
            })
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(swissvoice.version)
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            Popper: ["popper.js", "default"]
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: "[name]-bundle.js.map"
        })
    ]
};

if (fs.existsSync(".sentryclirc")) {
    console.info("SentryPlugin enabled");
    module.exports.plugins.push(
        new SentryPlugin({
            release: swissvoice.version,
            include: path.resolve("server", "swissvoice", "static")
        })
    );
} else {
    console.warn("No .sentryclirc file found. Not uploading source maps!")
}