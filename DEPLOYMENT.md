# Backend Deployment Guide

This guide covers the steps to deploy the Reminder System backend to a production environment.

## Prerequisites

- Node.js (v14 or later)
- PostgreSQL database (or Neon DB as configured)
- SMTP email service account
- Linux/Windows server with Node.js support

## Deployment Steps

### 1. Prepare your Environment

1. Clone the repository:
   ```
   git clone https://github.com/Krishnamundhara/Reminder-Sys-backend.git
   cd Reminder-Sys-backend
   ```

2. Install production dependencies:
   ```
   npm ci --only=production
   ```

3. Configure environment variables:
   - Copy `.env.production` to `.env`
   - Update settings for your production environment
   - Make sure to set secure values for `SESSION_SECRET` and `JWT_SECRET`
   - Configure your database connection string
   - Set up email SMTP settings

### 2. Database Setup

1. Ensure your PostgreSQL database is created and accessible
   
2. Run database migrations:
   ```
   NODE_ENV=production node migrations/run_email_verified_migration.js
   NODE_ENV=production node migrations/run_phone_number_migration.js
   NODE_ENV=production node migrations/run_otp_table_migration.js
   ```

### 3. Server Configuration

#### Option 1: Direct Node.js (with PM2)

1. Install PM2 globally:
   ```
   npm install -g pm2
   ```

2. Start the application:
   ```
   pm2 start server.js --name reminder-backend
   ```

3. Configure PM2 to start on system boot:
   ```
   pm2 startup
   pm2 save
   ```

#### Option 2: Docker Deployment

1. Build the Docker image:
   ```
   docker build -t reminder-backend .
   ```

2. Run the container:
   ```
   docker run -d -p 5000:5000 --name reminder-backend \
     --env-file .env \
     reminder-backend
   ```

### 4. Web Server Configuration (Nginx)

Set up Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 5. SSL Setup

1. Install Certbot:
   ```
   apt install certbot python3-certbot-nginx
   ```

2. Obtain and configure SSL certificate:
   ```
   certbot --nginx -d api.yourdomain.com
   ```

### 6. Monitoring and Maintenance

1. Set up monitoring:
   ```
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 7
   ```

2. Create a backup script:
   ```
   pg_dump -U username -d reminder_db > /backup/reminder_db_$(date +%Y%m%d).sql
   ```

## Security Best Practices

1. Keep all dependencies updated:
   ```
   npm audit fix
   ```

2. Rotate JWT and session secrets regularly
3. Enable rate limiting for authentication endpoints
4. Set up brute force protection
5. Keep daily database backups

## Scaling Considerations

1. Use a load balancer if deploying multiple instances
2. Consider Redis for session management in clustered deployments
3. Implement database read replicas for high traffic scenarios

## Troubleshooting

Common issues and solutions:

1. Connection issues to PostgreSQL
   - Check network configuration and firewall rules
   - Verify database connection string

2. Email delivery problems
   - Confirm SMTP credentials are correct
   - Check if SMTP provider requires specific port/settings

3. Server crashes under load
   - Increase Node.js memory limit: `NODE_OPTIONS=--max_old_space_size=4096`
   - Implement proper error handling and restart strategies
