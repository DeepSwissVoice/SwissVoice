const webpack = require("webpack");
const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
    mode: "production",
    entry: {
        index: path.resolve("src", "js", "index.js"),
        about: path.resolve("src", "js", "about.js")
    },
    output: {
        filename: "[name]-bundle.js",
        path: path.resolve(__dirname, "server", "swissvoice", "static", "js")
    },
    plugins: [
        new UglifyJsPlugin({
            sourceMap: true
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            Popper: ["popper.js", "default"]
        })
    ],
    devtool: "source-map"
};
