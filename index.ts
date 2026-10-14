import express from 'express'

import { AuthMiddleware, userMiddleware } from './middleware'
import AuthRoute from './router/auth'
import BrainRoute from './router/brain'

const app = express();
app.use(express.json());

app.use('/auth',AuthMiddleware, AuthRoute)
app.use('/brain',userMiddleware, BrainRoute)

app.listen(3000, () => {
    console.log(`Server is running on - http://localhost:3000`);
    
})