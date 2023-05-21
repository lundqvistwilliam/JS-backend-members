import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const port = 3001;
const app = express();

app.set('views', './views');
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use(express.urlencoded({extended: true}));

const client = new MongoClient('mongodb://127.0.0.1:27017');
await client.connect();
const db = client.db('members');
const membersCollection = db.collection('membersInfo');

app.get('/start', (req, res) => {
    res.render('start');
});


app.get('/members', async (req, res) => {
    const members = []
    await membersCollection.find({}).forEach((member) => {
      members.push(member);
    })
   res.render('members',{
    members:members,test:'test123'
   })
});

app.get('/members/:id', async (req, res) => {
  const member = await membersCollection.findOne({ _id: new ObjectId(req.params.id) });
  res.render('member', {
    name: member.name,
    email: member.email,
    phoneNumber: member.phoneNumber,
    joinDate: member.joinDate,
    position: member.position,
    id: member._id
  });
});


app.post('/members/:id/remove', async (req, res) => {
  const memberId = req.params.id;
  console.log(`Removing member with id ${memberId}`);
  await membersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
  res.redirect('/members');
});
  
app.get('/create', (req, res) => {
  res.render('create');
});

app.post('/members/create', async (req, res) => {
  await membersCollection.insertOne(req.body);
  res.redirect('/members');
});

db.collection('membersInfo').find().sort({name:1})


const newMembers = [
  { name: "John Doe", email: "johndoe@example.com", phoneNumber: "1234567890", joinDate: new Date(), position: "Defender" },
  { name: "Jane Smith", email: "janesmith@example.com", phoneNumber: "5555555555", joinDate: new Date(), position: "Midfielder" },
  { name: "Bob Johnson", email: "bobjohnson@example.com", phoneNumber: "7777777777", joinDate: new Date(), position: "Forward" },
];

membersCollection.countDocuments({}, function(err, count) {
  if (err) {
    console.log("Error counting documents:", err);
  } else {
    if (count === 0) {
      membersCollection.insertMany(newMembers, function(err, res) {
        if(err) {
          console.log("Error inserting documents:", err);
        } else {
          console.log("Documents inserted successfully");
        }
      });
    } else {
      console.log("Documents already exist in collection");
    }
  }
});

app.listen(port, () => console.log(`Listening on ${port}`));
