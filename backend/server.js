const app = require('./app');
const connectDatabase = require('./config/database');
const cloudinary = require('cloudinary');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT} in ${process.env.NODE_ENV} mode`);
});


const cors = require("cors");

app.use(cors({
  origin: "https://opticool-web.vercel.app", // Change this to your Vercel frontend URL
  credentials: true
}));
