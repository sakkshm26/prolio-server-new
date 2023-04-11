import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";
// import { updateTwitterData } from "../utils/latestData/updateTwitterData.js";
// import { updateYoutubeData } from "../util/latestData/updateYoutubeData.js";
import { s3, upload } from "../aws/s3.js";
import dotenv from "dotenv";
import { updateTwitterData } from "../utils/latestData/updateTwitterData.js";
import { updateYoutubeData } from "../utils/latestData/updateYoutubeData.js";
dotenv.config();

export const addProfile = async (req, res) => {
  const { username, bio } = req.body;

  try {
    let user_id = req.user_id;

    let new_date = new Date();
    new_date.setDate(new_date.getDate() + 7);

    let profile = await prisma.profile.create({
      data: {
        user_id,
        username,
        bio,
        update_time: new_date,
      },
    });

    res.status(200).json({ profile });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getProfileByUsername = async (req, res) => {
  const token = req.query.token;

  try {
    let profile = await prisma.profile.findUnique({
      where: {
        username: req.params.username,
      },
      include: {
        twitter_profiles: {
          include: {
            recent_tweets: true,
          },
        },
        youtube_profiles: {
          include: {
            recent_videos: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ message: "No user found" });
    }

    if (new Date() > profile.update_time) {
      console.log("UPDATE TIME!!");
      if (profile.twitter_profiles.length) {
        updateTwitterData(profile.twitter_profiles[0]);
      }
      if (profile.youtube_profiles.length) {
        updateYoutubeData(profile.youtube_profiles[0]);
      }

      let new_date = new Date();
      new_date.setDate(new_date.getDate() + 7);

      profile = await prisma.profile.update({
        where: {
          username: req.params.username,
        },
        include: {
          twitter_profiles: {
            include: {
              recent_tweets: true,
            },
          },
          youtube_profiles: {
            include: {
              recent_videos: true,
            },
          },
        },
        data: {
          update_time: new_date,
        },
      });
    }

    if (profile.user_id === req.user_id) {
      return res.status(200).json({ profile, owner: true });
    }

    res.status(200).json({ profile, owner: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user_id,
      },
      include: {
        profiles: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }

    delete user["password"];

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existing_user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!existing_user)
      return res.status(404).json({ message: "User doesn't exist", code: 1 });

    const is_password_correct = await bcrypt.compare(
      password,
      existing_user.password
    );

    if (!is_password_correct)
      return res.status(400).json({ message: "Invalid credentials", code: 2 });

    const token = jwt.sign(
      { email: existing_user.email, id: existing_user.id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    delete existing_user["password"];

    res.status(200).json({
      user: existing_user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const signup = async (req, res) => {
  const { name, email, password, confirm_password } = req.body;

  try {
    let existing_user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existing_user)
      return res
        .status(400)
        .json({ message: "User with same email already exists", code: 1 });

    if (password !== confirm_password)
      return res.status(400).json({ message: "Passwords don't match" });

    const hashed_password = await bcrypt.hash(password, 12);

    // let new_date = new Date();
    // new_date.setDate(new_date.getDate() + 7);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed_password,
      },
    });

    const token = jwt.sign(
      { email: user.email, id: user.id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    delete user["password"];

    res.status(200).json({ user, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      id,
      display_name,
      bio,
      email_id,
      email_text,
      web_url,
      web_url_text,
    } = req.body;

    const profile = await prisma.profile.update({
      where: {
        id,
      },
      include: {
        twitter_profiles: {
          include: {
            recent_tweets: true,
          },
        },
        youtube_profiles: {
          include: {
            recent_videos: true,
          },
        },
      },
      data: {
        display_name,
        bio,
        email_id,
        email_text,
        web_url,
        web_url_text,
      },
    });

    res.status(200).json({ profile });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { display_name, bio, email_id, email_text, web_url, web_text } =
      req.body;

    let user = await prisma.user.update({
      where: {
        id: req.user_id,
      },
      data: {
        display_name,
        bio,
        display_email: email_id,
        email_button_text: email_text,
        display_url: web_url,
        url_button_text: web_text,
      },
    });

    delete user["password"];

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const uploadImage = async (req, res) => {
  const id = req.params.id
  try {
    let profile = await prisma.profile.findUnique({
      where: {
        id,
      },
    });
    if (profile.profile_image) {
      console.log("Profile image present, deleting it...");
      let key = profile.profile_image.split(".com/")[1];
      s3.deleteObject(
        { Bucket: "profile-builder-web", Key: key },
        (err, data) => {
          console.error("Error ", err);
          console.log("Data ", data);
        }
      );
    } else {
      console.log("No profile image present, adding it...");
    }

    const uploadSingle = upload().single("image");

    uploadSingle(req, res, async (err) => {
      if (err)
        return res.status(400).json({ success: false, message: err.message });

      profile = await prisma.profile.update({
        where: {
          id
        },
        data: {
          profile_image: req.file.location,
        },
      });

      res.status(200).json({ profile });
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Something went wrong" });
  }
};
