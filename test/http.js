import express from 'express';

const toHex = (buffer) => buffer.toString('hex').match(/.{1,2}/g)?.join(' ');
const app = express();
const port = 3000;

app.use('/gateway', express.raw({ type: 'application/x-amf' }));
app.get('/gateway', (req, res) => res.send('Hello, world!'));
app.post('/gateway', (req, res) => console.log(toHex(req.body)));

app.listen(port, () => console.log(`AMF binary gateway listening on http://localhost:${port}/gateway.`));