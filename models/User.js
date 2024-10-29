const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/techMike', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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
})


module.exports = mongoose.model("User", userSchema);