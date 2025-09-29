require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();
// extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

// connect DB
const connectDB = require('./db/connect')
// authentication for all jobs routes
const authenticationUser = require('./middleware/authentication')

// routes
const AuthRouter = require('./routes/auth')
const TaskRouter = require('./routes/jobs')


// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());
app.set('trust proxy', 1); // for heroku 
// extra  security packages
app.use(rateLimit({windowMs: 15 * 60 * 1000, max: 100}));  // up to 100 requests per 15 minutes from same ip (limit request for user )
app.use(helmet());
app.use(cors());
app.use(xss());


// routes
app.use('/api/v1/auth',AuthRouter)
app.use('/api/v1/tasks', authenticationUser,TaskRouter)

app.use(express.static('public'));
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
