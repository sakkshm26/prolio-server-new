import axios from "axios";
import passport from "passport";
import TwitterStrategy from "passport-twitter";
import dotenv from "dotenv"
dotenv.config()

const passportConfig = {
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: "https://api.prolio.xyz/social/twitter/redirect",
};

export const twitterPassport = () =>
  passport.use(
    new TwitterStrategy(
      passportConfig,
      async (req, token, tokenSecret, profile, done) => {
        let tweet_data = [];

        // let user = await TwitterUser.findById(profile._json.id_str);
        // if (!user) {
        //   try {
        //     await axios
        //       .get(
        //         `https://api.twitter.com/2/users/${profile._json.id_str}/tweets?max_results=10&exclude=retweets,replies&tweet.fields=public_metrics`,
        //         {
        //           headers: {
        //             Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        //           },
        //         }
        //       )
        //       .then((res) =>
        //         res.data?.data?.map((item) => tweet_data.push({...item, _id: item.id}))
        //       );

        //     user = new TwitterUser({
        //       _id: profile._json.id_str,
        //       created_at: profile._json.created_at,
        //       name: profile._json.name,
        //       username: profile._json.screen_name,
        //       description: profile._json.description,
        //       tweet_count: profile._json.statuses_count,
        //       followers_count: profile._json.followers_count,
        //       following_count: profile._json.friends_count,
        //       tweet_data: tweet_data,
        //     });
        //     user.save();
        //   } catch (err) {
        //     console.log(err);
        //   }
        // } else {
        //   console.log("Twitter account already exists");
        // }
        
        done(null, profile);
      }
    )
  );
