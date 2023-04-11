import express from "express";
import { addProfile, getUser, signin, signup, uploadImage, getProfileByUsername, updateProfile } from "../controllers/index.js";

var router = express.Router()

router.post('/addProfile', addProfile)
router.get('/get', getUser)
router.get('/get/:username', getProfileByUsername)
router.post('/signin', signin)
router.post('/signup', signup)
router.post('/update', updateProfile)
router.post('/image/:id', uploadImage)

export default router