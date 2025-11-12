const express = require('express');
const cors = require('cors');
const app = express();

const routes = require('../src/routes');

app.use(cors());
app.use(express.json());
app.use(routes);

app.listen(5000, () => {
  console.log('API executando em http://localhost:5000');
});