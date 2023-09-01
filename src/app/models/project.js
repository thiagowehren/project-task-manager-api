const mongoose = require('../../database/mongodb');

const ProjectSchema = new mongoose.Schema({
	title:{
		type: String,
		required: true
	},
	description:{
		type: String,
		required: true
	},
	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		require: true
	},
	tasks: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Task',
		required: false
	}],
	createdAt:{
		type: Date,
		default: Date.now()
	}
});

const Project = mongoose.model('Project', ProjectSchema);
module.exports = Project;