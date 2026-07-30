module.exports = {
    apps: [
        {
            name: "web-app",
            script: "npm",
            args: "start",
        },
        {
            name: "localtunnel",
            script: "npx",
            args: "localtunnel --port 5000 --subdomain vmc",
        }
    ]
};