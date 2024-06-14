import express from 'express'
import { signup ,home} from '../controllers/controller.mjs'

const router = express.Router()

router.get("/",home)
router.post("/signup",signup)

export default router