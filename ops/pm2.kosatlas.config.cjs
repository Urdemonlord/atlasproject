module.exports = {
  apps: [
    {
      name: 'kosatlas',
      cwd: '/home/meowlabs/atlasproject/server',
      script: 'index.cjs',
      instances: 1,
      exec_mode: 'fork',
      env: {
        PORT: 3005,
        NODE_ENV: 'production',
      },
      max_memory_restart: '512M',
      error_file: '/home/meowlabs/atlasproject/logs/error.log',
      out_file: '/home/meowlabs/atlasproject/logs/out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      watch: false,
    },
  ],
};
