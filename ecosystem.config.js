module.exports = {
  apps: [
    {
      name: 'web-tim-viec',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
