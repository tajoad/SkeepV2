const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://skeep:skeep@cluster0.4etj4aj.mongodb.net/?retryWrites=true&w=majority";
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const cookieparser = require("cookie-parser");
const routes = require("./src/routes/routes");
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const run = async() => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

const port = 3002;

app.listen(port, (err) => {
  if (err) {
    console.log("server failed to start");
  } else {
    console.log("server started at port : ", port);
  }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieparser());
app.use(express.static(path.join(__dirname, "./images")));

app.use(cors());

app.use(function (req, res, next) {
  req.db = run;
  next();
});


run().catch(console.dir);