import express from 'express';
import multer from 'multer';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('image'), (req, res) => {
    res.json({ file: req.file, body: req.body });
});

const server = app.listen(3002, () => {
    console.log("Server listening on 3002");
});
