const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json())
app.use(express.static('public'));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/signup', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Check MongoDB connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/main.html')
})

// Create user schema and model
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model('User', userSchema);

//LOGIN
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Find user in MongoDB
    User.findOne({ username, password })
        .then(user => {
            if (user) {
                req.session.user = user;
                res.redirect('/Dashboard.html');
            } else {
                res.redirect('/signup.html');
            }
        })
        .catch(err => {
            console.error(err);
            res.redirect('/?error=1');
        });
});

//SIGNUP
app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    // Create new user document
    const newUser = new User({
        username,
        password
    });

    // Save new user to database
    newUser.save()
        .then(user => {
            console.log('User saved successfully:', user);
            // res.send("User signed up successfully");
            setTimeout(() => {
                res.redirect('/login.html');
            }, 1000);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error saving user to database');
        });
});

// dashboard
app.get('/Dashboard.html', (req, res) => {
    if (req.session.user) {
        res.sendFile(__dirname + '/public/Dashboard.html');
    } else {
        res.redirect('/');
    }
});

// logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


// notes:
// Create note schema and model
const noteSchema = new mongoose.Schema({
    notes: String
});

const Note = mongoose.model('Note', noteSchema);

app.post('/saveNote', (req, res) => {
    const { notes } = req.body;
    // Create new user document
    const newNote = new Note({
        notes
    });

    // Save new user to database
    newNote.save()
        .then(user => {
            console.log('Note saved successfully:');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error saving user to database');
        });
});

const projectSchema = new mongoose.Schema({
    project_name: String,
    deadline: String,
    description: String
})

const Project = mongoose.model('Project', projectSchema);

app.post('/addProject', async (req, res) => {
    const { project_name, deadline, description } = req.body;

    try {
        const newProject = new Project({ project_name, deadline, description });
        await newProject.save();
        res.send("Project created");
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// fetch projects
app.get('/projects', async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


//Task Creation
const taskSchema = new mongoose.Schema({
    id: String,
    task: String,
    assigned_to: String,
    due_date: String
})

const Task = mongoose.model('Task', taskSchema);

app.post('/addTask', async (req, res) => {
    const { id, task, assigned_to, due_date } = req.body;

    try {
        const newTask = new Task({ id, task, assigned_to, due_date });
        await newTask.save();
        res.send("Task created");
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//Task Retrieval
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/saveC', async (req, res) => {
    const { task, assigned_to, due_date } = req.body;
    try {

        const tasks = await Task.findOne({ id })
        if (!tasks) {
            res.send("Task not found");
        }
        else {
            tasks.assigned_to = assigned_to;
            tasks.due_date = due_date;
            tasks.task = task;
            console.log(tasks)
            // await task.save();
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
