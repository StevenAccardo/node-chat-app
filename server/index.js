const path = require('path');
const express = require('express');

const publicPath = path.join(__dirname, '../client');
const port = process.env.PORT || 3000;
const app = express();

app.use(express.static(publicPath));

app.listen(3000, () => console.log(`Server is listening on port ${port}`));
