require('dotenv').config();
const path = require('path');
require('express-async-errors');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

const app = express();

// connect DB
const connectDB = require('./db/connect');
// authentication for all jobs routes
const authenticationUser = require('./middleware/authentication');

// routes
const AuthRouter = require('./routes/auth');
const TaskRouter = require('./routes/jobs');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());
app.set('trust proxy', 1);

// security
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(helmet());
app.use(cors());
app.use(xss());

// routes

app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/tasks', authenticationUser, TaskRouter);

app.use(express.static(path.join(__dirname, 'public')));
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// ✅ connect to DB once (without app.listen)
connectDB(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ Database Connection Error:', err));

// ✅ export the app for Vercel
module.exports = app;