const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors())
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hesu93o.mongodb.net`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
// Send a ping to confirm a successful connection
client.db("admin").command({ ping: 1 });
console.log("Pinged your deployment. You successfully connected to MongoDB!");

const userCollection = client.db('usersDB').collection('users');
// Create user
app.post('/users', async (req, res) => {
    const newUser = req.body;
    console.log(newUser);
    const result = await userCollection.insertOne(newUser);
    res.send(result);
})
// Read user data
app.get('/users', async (req, res) => {
    const cursor = userCollection.find();
    const result = await cursor.toArray();
    res.send(result);
})
const testCollection = client.db('testsDB').collection('tests');











app.get('/', (req, res) => {
    res.send("Server is running")
})
app.listen(port, () => {
    console.log(`Server running on ${port}`);
})