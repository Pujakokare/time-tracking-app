# Punch-In Tracker

A time tracking application built with React and Couchbase that allows users to record and view their punch-in times.

## Features

- 🕐 Automatic punch-in with current local time
- 📝 Manual time entry option
- 📊 View all punch-in history
- 💾 Data stored in Couchbase database
- 🚀 Deployed on Render.com

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js, Express
- **Database**: Couchbase
- **Hosting**: Render.com

## Environment Variables

Required environment variables for Render.com:

- `COUCHBASE_URL` - Your Couchbase cluster connection string
- `COUCHBASE_USERNAME` - Couchbase username
- `COUCHBASE_PASSWORD` - Couchbase password
- `COUCHBASE_BUCKET` - Couchbase bucket name

## Deployment

This application is configured for automatic deployment on Render.com using the `render.yaml` configuration file.

## Local Development
```bash
# Install backend dependencies
npm run install-backend

# Install frontend dependencies
npm run install-frontend

# Build frontend
npm run build-frontend

# Start server
npm start
```

## License

MIT
