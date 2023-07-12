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
    const agroProductCollection = client.db('virgo-leaf-database').collection('agro-product');
    // const tpCollection = client.db('agro_trace').collection('tp_collection');


    //get all Farmers
    app.get('/farmers', async (req, res) => {
      const farmers = await farmerCollection.find().toArray();
      res.send(farmers);
    });

    //get all agro products
    app.get('/products', async (req, res) => {
      const products = await agroProductCollection.find().toArray();
      res.send(products);
    });

    // Add a new product
    app.post('/products', async (req, res) => {
      const newProduct = req.body; // Assuming the new product object is sent in the request body

      try {
        const result = await agroProductCollection.insertOne(newProduct);
        const addedProduct = result.ops[0]; // Get the added product from the result

        res.json(addedProduct); // Send the added product as a JSON response
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' }); // Send an error response as JSON
      }
    });

    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await agroProductCollection.deleteOne(query)
      res.send(result)
    })



    app.put('/products/:id', async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      // console.log(updatedUser)
      const filter = { _id: new ObjectId(id) } // Add the 'new' keyword here
      const options = { upsert: true }
      const updateProduct = {
        $set: {
          name: updatedUser.updateName,
          price: updatedUser.updatePrice
        }
      };

      const result = await agroProductCollection.updateOne(filter, updateProduct, options);
      res.send(result);
    });


    // Save all the register farmers.
    app.post('/farmers', async (req, res) => {
      try {
        const farmers = req.body;

        // Get the current count of documents in the collection
        const count = await farmerCollection.countDocuments();

        // Generate the next ID by incrementing the count by 1
        const nextId = count + 1;

        // Add the incremental ID to the farmers data
        const farmersWithId = {
          id: nextId,
          ...farmers,
        };

        const result = await farmerCollection.insertOne(farmersWithId);
        res.send(result);
      } catch (error) {
        console.error('Error inserting farmers:', error);
        res.status(500).send('An error occurred');
      }
    });

    app.get('/farmer/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }; // Use 'new' keyword to create an instance of ObjectId
      const farmer = await farmerCollection.findOne(query);
      res.send(farmer);
    });


    //get all Transport Permit
    app.get('/all-transport-permit', async (req, res) => {
      const transportPermit = await tpCollection.find().toArray();
      const reverseTp = transportPermit.reverse()
      res.send(reverseTp);
    });

    // Save all the transport Permit.
    app.post('/transport-permit', async (req, res) => {
      const transportPermit = req.body;
      const result = await tpCollection.insertOne(transportPermit);
      res.send(result);
    });

    //Get Transport Permit by ID

    app.get('/transport-permit/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }; // Use 'new' keyword to create an instance of ObjectId
      const transportPermit = await tpCollection.findOne(query);
      res.send(transportPermit);
    });

    app.put('/transport-permit/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const filter = { _id: new ObjectId(id) };
      const update = { $set: updatedData };
    
      try {
        const result = await tpCollection.updateOne(filter, update);
        res.send(result);
      } catch (error) {
        console.error('Error updating transport permit:', error);
        res.status(500).send('An error occurred');
      }
    });

    app.delete('/transport-permit/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
    
      try {
        const result = await tpCollection.deleteOne(filter);
        res.send(result);
      } catch (error) {
        console.error('Error deleting transport permit:', error);
        res.status(500).send('An error occurred');
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


