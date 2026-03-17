const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const DATA_FILE = path.join(__dirname, 'data/products.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

function readData() { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
function writeData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

// 获取所有数据
app.get('/api/products', (req, res) => res.json(readData()));

// 更新 banner
app.put('/api/banner', (req, res) => {
  const data = readData();
  data.banner = req.body.banner;
  writeData(data);
  res.json({ ok: true });
});

// 更新 logo
app.put('/api/logo', (req, res) => {
  const data = readData();
  data.logo = req.body.logo;
  writeData(data);
  res.json({ ok: true });
});

// 新增商品
app.post('/api/products', (req, res) => {
  const data = readData();
  const product = { ...req.body, id: Date.now().toString() };
  data.products.push(product);
  writeData(data);
  res.json(product);
});

// 更新商品
app.put('/api/products/:id', (req, res) => {
  const data = readData();
  const i = data.products.findIndex(p => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'not found' });
  data.products[i] = { ...data.products[i], ...req.body };
  writeData(data);
  res.json(data.products[i]);
});

// 删除商品
app.delete('/api/products/:id', (req, res) => {
  const data = readData();
  data.products = data.products.filter(p => p.id !== req.params.id);
  writeData(data);
  res.json({ ok: true });
});

// 上传图片（商品图/banner/logo通用）
app.post('/api/upload', upload.single('file'), (req, res) => {
  res.json({ url: `http://localhost:3001/uploads/${req.file.filename}` });
});

app.listen(3001, () => console.log('✅ 服务器运行在 http://localhost:3001'));