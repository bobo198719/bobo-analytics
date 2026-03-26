import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Razorpay from 'razorpay';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import 'dotenv/config';

const app = express();

// --- 1. PRODUCTION SECURITY STACK ---
app.use(helmet());               // Security Headers
app.use(compression());          // Gzip Compression
app.use(morgan('combined'));     // Production Logging (Standard Combined Format)
app.use(express.json({ limit: '10kb' })); // Body Size Protection
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- 2. RATE LIMITING (BRUTE FORCE PROTECTION) ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // 100 requests per window
  message: { error: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use('/api/', apiLimiter);

// --- 3. DATABASE (PRIORITIZE MONGODB ATLAS) ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bobo';
mongoose.connect(MONGO_URI)
  .then(() => console.log('📡 PRODUCTION DB TUNNEL ESTABLISHED'))
  .catch(err => console.error('❌ DB CONNECTION FAILURE:', err));

// --- 4. DATA MODELS ---
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, index: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'client'], default: "admin" }
});
const User = mongoose.model('User', UserSchema);

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: String,
  status: { type: String, default: 'active' },
  revenue: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
const Tenant = mongoose.model('Tenant', TenantSchema);

// --- 5. SECRETS & GATEWAYS ---
const JWT_SECRET = process.env.JWT_SECRET || "PRODUCTION_FALLBACK_SECRET";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_SECRET || "secret_placeholder"
});

// --- 6. AUTH MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Unauthorized: Missing Token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session Expired / Invalid Token" });
  }
};

// --- API ROUTES ---

// HEALTH ENGINE
app.get('/health', (req, res) => res.json({ status: "ALIVE", uptime: process.uptime() }));

// SECURE LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid Credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (err) { res.status(500).json({ error: "Auth Engine Malfunction" }); }
});

// PROTECTED DASHBOARD OPS
app.get('/api/stats', authMiddleware, async (req, res) => {
  const tenants = await Tenant.find();
  const summary = {
    users: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    revenue: tenants.reduce((s, t) => s + (t.revenue || 0), 0)
  };
  res.json(summary);
});

app.get('/api/tenants', authMiddleware, async (req, res) => {
  const data = await Tenant.find().sort({ createdAt: -1 }).limit(100);
  res.json(data);
});

// RAZORPAY ORDER GENERATOR
app.post('/api/create-order', authMiddleware, async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount) * 100,
      currency: "INR",
      receipt: `RCPT_${Date.now()}`
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) { res.status(500).json({ error: "Order Creation Failed" }); }
});

// RAZORPAY SIGNATURE VERIFICATION (CRUCIAL SECURITY)
app.post('/api/verify-payment', authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET || "secret_placeholder")
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      console.log(`[PAYMENT] Correct Signature. Payment Verified: ${razorpay_payment_id}`);
      return res.json({ status: "success", message: "Verified" });
    }
    res.status(400).json({ status: "failed", message: "Tampered Signature" });
  } catch (err) { res.status(500).json({ error: "Verification Service Offline" }); }
});

// --- 7. GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error('[CRITICAL ENGINE ERROR]', err.stack);
  res.status(500).json({ error: "Internal System Disturbance Detected" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  🛡️ PRODUCTION MASTER CONSOLE v15.1
  ---------------------------------
  SECURITY: Helmet + RateLimiter Active
  MONITOR:  Morgan Cloud Logging Active
  AUTH:     JWT (1h Expiry) Active
  GATEWAY:  http://localhost:${PORT}/api
  `);
});
