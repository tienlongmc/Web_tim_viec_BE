module.exports = {
  apps: [
    {
      name: 'web-tim-viec',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
