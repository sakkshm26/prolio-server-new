import axios from "axios";
import passport from "passport";
import YoutubeV3Strategy from "passport-youtube-v3";
import dotenv from "dotenv";
dotenv.config();

const passportConfig = {
  clientID:
  process.env.YOUTUBE_CLIENT_ID,
  clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
  callbackURL:
    "https://api.prolio.xyz/social/youtube/redirect",
};

export const youtubePassport = () =>
  passport.use(
    new YoutubeV3Strategy.Strategy(passportConfig, async function (
      request,
      accessToken,
      refreshToken,
      profile,
      done
    ) {
      // const channelId = profile.id;
      // let video_data = [],
      //   view_count,
      //   video_count,
      //   subscriber_count;

      // let user = await YoutubeUser.findById(profile.id);
      // if (!user) {
      //   console.log("Youtube channel don't exist, creating it...");
      //   try {
      //     await axios
      //       .get(
      //         `https://youtube.googleapis.com/youtube/v3/channels?part=statistics&part=status&id=${channelId}&key=${process.env.YOUTUBE_API_KEY}`
      //       )
      //       .then((res) => {
      //         let data = res.data.items[0].statistics;
      //         view_count = data.viewCount;
      //         video_count = data.videoCount;
      //         subscriber_count = data.subscriberCount;
      //       });

      //     await axios
      //       .get(
      //         `https://www.googleapis.com/youtube/v3/search?channelId=${channelId}&maxResults=10&order=date&type=video&key=${process.env.YOUTUBE_API_KEY}`
      //       )
      //       .then((res) =>
      //         res?.data?.items?.map((item) =>
      //           video_data.push({
      //             id: item.id.videoId,
      //           })
      //         )
      //       );

      //     let video_ids = "";
      //     video_data.map((item) => (video_ids += `&id=${item.id}`));
      //     video_data = [];

      //     if (video_ids.length) {
      //       await axios
      //         .get(
      //           `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&part=statistics${video_ids}&key=${process.env.YOUTUBE_API_KEY}`
      //         )
      //         .then((res) =>
      //           res?.data?.items?.map((item) =>
      //             video_data.push({
      //               _id: item.id,
      //               title: item.snippet.title,
      //               view_count: item.statistics.viewCount,
      //               like_count: item.statistics.likeCount,
      //               comment_count: item.statistics.commentCount,
      //             })
      //           )
      //         );
      //     }

      //     user = new YoutubeUser({
      //       _id: profile.id,
      //       name: profile.displayName,
      //       subscriber_count: subscriber_count,
      //       video_count: video_count,
      //       view_count: view_count,
      //       video_data: video_data,
      //     });
      //     user.save();
      //   } catch (err) {
      //     console.log("Error ", err);
      //   }
      // } else {
      //   console.log("Youtube account already exists");
      // }

      return done(null, profile);
    })
  );
