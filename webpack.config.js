const webpack = require("webpack");
const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
    mode: "production",
    entry: path.resolve("src", "js", "index.js"),
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "swissvoice", "swissvoice", "static")
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
