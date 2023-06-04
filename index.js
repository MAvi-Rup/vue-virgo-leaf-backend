const express = require('express');
const cors = require('cors');
//const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());


//const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.slnidz9.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://admin:nwDU1GqXHaFdrz8c@virgo-leaf-cluster.mzofe5v.mongodb.net/`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    await client.connect();
    const farmersCollection = client.db('virgo-leaf-database').collection('transport-permit-collection');
    // const tpCollection = client.db('agro_trace').collection('tp_collection');
  
    
    //get all Farmers
    app.get('/all-transport-permit', async (req, res) => {
      const tools = await farmersCollection.find().toArray();
      res.send(tools);
    });
    
    // Save all the register farmers.
    app.post('/transport-permit', async (req, res) => {
      const farmers = req.body;
      const result = await farmersCollection.insertOne(farmers);
      res.send(result);
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
