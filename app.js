const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const session = require('express-session');
const { title } = require('process');
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');

const userModel = require("./models/User")

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/monaco-editor', express.static(path.join(__dirname, 'node_modules', 'monaco-editor')));

app.use(session({
    secret: 'mikemikemike',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
  }));

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('index', {title: "Home"});
});

app.get('/about-us', (req, res) => {
    res.render('about', {title: "About Us"});
});

app.get('/contact-us', (req, res) => {
    res.render('contact', {title: "Contact Us"});
});

app.get('/blog', (req, res) => {
    res.render('blog', {title: "Blog"});
});

app.get('/courses', (req, res) => {
    res.render('courses', {title: "Our Courses"});
});

app.get('/tutorials', (req, res) => {
    res.render('tutorials', {title: "Tutorials"});
});
app.get('/html-tutorials', (req, res) => {
    res.render('html', {title: "HTML Tutorials"});
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await userModel.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        bcrypt.compare(password, user.password, function(err, match) {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (match) {
                req.session.username = user.name; // Set username in session
                return res.redirect('/profile'); // Redirect to profile page
            } else {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        });
        
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});



app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        res.redirect("/login")
    }

    // Create a new user
    try {

        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt, async function(err, hash) {
                const user =  await userModel.create({
                    name,
                    email,
                    password: hash // Consider hashing the password before saving
                });
               
            });
        });
        

        return res.status(201).redirect("/login");
    } catch (error) {
        return res.status(500).json({ message: 'Error registering user', error });
    }
});







// Route to render the editor page
app.get('/editor', (req, res) => {
    res.render('editor');
});

// Route to execute code
app.post('/execute', (req, res) => {
    const { code, language, input } = req.body;

    // Define commands for different languages
    let command;
    switch (language) {
        case 'javascript':
            command = `node -e "${code.replace(/"/g, '\\"')}"`;
            break;
        case 'python':
            command = `python3 -c "${code.replace(/"/g, '\\"')}"`;
            break;
        case 'java':
            command = `echo "${code}" > Main.java && javac Main.java && java Main`;
            break;
        case 'c':
            command = `echo "${code}" > main.c && gcc main.c -o main && ./main`;
            break;
        default:
            res.json({ output: 'Language not supported!' });
            return;
    }

    // Execute command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            res.json({ output: stderr });
        } else {
            res.json({ output: stdout });
        }
    });
});





app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.redirect('/login'); // Redirect to login page after logout
    });
});


// Middleware to check if the user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.username) {
        return next();
    }
    res.redirect('/login');
}

// Middleware to redirect logged-in users away from login and signup pages
function redirectIfAuthenticated(req, res, next) {
    if (req.session.username) {
        return res.redirect('/profile');
    }
    next();
}

app.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('login', { title: "Login" });
});

app.get('/signup', redirectIfAuthenticated, (req, res) => {
    res.render('signup', { title: "Sign Up" });
});

app.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const user = await userModel.findOne({ name: req.session.username });
        res.render('profile', { title: "Profile", username: req.session.username, user: user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
