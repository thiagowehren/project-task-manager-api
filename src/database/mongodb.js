const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/API_Node', {
	useNewUrlParser: true
}).then(() => {
	console.log('[Database: Connected]');
}).catch((err) => {
	console.log(`[Database: Error]: ${err}`);
});

module.exports = mongoose;