const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors({
    origin: ['https://diag-central.web.app', 'http://localhost:5173'],
    credentials: true
}))
app.use(express.json());
const verifyToken = async(req, res, next) => {
    const token = req.cookies?.token
    if(!token){
        return res.status(401).send("unauthorized access")
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) {
            return res.status(401).send({message: 'unauthorized access'})
        }
        req.user = decoded;
        next()        
    })

}



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

// auth api
app.post('/jwt', async (req, res) => {
    const user = req.body;
    console.log(user);
    const token = jwt.sign(user, `${process.env.ACCESS_TOKEN_SECRET}`, { expiresIn: '1h' })
    res
        .cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 60 * 60 * 1000
        })
        .send({ success: true })
})
// jwt logout
app.post('/logout', async (req, res) => {
    const user = req.body;
    console.log("requested");
    res.clearCookie('token', { maxAge: 0, secure: true, sameSite: 'none' }).send('logged out successfully')
})








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
// read single user
app.get('/user/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await userCollection.findOne(query);
    res.send(result);
})
// update user
app.put('/user/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) }
    const options = { upsert: true }
    const updateUser = req.body;

    const user = {
        $set: {
            role: updateUser.role,
            activeStatus: updateUser.activeStatus,
            userName: updateUser.userName,
            userBloodGroup: updateUser.userBloodGroup,
        }
    }
    const result = await userCollection.updateOne(filter, user, options);
    res.send(result);
})





const testCollection = client.db('testsDB').collection('tests');
// add test
app.post('/tests', async (req, res) => {
    const newTest = req.body;
    const result = await testCollection.insertOne(newTest);
    res.send(result);
})
// Read tests data
app.get('/tests', async (req, res) => {
    const cursor = testCollection.find();
    const result = await cursor.toArray();
    res.send(result);
})
// read single test
app.get('/test/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await testCollection.findOne(query);
    res.send(result);
})
// delete test
app.delete('/test/:id', async (req, res) => {
    const id = req.params.id
    const query = { _id: new ObjectId(id) }
    const result = await testCollection.deleteOne(query)
    res.send(result)
})
// search test
app.get('/tests/:key', async (req, res) => {
    const key = req.params.key.toLowerCase();
    const regex = new RegExp(key, 'i')
    const result = await testCollection.find(
        {
            $or: [
                { title: regex }
            ]
        }
    ).toArray()
    res.send(result);
});



// booked appointment

const bookedAppointments = client.db('appointmentsDB').collection('appointments')
app.get('/appointments', async (req, res) => {
    const cursor = bookedAppointments.find();
    const result = await cursor.toArray();
    res.send(result);
})
app.get('/appointments/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await bookedAppointments.findOne(query);
    res.send(result);
})
// delete appointment
app.delete('/appointments/:id', async (req, res) => {
    const id = req.params.id
    const query = { _id: new ObjectId(id) }
    const result = await bookedAppointments.deleteOne(query)
    res.send(result)
})



const bannerCollection = client.db('bannerDB').collection('banners')
// post banner
app.post('/banners', async (req, res) => {
    const newBanner = req.body;
    console.log(newUser);
    const result = await bannerCollection.insertOne(newBanner);
    res.send(result);
})
app.get('/banners', async (req, res) => {
    const cursor = bannerCollection.find();
    const result = await cursor.toArray();
    res.send(result);
})
app.get('/banners/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await bannerCollection.findOne(query);
    res.send(result);
})
// delete appointment
app.delete('/banners/:id', async (req, res) => {
    const id = req.params.id
    const query = { _id: new ObjectId(id) }
    const result = await bannerCollection.deleteOne(query)
    res.send(result)
})






app.get('/', (req, res) => {
    res.send("Server is running")
})
app.listen(port, () => {
    console.log(`Server running on ${port}`);
})