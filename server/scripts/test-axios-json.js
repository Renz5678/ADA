import axios from 'axios';
import express from 'express';

const app = express();
app.use(express.json());
app.post('/api', (req, res) => res.json({ body: req.body, headers: req.headers }));

const server = app.listen(3002, async () => {
    try {
        const api = axios.create({});
        
        let res1 = await api.post('http://localhost:3002/api', { foo: 'bar' });
        console.log(res1.data);
    } catch(e) {
        console.error(e.message);
    } finally {
        server.close();
    }
});
