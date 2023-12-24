// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;


mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');});


const mentorSchema = new mongoose.Schema({
  name: "deva",
  expertise: "java",
  
});

const studentSchema = new mongoose.Schema({
  name: "rocky",
  age: 20,}
  {
    name : "jeeva",
    age: 25

  }
  
  

);

const Mentor = mongoose.model('Mentor', mentorSchema);
const Student = mongoose.model('Student', studentSchema);

// Middleware setup
app.use(bodyParser.json());

// Mentor creation API
app.post('/api/mentors', async (req, res) => {
  try {
    const { name, expertise } = req.body;
    const mentor = new Mentor({ name, expertise });
    const savedMentor = await mentor.save();
    res.status(201).json(savedMentor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Student creation API
app.post('/api/students', async (req, res) => {
  try {
    const { name, age } = req.body;
    const student = new Student({ name, age });
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




// API to add multiple students to a mentor
app.post('/api/mentors/:mentorId/students', async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.mentorId);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    const { studentIds } = req.body;

    const studentsToAdd = await Student.find({ _id: { $in: studentIds }, mentor: { $exists: false } });
    

    if (studentsToAdd.length === 0) {
      return res.status(400).json({ message: 'No valid students to add or students already have mentors' });
    }

    studentsToAdd.forEach(async (student) => {
      student.mentor = mentor._id;
      await student.save();
    });

    res.status(200).json({ message: 'Students added to mentor successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// API to select a student by ID
app.get('/api/students/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API to assign a mentor to a student
app.put('/api/students/:studentId/assign-mentor', async (req, res) => {
  try {
    const { mentorId } = req.body;
    const student = await Student.findById(req.params.studentId);
    const mentor = await Mentor.findById(mentorId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    if (student.mentor) {
      return res.status(400).json({ message: 'Student already has a mentor' });
    }

    student.mentor = mentorId;
    await student.save();

    res.status(200).json({ message: 'Mentor assigned to the student successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
