import passport from "passport";
import passportFacebook from "passport-facebook";
import axios from "axios";
import { FacebookUser } from "../models/facebookProfile.js";
import dotenv from "dotenv"
dotenv.config()

const passportConfig = {
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: "https://localhost:4000/api/authentication/facebook/redirect",
  //   profileFields: ['id', 'displayName', 'photos', 'email']
};

export const facebookPassport = () =>
  passport.use(
    new passportFacebook.Strategy(passportConfig, async function (
      accessToken,
      refreshToken,
      profile,
      done
    ) {
      let long_user_token, page_data_with_access_token, user;
      try {
        const response = await axios.get(
          `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_CLIENT_ID}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&fb_exchange_token=${accessToken}`
        );

        // console.log("Response 1 is ", response.data);
        long_user_token = response.data.access_token;
      } catch (err) {
        console.log("Error1 is ", err.data);
      }

      try {
        const response = await axios.get(
          `https://graph.facebook.com/${profile.id}/accounts?access_token=${long_user_token}`
        );

        // console.log("Response 2 is ", response.data);
        page_data_with_access_token = response.data.data[0];
      } catch (err) {
        console.log("Error2 is ", err);
      }

      if (page_data_with_access_token) {
        let long_page_access_token = page_data_with_access_token.access_token;
        let page_id = page_data_with_access_token.id;
        let page_name = page_data_with_access_token.name;
        let posts_count, followers_count;

        user = await FacebookUser.findById(page_id);
        // to add
        //110245765188099/feed?fields=comments.limit(3).summary(true),likes.limit(3).summary(true),full_picture,message
        //fields=posts,followers_count

        if (!user) {
          try {
            const response = await axios.get(
              `https://graph.facebook.com/${page_id}/published_posts?summary=total_count&limit=1&access_token=${long_page_access_token}`
            );
            posts_count = response.data.summary.total_count;

            const response2 = await axios.get(
              `https://graph.facebook.com/${page_id}?fields=followers_count&access_token=${long_page_access_token}`
            );
            followers_count = response2.data.followers_count;
            // console.log(long_page_access_token, page_id, page_name, posts_count, followers_count)

            user = await FacebookUser.create({
              _id: page_id,
              name: page_name,
              posts_count: posts_count,
              followers_count: followers_count,
              access_token: long_page_access_token,
            });
          } catch (err) {
            console.log("Error occurred 3");
          }
        } else {
          console.log("Facebook page already exists");
        }
      }

      return done(null, user);
    })
  );
