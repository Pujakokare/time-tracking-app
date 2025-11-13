const express = require('express');
const cors = require('cors');
const couchbase = require('couchbase');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Couchbase connection
let cluster;
let bucket;
let collection;

async function connectToCouchbase() {
  try {
    const connectionString = process.env.COUCHBASE_URL || 'couchbase://localhost';
    const username = process.env.COUCHBASE_USERNAME || 'Administrator';
    const password = process.env.COUCHBASE_PASSWORD || 'password';
    const bucketName = process.env.COUCHBASE_BUCKET || 'punch-in-tracker';

    cluster = await couchbase.connect(connectionString, {
      username: username,
      password: password,
      configProfile: 'wanDevelopment',
    });

    bucket = cluster.bucket(bucketName);
    collection = bucket.defaultCollection();

    console.log('Connected to Couchbase successfully');
  } catch (error) {
    console.error('Failed to connect to Couchbase:', error);
    // Continue running even if Couchbase connection fails
  }
}

// Initialize Couchbase connection
connectToCouchbase();

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Save punch-in time
app.post('/api/punch-in', async (req, res) => {
  try {
    const { timestamp, manualEntry } = req.body;

    if (!timestamp) {
      return res.status(400).json({ error: 'Timestamp is required' });
    }

    const punchInRecord = {
      timestamp: timestamp,
      manualEntry: manualEntry || false,
      createdAt: new Date().toISOString(),
      type: 'punch-in'
    };

    // Generate unique ID
    const docId = `punch-in::${Date.now()}::${Math.random().toString(36).substr(2, 9)}`;

    // Save to Couchbase
    await collection.insert(docId, punchInRecord);

    res.status(201).json({
      success: true,
      message: 'Punch-in recorded successfully',
      data: { id: docId, ...punchInRecord }
    });
  } catch (error) {
    console.error('Error saving punch-in:', error);
    res.status(500).json({
      error: 'Failed to save punch-in',
      message: error.message
    });
  }
});

// Get all punch-in records
app.get('/api/punch-ins', async (req, res) => {
  try {
    const query = `
      SELECT META().id, * 
      FROM \`${process.env.COUCHBASE_BUCKET || 'punch-in-tracker'}\`
      WHERE type = 'punch-in'
      ORDER BY createdAt DESC
    `;

    const result = await cluster.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching punch-ins:', error);
    res.status(500).json({
      error: 'Failed to fetch punch-ins',
      message: error.message
    });
  }
});

// Delete punch-in record
app.delete('/api/punch-in/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await collection.remove(id);

    res.json({
      success: true,
      message: 'Punch-in deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting punch-in:', error);
    res.status(500).json({
      error: 'Failed to delete punch-in',
      message: error.message
    });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

#### 5. **backend/.gitignore**
Name: `backend/.gitignore`
```
node_modules/
.env
*.log
.DS_Store
