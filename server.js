const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MONGODB CONNECTION
mongoose.connect('mongodb://127.0.0.1:27017/bobo', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB (Bobo DB)'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// TENANT MODEL
const TenantSchema = new mongoose.Schema({
  name: String,
  industry: String,
  status: { type: String, default: 'active' },
  revenue: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

const Tenant = mongoose.model('Tenant', TenantSchema);

// GET ALL TENANTS
app.get('/api/tenants', async (req, res) => {
  try {
    const data = await Tenant.find().sort({ created_at: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// ADD NEW TENANT
app.post('/api/tenants', async (req, res) => {
  try {
    const newTenant = new Tenant(req.body);
    await newTenant.save();
    console.log('[API] New Tenant Added:', newTenant.name);
    res.json(newTenant);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save tenant' });
  }
});

// DASHBOARD KPI STATS
app.get('/api/stats', async (req, res) => {
  try {
    const tenants = await Tenant.find();
    
    const totalUsers = tenants.length;
    const active = tenants.filter(t => t.status === 'active').length;
    const revenue = tenants.reduce((sum, t) => sum + t.revenue, 0);

    res.json({
      users: totalUsers,
      active: active,
      revenue: revenue,
      alerts: 0 // Placeholder for security alerts
    });
  } catch (err) {
    res.status(500).json({ error: 'Stats Engine Error' });
  }
});

// HEALTH CHECK
app.get('/health', (req, res) => res.send('Bobo OS Backend v1.0 Alive'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  🚀 Bobo OS Master API Running
  ----------------------------
  Endpoint: http://localhost:${PORT}/api
  Database: MongoDB (bobo)
  Status:   Production Ready
  `);
});
