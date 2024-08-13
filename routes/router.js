import express from 'express';
import {
  followerss,
  toggleFollowUser,
  signup,
  home,
  signin,
  signout,
  getPosts,
  createPost,
  editPost,
  deletePost,
} from '../controllers/controller.js';
import { authenticateUser } from '../helpers/authenticateUser.js';
const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Home route
 *     responses:
 *       200:
 *         description: Connected
 */
router.get("/", home);

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User signup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mail:
 *                 type: string
 *               phno:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User Registration Successful or Mail Id Already Exist
 *       400:
 *         description: Validation errors
 *       500:
 *         description: Internal Server Error
 */
router.post("/signup", signup);

/**
 * @swagger
 * /signin:
 *   post:
 *     summary: User signin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mail:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in
 *       400:
 *         description: Validation errors
 *       401:
 *         description: Password does not match
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.post("/signin", signin);

/**
 * @swagger
 * /signout:
 *   post:
 *     summary: User signout
 *     responses:
 *       200:
 *         description: User signed out successfully
 */
router.post("/signout", signout);

/**
 * @swagger
 * /post:
 *   get:
 *     summary: Get posts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of posts
 *       500:
 *         description: Internal Server Error
 */
router.get('/post', authenticateUser, getPosts);

/**
 * @swagger
 * /post:
 *   post:
 *     summary: Create a post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Title and image are required
 *       500:
 *         description: Internal Server Error
 */
router.post('/post', authenticateUser, createPost);

/**
 * @swagger
 * /post/{postId}:
 *   put:
 *     summary: Edit a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to edit
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       400:
 *         description: Post ID and either title or image are required
 *       500:
 *         description: Internal Server Error
 */
router.put('/post/:postId', authenticateUser, editPost);

/**
 * @swagger
 * /post/{postId}:
 *   delete:
 *     summary: Delete a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       400:
 *         description: Post ID is required
 *       500:
 *         description: Internal Server Error
 */
router.delete('/post/:postId', authenticateUser, deletePost);

/**
 * @swagger
 * /followers:
 *   get:
 *     summary: Get followers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of followers
 *       500:
 *         description: Internal Server Error
 */
router.get('/followers', authenticateUser, followerss);

/**
 * @swagger
 * /follow/{id}:
 *   post:
 *     summary: Follow/unfollow a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to follow/unfollow
 *     responses:
 *       200:
 *         description: User followed/unfollowed successfully
 *       400:
 *         description: Cannot follow yourself
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.post('/follow/:id', authenticateUser, toggleFollowUser);

export default router;
