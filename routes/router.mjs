import express from 'express'
import { signup ,home,signin} from '../controllers/controller.mjs'

const router = express.Router()

router.get("/",home)
router.post("/signup",signup)
router.post("/signin",signin)

export default router