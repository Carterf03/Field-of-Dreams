const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT;

const routes = require('./routes');
app.use(routes);

app.use(express.json());

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req,  res) => {
  res.json({your_api: 'it works'});
});

// As our server to listen for incoming connections
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));