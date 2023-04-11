import passport from "passport";
import passportGoogle from "passport-google-oauth";
import users from "../users.js";
import dotenv from "dotenv"
dotenv.config()

const passportConfig = {
  clientID:
    process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_ID,
  callbackURL: process.env.GOOGLE_CLIENT_SECRET,
};

export const googlePassport = () =>
  passport.use(
    new passportGoogle.OAuth2Strategy(passportConfig, function (
      request,
      accessToken,
      refreshToken,
      profile,
      done
    ) {
        // console.log("Profile id is", profile.id);
      let user = users.getUserByExternalId("google", profile.id);
      if (!user) {
        user = users.createUser(profile.displayName, "google", profile.id);
      }
      console.log("User is ",user)
      return done(null, user);
    })
  );
