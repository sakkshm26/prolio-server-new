import passport from "passport";
import instagramStrategy from "passport-instagram";
import users from "../users.js";
import dotenv from "dotenv"
dotenv.config()

const passportConfig = {
  clientID: process.env.INSTAGRAM_CLIENT_ID,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
  callbackURL: "https://localhost:4000/api/authentication/instagram/redirect",
};

export const instagramPassport = () =>
  passport.use(
    new instagramStrategy.Strategy(passportConfig, function (
      accessToken,
      refreshToken,
      profile,
      done
    ) {
      let user = profile
      // console.log(user)
      return done(null, user);
    })
  );
