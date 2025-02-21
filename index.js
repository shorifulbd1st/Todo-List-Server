const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o3yie.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
const corsOptions = {
    origin: ['http://localhost:5173', '',],
    credentials: true,
    optionalSuccessStatus: 200,
}
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// app.use(cors());
// app.use(express.json());
app.use(morgan('dev'))
app.use(express.json());
app.use(cors(corsOptions));

async function run() {
    try {
        const usersCollection = client.db('Todo-List').collection('users');
        const taskCollection = client.db('Todo-List').collection('tasks');


        app.post('/users', async (req, res) => {
            const userInfo = req.body;
            const filter = { email: userInfo.email }
            const existingUser = await usersCollection.findOne(filter);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await usersCollection.insertOne(userInfo);
            res.send(result)
        })

        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(email)
            const query = { email }
            // console.log(query)
            const result = await usersCollection.findOne(query);
            res.send(result);
        })

        app.post('/tasks', async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result)
        })

        app.get('/tasks/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const result = await taskCollection.find(query).toArray();
            res.send(result)
        })

        app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        })
        app.patch('/task/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const data = req.body;

            const updateData = {
                $set: {
                    title: data.title,
                    description: data.description,
                    status: data.status
                }
            }
            const result = await taskCollection.updateOne(filter, updateData)
            res.send(result)
        })
        app.patch('/task-drag', async (req, res) => {
            const info = req.body;
            // console.log(info)
            const filter = { _id: new ObjectId(info.taskId) }
            const updateData = {
                $set: {
                    status: info.targetColumnId,
                    time: info.time
                }
            }
            const result = await taskCollection.updateOne(filter, updateData)
            res.send(result)
        })
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello from my server')
})

app.listen(port, () => {
    console.log('My todo list server is running at', port);
})