// Cinimer backend
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

mongoose.connect(
  "mongodb+srv://jeffyvicky250_db_user:zERbjw4pCHc9xWJS@shared.qszbgox.mongodb.net/?retryWrites=true&w=majority&appName=Shared"
);



const videoSchema = new mongoose.Schema({
  title: String,
  filename: String,
  genre: String,
});

const Video = mongoose.model('Video', videoSchema);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

const upload = multer({ dest: 'uploads/' });
// Registration endpoint
app.post('/register', async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);
  await new User({ username: req.body.username, password: hashed }).save();
  res.json({ success: true });
});

// Login endpoint
app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.status(400).json({ error: "User not found" });
  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.status(400).json({ error: "Wrong password" });
  const token = jwt.sign({ id: user._id }, "secretkey");
  res.json({ token });
});

app.post('/upload', upload.single('video'), async (req, res) => {
  const video = new Video({ title: req.body.title, filename: req.file.filename, genre: req.body.genre});
  await video.save();
  res.json(video);
});

app.get('/videos', async (req, res) => {
  const videos = await Video.find();
  res.json(videos);
});

app.listen(4000, () => console.log('Cinimer backend running on 4000'));
