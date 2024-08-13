import { User } from "../models/user.js";
import { userSignUp, signhelp } from "../helpers/signInUp.js";
import { signUserjwt, signRefreshToken } from "../middlewares/jwt.js";
import { body, validationResult } from "express-validator";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

export const signup = async (req, res) => {
  await body("mail").isEmail().withMessage("Must be a valid email").run(req);
  await body("phno")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number must be exactly 10 digits")
    .isNumeric()
    .withMessage("Phone number must be numeric")
    .run(req);
  await body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    if (!req.body) {
      return res.json("Empty request body");
    }
    const signupDone = await userSignUp(req.body);
    if (signupDone.exist) {
      res
        .status(200)
        .json("Mail Id Already Exist, Please Signup With Different Mail ID");
    } else {
      res.status(200).json("User Registration Successful");
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

export const signin = async (req, res) => {
  await body("mail").isEmail().withMessage("Must be a valid email").run(req);
  await body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { mail, password } = req.body;
  try {
    const resolved = await signhelp(mail, password);
    if (resolved.nomatch) {
      res.status(401).json("Password does not match");
    } else if (resolved.usernotfound) {
      res.status(404).json("User not found");
    } else if (resolved.userexist) {
      const accessToken = await signUserjwt(resolved.user);
      const refreshToken = await signRefreshToken(resolved.user);
      res
        .cookie("jwt", accessToken, { httpOnly: true, maxAge: 400000 })
        .cookie("refreshtoken", refreshToken, {
          httpOnly: true,
          maxAge: 900000,
        })
        .json({
          message: "User logged in",
        });
    }
  } catch (error) {
    console.error("Error in signin:", error);
    res.status(500).json("Internal Server Error");
  }
};

export const home = (req, res) => {
  res.redirect("/api-docs");
};

export const createPost = [
  upload.single("image"),
  async (req, res) => {
    const { title } = req.body;
    const { user } = req;

    try {
      if (!title || !req.file) {
        return res
          .status(400)
          .json({ message: "Title and image are required" });
      }

      const newPost = {
        title,
        image: req.file.filename,
        createdAt: new Date(),
      };

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $push: { posts: newPost } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res
        .status(201)
        .json({ message: "Post created successfully", post: newPost });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];

export const getPosts = async (req, res) => {
  try {
    const { userId } = req.query;
    let posts;
    if (userId) {
      const user = await User.aggregate;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      posts = user.posts;
    } else {
      posts = await User.aggregate([
        { $unwind: "$posts" },
        { $sort: { "posts.createdAt": -1 } },
        { $project: { _id: 1, post: "$posts" } },
      ]);
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const editPost = [
  upload.single("image"),
  async (req, res) => {
    const postId = req.params.postId;
    const { title } = req.body;
    const { user } = req;

    try {
      const errors = validationResult(req);
      if (!postId || (!title && !req.file)) {
        return res
          .status(400)
          .json({ message: "Post ID and either title or image are required" });
      }

      const updateData = { updatedAt: new Date() };

      if (title) {
        updateData.title = title;
      }

      if (req.file) {
        updateData.image = req.file.filename;
        const post = await User.findOne({ _id: user._id, "posts._id": postId });
        if (post && post.posts) {
          const oldImageFilename = post.posts.find(
            (p) => p._id.toString() === postId
          )?.image;
          if (oldImageFilename) {
            deleteImageFile(oldImageFilename);
          }
        }
      }

      const updatedPost = await User.findOneAndUpdate(
        { _id: user._id, "posts._id": postId },
        { $set: { "posts.$": updateData } },
        { new: true }
      );

      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      const updatedPostDetails = {
        _id: updatedPost._id,
        title: updatedPost.title,
        image: updatedPost.image,
        createdAt: updatedPost.createdAt,
      };

      res.status(200).json({
        message: "Post updated successfully",
        post: updatedPostDetails,
      });
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];

export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const { user } = req;

  try {
    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    const result = await User.updateOne(
      { _id: user._id },
      { $pull: { posts: { _id: postId } } }
    );

    if (result.nModified === 0) {
      return res
        .status(404)
        .json({ message: "Post not found or not authorized to delete" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const followers = async (req, res) => {
  try {
    const { user } = req;
    const userData = await User.findById(user._id).populate(
      "followers",
      "userName mail"
    );

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(userData.followers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const followUser = async (req, res) => {
  try {
    const { user } = req;
    const { Id } = req.params;

    const userToFollow = await User.findById(Id);
    if (!userToFollow) {
      return res.status(404).json({ message: "User to follow not found" });
    }

    if (!user.followers.includes(Id)) {
      user.followers.push(Id);
      await user.save();
      res.status(200).json({ message: "User followed successfully" });
    } else {
      res.status(400).json({ message: "Already following this user" });
    }
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const signout = (req, res) => {
  res
    .clearCookie("jwt")
    .clearCookie("refreshtoken")
    .json({ message: "User signed out successfully" });
};

export const toggleFollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (id === userId.toString()) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const userToFollowOrUnfollow = await User.findById(id);
    if (!userToFollowOrUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await User.findById(userId);
    const isFollowing = user.followers.some((followerId) =>
      followerId.equals(id)
    );

    if (isFollowing) {
      await User.updateOne({ _id: userId }, { $pull: { followers: id } });
      return res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      await User.updateOne({ _id: userId }, { $addToSet: { followers: id } });
      return res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.error("Error toggling follow/unfollow:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const followerss = async (req, res) => {
  try {
    const userId = req.user._id;

    const userWithFollowers = await User.aggregate([
      { $match: { _id: userId } },
      {
        $lookup: {
          from: "users",
          localField: "followers",
          foreignField: "_id",
          as: "followersDetails",
        },
      },
      {
        $project: {
          followersDetails: {
            _id: 1,
            userName: 1,
            posts: 1,
          },
        },
      },
    ]);
    if (!userWithFollowers.length) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ followers: userWithFollowers[0].followersDetails });
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
