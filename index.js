const express = require('express');
// const morgan = require('morgan');

const app = express();


app.use(
	express.urlencoded({
		extended: true,
	})
);
app.use(express.json());
app.disable('x-powered-by');
// app.use(morgan.token('jwt', (req) => {
//   if (req.cookies && req.cookies.jwt) {
//     return '[FILTERED]';
//   }
//   return null;
// }));

// Router
require('./src/app/controllers/index')(app);
// require('./src/app/controllers/authController')(app);
// require('./src/app/controllers/projectController')(app);

app.get('/', (req, res) => {
	res.json({ msg: 'application running' });
});

app.listen(3000);
console.log('[Application running]: http://localhost:3000');