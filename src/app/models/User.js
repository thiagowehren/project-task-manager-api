const mongoose = require('../../database/mongodb');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	name:{
		type: String,
		required: true
	},
	email:{
		type: String,
		unique: true,
		lowercase: true,
		required: true
	},
	password:{
		type: String,
		required: true,
		select: false
	},
	passwordResetToken:{
		type: String,
		select: false
	},
	passwordResetExpires:{
		type: String,
		select: false
	},
	createdAt:{
		type: Date,
		default: Date.now()
	}
});

userSchema.pre('save', async function(next){
	const hashedPassword = await bcrypt.hash(this.password, 10);
	this.password = hashedPassword;
	next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;