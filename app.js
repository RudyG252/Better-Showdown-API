
import express from 'express';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js'

var app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/index', indexRouter);
app.use('/', usersRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})




export default app
