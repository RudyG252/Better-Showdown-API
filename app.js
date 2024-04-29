
import express from 'express';

import indexRouter from './routes/index.js';

// var usersRouter = require('./routes/users');

var app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
// app.use('/users', usersRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})




export default app
