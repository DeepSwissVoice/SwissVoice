const webpack = require("webpack");
const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const SentryPlugin = require("@sentry/webpack-plugin");

const swissvoice = require("./package.json");

module.exports = {
    mode: "production",
    entry: {
        index: path.resolve("src", "js", "index.js"),
        about: path.resolve("src", "js", "about.js")
    },
    output: {
        filename: "[name]-bundle.js",
        path: path.resolve("server", "swissvoice", "static", "js")
    },
    plugins: [
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(swissvoice.version)
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            Popper: ["popper.js", "default"]
        }),
        new UglifyJsPlugin({
            sourceMap: true
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: "[name]-bundle.js.map",
            append: false
        }),
        new SentryPlugin({
            release: swissvoice.version,
            include: path.resolve("server", "swissvoice", "static", "js")
        })
    ]
};
