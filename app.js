const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const { title } = require('process');
const app = express();
const PORT = 8080;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/monaco-editor', express.static(path.join(__dirname, 'node_modules', 'monaco-editor')));

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

app.get('/login', (req, res) => {
    res.render('login', {title: "Login"});
});
app.get('/signup', (req, res) => {
    res.render('signup', {title: "Login"});
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
