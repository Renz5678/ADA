import axios from 'axios';
import express from 'express';

const app = express();
app.use(express.json());
app.post('/api', (req, res) => res.json({ body: req.body }));

const server = app.listen(3002, async () => {
    try {
        const api = axios.create({});
        
        let res1 = await api.get('http://localhost:3002/api');
        console.log(res1.data);
    } catch(e) {
        console.error(e.message);
    } finally {
        server.close();
    }
});
