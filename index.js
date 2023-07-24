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
      const transportPermit = req.body;
      const result = await agroProductCollection.insertOne(transportPermit);
      res.send(result);
    });

    //delete a product
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
    // app.post('/transport-permit', async (req, res) => {
    //   const transportPermit = req.body;
    //   const result = await tpCollection.insertOne(transportPermit);
    //   res.send(result);
    // });

    app.post('/transport-permit', async (req, res) => {
      try {
        const transportPermit = req.body;

        // Check if a transport permit with the same ID exists
        const existingPermit = await tpCollection.findOne({ id: transportPermit.id });
        if (existingPermit) {
          // Send error message to frontend using toast
          res.status(400).json({ error: 'Transport permit already exists for this ID.' });
          return;
        }

        const result = await tpCollection.insertOne(transportPermit);
        res.send(result);
      } catch (error) {
        console.error('Error saving transport permit:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // Add a new route to check if a transport permit with the same ID already exists
    app.get('/transport-permit/exists/:id', async (req, res) => {
      const id = req.params.id;
      const query = { id: id }; // Search by ID in the collection
      const existingPermit = await tpCollection.findOne(query);
      res.send(existingPermit !== null); // Send true if a permit exists, false otherwise
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

    app.get('/total-loan', async (req, res) => {
      try {
        const pipeline = [
          {
            $group: {
              _id: null,
              totalLoan: { $sum: '$total' }
            }
          }
        ];

        const result = await tpCollection.aggregate(pipeline).toArray();
        const totalLoan = result[0].totalLoan;

        res.json({ totalLoan });
      } catch (error) {
        console.error('Error calculating total loan:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    app.get('/transport-permits-with-total', async (req, res) => {
      try {
        const query = { total: { $exists: true } }; // Query to find documents with the "total" field
        const transportPermitsWithTotal = await tpCollection.find(query).toArray();
        res.json(transportPermitsWithTotal);
      } catch (error) {
        console.error('Error fetching TransportPermits with "total" field:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get('/total-loan-sanction', async (req, res) => {
      try {
        const query = { total: { $exists: true } }; // Query to find documents with the "total" field
        const totalTransportPermits = await tpCollection.countDocuments(query);
        res.json({ totalTransportPermits });
      } catch (error) {
        console.error('Error fetching total TransportPermits with "total" field:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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

app.listen(process.env.PORT || port, () => {
  console.log(`Virgo Tobaco website listening on port ${port}`)
})


