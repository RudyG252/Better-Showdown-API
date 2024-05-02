
import express from 'express';

import indexRouter from './routes/userRouter.js';
import usageRouter from './routes/usageRouter.js'
import playerUsageRouter from './routes/playerUsageRouter.js'

var app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/user', indexRouter);
app.use('/', usageRouter);
app.use('/playerusage', playerUsageRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})




export default app
