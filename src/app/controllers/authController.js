const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');
const mailer = require('../../modules/mailer');

function generateToken(params = {}) {
	return jwt.sign(params, authConfig.secret, {
		expiresIn: '1d',
	});
}

router.post('/register', async (req, res) => {
	const { email } = req.body;
	try {
		if(await User.findOne({email})){
			return res.status(409).send({error: 'User already exists'});
		}
		const user = await User.create(req.body);
		user.password = undefined;
		return res.send({
			user,
			token: generateToken({ id: user._id }),
		});
	} catch (error) {
		return res.status(422).send({error: `Registration failed: ${error}`});
	}
});

router.get('/users', async (req, res) => {
	try {
		const users = await User.find({});
		return res.status(200).send(users);
	} catch (error) {
		return res.status(500).send({ error: 'Empty!'});
	}
});

router.get('/search/:id', async (req, res) => {
	const id = req.params.id.trim();
	try {
		const user = await User.findById(id);
		return res.status(200).send(user);
	} catch (error) {
		return res.status(500).send({ error: 'This ID doesn\'t exist!'});
	}
});

router.delete('/delete/:id', async (req, res) => {
	const id = req.params.id.trim();
	try {
		const user = await User.findById(id);
		if(!user){
			return res.status(422).send({ message: 'This ID doens\'t exist!'});
		}
		await User.deleteOne({_id: id});
		return res.status(200).send({ message: 'User deleted!'});
	} catch (error) {
		return res.status(500).send({ error: 'User could not be deleted!'});
	}
});

router.post('/authenticate', async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({email}).select('+password');

		if(!user){
			return res.status(400).send({ error: 'User not found'});
		}
		if(!await bcrypt.compare(password, user.password)){
			return res.status(400).send({message: 'Invalid password'});
		}

		user.password = undefined;

		return res.status(200).send({
			user,
			token: generateToken({ id: user._id }),
		});
	} catch (error) {
		return res.status(500).send({error: `Authentication Error! ${error}`});
	}
});

router.post('/forgot_password', async (req, res) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email });

		if (!user)
			return res.status(400).send({error: 'User not found'});

		const token = crypto.randomBytes(20).toString('hex');
		const now = new Date();
		now.setHours(now.getHours() + 1);

		await User.findByIdAndUpdate(user.id, {
			'$set': {
				passwordResetToken: token,
				passwordResetExpires: now,
			}
		});

		mailer.sendMail({
			to: email,
			from: 'defaut@default.com',
			template: 'auth/forgot_password',
			context: { token },
		}, (err) => {
			if (err)
			console.log(err);
				return res.send(400).send({error: 'Error sending forgotten password token!'});
			return res.send();
		});

	} catch (err) {
		res.status(400).send({ error: 'Error occurred on forgot password, try again!'});
	}
});

router.post('/reset_password', async (req, res) => {
	const { email, token, password } = req.body;

	try {
		const user = await User.findOne({ email })
			.select('+passwordResetToken passwordResetExpires');

		if (!user)
			return res.status(400).send({ error: 'User not found.'});

		if (token !== user.passwordResetToken)
			return res.status(400).send({ error: 'Invalid Token, try again!'});

		const now = new Date();

		if (now > user.passwordResetExpires)
			return res.status(400).send({ error: 'Expired Token, try again!'});

		user.password = password;
		await user.save();
		return res.status(400).send({ message: 'Password successfully changed.'});

	} catch (err) {
		return res.status(400).send({ error: 'Error occurred while resenting password, try again!'});
	}
})

module.exports = app => app.use('/auth', router);