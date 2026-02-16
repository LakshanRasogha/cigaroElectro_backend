import express from 'express'
import { registerUser, loginUser, getAllUsers, blockOrUnblockUser, getUser, editUser, changePassword } from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.post('/', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/', getUser)
userRouter.get('/all', getAllUsers)
//userRouter.post('/google', loginWithGoogle)
userRouter.put('/block/:email', blockOrUnblockUser)
userRouter.put('/edit/:email', editUser)
userRouter.put("/changePassword/:email", changePassword );

export default userRouter