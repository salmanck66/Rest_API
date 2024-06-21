import express from 'express'
import { signup ,home,signin,signout,createPost,editPost,deletePost} from '../controllers/controller.mjs'
import { authenticateUser } from '../helpers/authenticateUser.mjs'
const router = express.Router()

router.get("/",home)
router.post("/signup",signup)
router.post("/signin",signin)
router.post("/signout",signout)

router.post('/post', authenticateUser, createPost)
router.put('/post/:postId', authenticateUser, editPost)
router.delete('/post/:postId', authenticateUser, deletePost)

export default router