module.exports = {
  apps: [
    {
      name: 'telecom-frontend',
      cwd: '/var/www/telecom-billing/frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'telecom-backend',
      cwd: '/var/www/telecom-billing/backend',
      script: 'php',
      args: 'artisan serve --host=0.0.0.0 --port=8000',
      env: {
        APP_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M'
    }
  ]
};