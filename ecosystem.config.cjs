module.exports = {
    apps: [
        {
            name: "vmc-laravel",
            script: "php",
            args: "artisan serve --port=8000",
        },
        {
            name: "localtunnel",
            script: "npx",
            args: "localtunnel --port 8000 --subdomain vmc",
        }
    ]
};