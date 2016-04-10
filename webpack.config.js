var path = require("path");

module.exports = {
  cache: true,
  entry: {
    main: ["./dist/js/client/app.js"]
  },
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "/assets/",
    filename: "bundle.js"
  }
};