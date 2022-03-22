const { Pool } = require('pg');

const dbPool = new Pool({
  host: 
  'ec2-3-208-121-149.compute-1.amazonaws.com',
  database: 'dbtdvk228g7cmv',
  port: 5432,
  user: 'frdnsyfjbdghdm',
  password: 'b72acbbe3fabb2af1270473e28a81edb724b070cd3a0299c7c45b8034505b493~',
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = dbPool;