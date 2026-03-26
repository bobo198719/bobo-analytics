import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Razorpay from 'razorpay';
import 'dotenv/config';

const app = express();
app.use(express.json());
app.use(cors());

// MONGODB CONNECTION
mongoose.connect('mongodb://127.0.0.1:27017/bobo')
  .then(() => console.log('✅ Connected to MongoDB (Bobo DB)'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// SECRET KEY FOR JWT
const SECRET_KEY = process.env.JWT_SECRET || "BOBO_MASTER_KEY_2026";

// USER MODEL
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" }
});
const User = mongoose.model('User', UserSchema);

// TENANT MODEL
const TenantSchema = new mongoose.Schema({
  name: String,
  industry: String,
  status: { type: String, default: 'active' },
  revenue: { type: Number, default: 0 }
});
const Tenant = mongoose.model('Tenant', TenantSchema);

// RAZORPAY SETUP
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_SECRET || "placeholder_secret"
});

// AUTH MIDDLEWARE
function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid Token" });
  }
}

// --- AUTH ROUTES ---

// REGISTER (ONE-TIME ADMIN CREATE)
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed });
    await user.save();
    res.json({ message: "User Registered Successfully" });
  } catch (err) { res.status(500).json({ error: "Email already exists" }); }
});

// LOGIN (GET TOKEN)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User Not Found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Incorrect Password" });

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '8h' });
    res.json({ token, role: user.role });
  } catch (err) { res.status(500).json({ error: "Internal Error" }); }
});


// --- PROTECTED DASHBOARD ROUTES ---

app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const tenants = await Tenant.find();
    const stats = {
       users: tenants.length,
       active: tenants.filter(t => t.status === 'active').length,
       revenue: tenants.reduce((sum, t) => sum + (t.revenue || 0), 0),
       alerts: 0
    };
    res.json(stats);
  } catch (err) { res.status(500).json({ error: "Stats Error" }); }
});

app.get('/api/tenants', authMiddleware, async (req, res) => {
  const data = await Tenant.find().sort({ _id: -1 });
  res.json(data);
});

app.post('/api/tenants', authMiddleware, async (req, res) => {
  const newTenant = new Tenant(req.body);
  await newTenant.save();
  res.json(newTenant);
});


// --- PAYMENT ROUTES ---

app.post('/api/create-order', authMiddleware, async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100, // INR IN PAISE
      currency: "INR",
      receipt: "rcpt_" + Math.floor(Math.random() * 1000000)
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) { res.status(500).json({ error: "Payment Gateway Error" }); }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`\n 🛡️ SECURE MASTER API RUNNING: http://localhost:${PORT}/api\n`));
