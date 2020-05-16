module.exports = {
    diff: true,
    recursive: true,
    exit: true,
    exclude: ["node_modules"],
    spec: ["src/**/*.spec.js"],
    slow: 75,
    timeout: 2000,
    ui: "bdd"
};
