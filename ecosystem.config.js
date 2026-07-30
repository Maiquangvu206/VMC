module.exports = {
    apps: [
        {
            name: "web-app",
            script: "npm",
            args: "start",
        },
        {
            name: "cloudflare-tunnel",
            script: "cloudflared",
            args: "tunnel --url http://localhost:5000",
        }
    ]
};