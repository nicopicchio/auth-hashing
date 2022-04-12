const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();
const superSecretKey = 'jsdnvgjnslgvnhjjljrn'

router.post('/register', async (req, res) => {
	try {
		const registeredUser = await prisma.user.create({
			data: {
				username: req.body.username,
				password: await bcrypt.hash(req.body.password, 10),
			},
		});
		res.status(200).json({ registeredUser });
	} catch (e) {
		console.error(e);
		res.status(500).json('Something went wrong!');
	}
});

router.post('/login', async (req, res) => {
	const typedPassword = req.body.password;
	const matchingUser = await prisma.user.findUnique({
		where: {
			username: req.body.username,
		},
	});
	const matchingPassword = await bcrypt.compare(typedPassword, matchingUser.password);
	if (matchingUser && matchingPassword) {
		const token = jwt.sign({ username: matchingUser.username }, superSecretKey);
		res.status(200).json({ token });
		return;
	}
	res.status(401).json('Access denied!');
});

module.exports = router;
