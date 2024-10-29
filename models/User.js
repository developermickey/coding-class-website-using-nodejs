const mongoose = require("mongoose");

const uri = 'mongodb+srv://mukeshpathak345:PG516bV1AX4CurCt@cluster0.gadvg.mongodb.net/myDatabase'; // Replace myDatabase with your actual database name

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 30000, // 30 seconds
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

module.exports = mongoose.model("User", userSchema);
