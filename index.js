const express = require('express');
const cors = require('cors');
//const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
const axios = require('axios');

//const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.slnidz9.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://admin:nwDU1GqXHaFdrz8c@virgo-leaf-cluster.mzofe5v.mongodb.net/`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    await client.connect();
    const tpCollection = client.db('virgo-leaf-database').collection('transport-permit-collection');
    const farmerCollection = client.db('virgo-leaf-database').collection('farmer-collection');
    // const tpCollection = client.db('agro_trace').collection('tp_collection');
  
    
    //get all Farmers
    app.get('/farmers', async (req, res) => {
      const farmers = await farmerCollection.find().toArray();
      res.send(farmers);
    });
    //get all Transport Permit
    app.get('/all-transport-permit', async (req, res) => {
      const transportPermit = await tpCollection.find().toArray();
      res.send(transportPermit);
    });
    
    // Save all the register farmers.
    app.post('/farmers', async (req, res) => {
      const farmers = req.body;
      const result = await farmerCollection.insertOne(farmers);
      res.send(result);
    });
    // Save all the transport Permit.
    app.post('/transport-permit', async (req, res) => {
      const transportPermit = req.body;
      const result = await tpCollection.insertOne(transportPermit);
      res.send(result);
    });

    app.post('/api/upload', async (req, res) => {
      try {
        const response = await axios.post('https://api.imgbb.com/1/upload', req.body, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
    
        res.json(response.data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

  }
  finally {

  }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello From Virgo Tobaco Leaf')
})

app.listen(port, () => {
  console.log(`Virgo Tobaco website listening on port ${port}`)
})

// app.use((req, res, next) => {
//   res.setHeader('Content-Security-Policy', "default-src 'self' https://vercel.live");
//   next();
// });
