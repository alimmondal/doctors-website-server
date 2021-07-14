const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileUpload')
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dj8zc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000;










if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// app.use(express.static(path.join(__dirname, 'client/build')));
app.use('*/css',express.static('public/css'));
app.use('*/js',express.static('public/js'));
app.use('*/images',express.static('public/images'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded())
app.use(cors())












const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("findDoctors").collection("allAppointments");
  const doctorCollection = client.db("findDoctors").collection("admins");

app.post('/getAnAppointment', (req, res) => {
    const appointment = req.body;
    console.log(appointment);
    appointmentCollection.insertOne(appointment)
    .then(result => {
        res.send(result.insertedCount > 0);
    })
})


app.get('/postAppointments', (req, res) => {
  appointmentCollection.find({})
      .toArray((err, documents) => {
          res.send(documents);
      })
})



app.post('/byDateAppointments', (req, res) => {
  const date = req.body;
  const email = req.body.email;
  doctorCollection.find({email: email})
  .toArray((err, doctors) => {
    const filter = {date: date.date}
    if(doctors.length === 0){
      filter.email = email;
    }
    appointmentCollection.find(filter)
  .toArray((err, documents) => {
    // console.log(email, date.date, doctors,documents)
    res.send(documents);
  })
  })
  
});


app.post('/addAnAdmin', (req, res) => {
  const file = req.files.file;
  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const newImg = file.data;
  const encImg = newImg.toString('base64');

  var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
  }

  doctorCollection.insertOne({ name, email, phone, image })
      .then(result => {
          res.send(result.insertedCount > 0);
      })
});


app.get('/admins', (req, res) => {
  doctorCollection.find({})
      .toArray((err, documents) => {
          res.send(documents);
      })
});

app.post('/isAdmins', (req, res) => {
  const email = req.body.email;
  doctorCollection.find({ email: email })
      .toArray((err, admins) => {
          res.send(admins.length > 0);
      })
})






  console.log("db connection established")
});


app.get('/', (req, res) => {
  res.send("Hello from db, it's working working")
})



app.listen(process.env.PORT || port)


