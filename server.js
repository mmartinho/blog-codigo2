/**
 * To use:
 * >npm install dotenv@8.2.0
 */
require('dotenv').config();

const app = require('./app');
const port = 3000;
const db = require('./database');
const redis = require('./redis/blacklist');

const routes = require('./rotas');
routes(app);

app.listen(port, () => console.log(`App listening on port ${port}`));
