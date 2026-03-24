const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');

const app = express();
const DATA_FILE = path.join(__dirname, 'data/products.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// multer 先存到临时目录，再用 sharp 压缩
const tmpStorage = multer.memoryStorage();
const upload = multer({ storage: tmpStorage, limits: { fileSize: 20 * 1024 * 1024 } });

function readData() { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
function writeData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

// 上传并压缩图片
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const filename = `${Date.now()}.webp`;
    const outPath = path.join(UPLOADS_DIR, filename);
    await sharp(req.file.buffer)
      .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outPath);
    res.json({ url: `/uploads/${filename}` });
  } catch (e) {
    console.error('Image compress error:', e);
    res.status(500).json({ error: e.message });
  }
});

// 获取所有数据
app.get('/api/products', (req, res) => {
  try { res.json(readData()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

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

// 新增商品（自动加 createdAt）
app.post('/api/products', (req, res) => {
  const data = readData();
  const product = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString(), status: 'active' };
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

// 不提供删除接口，只允许下架（status: offline）

app.listen(3001, () => console.log('✅ Server running at http://localhost:3001'));