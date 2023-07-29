const express = require("express");
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://anthonyroy:sBGAAHYVD6nguA82@cluster0.dk2q0z5.mongodb.net/?retryWrites=true&w=majority',
	{
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(() => console.log('Connexion à MongoDB réussie !'))
	.catch((error) => console.log({ error }));

const app = express();

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
	next();
});

app.use((req, res) => {
	res.status(200).json({ message: "Requête reçue !" });
});

module.exports = app;