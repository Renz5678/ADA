import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function test() {
    try {
        const form = new FormData();
        form.append('product_code', 'TEST01');
        form.append('product_name', 'Test Product');
        form.append('price', '10.50');
        // create a dummy image
        fs.writeFileSync('dummy.jpg', 'dummy image content');
        form.append('image', fs.createReadStream('dummy.jpg'));

        // wait, I need an auth token
    } catch(e) {
        console.error(e.message);
    }
}
