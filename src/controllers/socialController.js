import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";
import passport from "passport";
import { twitterPassport, youtubePassport } from "../passportAuth/index.js";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

twitterPassport();
youtubePassport();

async function addTweet(tweet, id) {
  await prisma.tweet.create({
    data: {
      twitter_profile_id: id,
      tweet_id: tweet.id,
      text: tweet.text,
      retweet_count: tweet.public_metrics.retweet_count,
      like_count: tweet.public_metrics.like_count,
      reply_count: tweet.public_metrics.reply_count,
    },
  });
}

async function addVideo(video, id) {
  await prisma.youtube_video.create({
    data: {
      youtube_profile_id: id,
      video_id: video.id,
      title: video.title,
      view_count: parseInt(video.view_count),
      like_count: parseInt(video.like_count),
      comment_count: parseInt(video.comment_count),
    },
  });
}

export async function disconnectAccount(req, res) {
  const { social_id, account } = req.body;

  try {
    if (account === "twitter") {
      let twitter_profile = await prisma.twitter_profile.update({
        where: {
          id: social_id,
        },
        data: {
          profile_id: null,
        },
      });
      res.status(200).json(twitter_profile);
    } else if (account === 'youtube') {
      let youtube_profile = await prisma.youtube_profile.update({
        where: {
          id: social_id
        },
        data: {
          profile_id: null
        }
      })
      res.status(200).json(youtube_profile);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

export async function processTwitterUser(req, res) {
  const url = req.url;
  const profile_id = url.split("?id=")[1]?.split("&")[0];
  const twitter_user = req.user;

  if (profile_id === "undefined") {
    console.log("User not authorized");
    res.send("<script>window.close();</script > ");
    return;
  }

  let twitter_profile = await prisma.twitter_profile.findMany({
    where: {
      twitter_id: twitter_user._json.id_str,
      profile_id,
    },
  });

  if (twitter_profile.length) {
    console.log("Twitter account already connected");
  } else {
    twitter_profile = await prisma.twitter_profile.findMany({
      where: {
        twitter_id: twitter_user._json.id_str,
        profile_id: null,
      },
    });

    if (twitter_profile.length) {
      console.log("Twitter account present but not connected");
      twitter_profile = await prisma.twitter_profile.update({
        where: {
          id: twitter_profile[0].id,
        },
        data: {
          profile_id,
        },
      });
    } else {
      console.log(
        "Twitter account not present and not connected with any profile, connecting it..."
      );
      twitter_profile = await prisma.twitter_profile.create({
        data: {
          twitter_id: twitter_user._json.id_str,
          profile_id,
          name: twitter_user._json.name,
          username: twitter_user._json.screen_name,
          tweet_count: twitter_user._json.statuses_count,
          followers_count: twitter_user._json.followers_count,
          following_count: twitter_user._json.friends_count,
        },
      });

      let tweet_data = [];

      await axios
        .get(
          `https://api.twitter.com/2/users/${twitter_user._json.id_str}/tweets?max_results=10&exclude=retweets,replies&tweet.fields=public_metrics`,
          {
            headers: {
              Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
            },
          }
        )
        .then((res) =>
          res.data?.data?.map((item) =>
            tweet_data.push({ ...item, id: item.id })
          )
        );

      tweet_data
        .slice(0, 5)
        .map((tweet) => addTweet(tweet, twitter_profile.id));
    }
  }

  res.send("<script>window.close();</script > ");
}

export async function processYoutubeUser(req, res) {
  const url = req.url;
  let profile_id = req.query.state;
  const youtube_user = req.user;

  console.log("profile_id", profile_id)

  if (!profile_id) {
    console.log("User not authorized");
    res.send("<script>window.close();</script > ");
    return;
  }

  let youtube_profile = await prisma.youtube_profile.findMany({
    where: {
      youtube_id: youtube_user.id,
      profile_id,
    },
  });

  if (youtube_profile.length) {
    console.log("Youtube account already connected");
  } else {
    youtube_profile = await prisma.youtube_profile.findMany({
      where: {
        youtube_id: youtube_user.id,
        profile_id: null,
      },
    });

    if (youtube_profile.length) {
      console.log("Youtube account present but not connected");
      youtube_profile = await prisma.youtube_profile.update({
        where: {
          id: youtube_profile[0].id,
        },
        data: {
          profile_id,
        },
      });
    } else {
      console.log(
        "Youtube account not present and not connected with any profile, connecting it..."
      );

      let video_data = [],
        view_count,
        video_count,
        subscriber_count;

      await axios
        .get(
          `https://youtube.googleapis.com/youtube/v3/channels?part=statistics&part=status&id=${youtube_user.id}&key=${process.env.YOUTUBE_API_KEY}`
        )
        .then((res) => {
          let data = res.data.items[0].statistics;
          view_count = data.viewCount;
          video_count = data.videoCount;
          subscriber_count = data.subscriberCount;
        });

      youtube_profile = await prisma.youtube_profile.create({
        data: {
          youtube_id: youtube_user.id,
          profile_id,
          name: youtube_user.displayName,
          subscriber_count: parseInt(subscriber_count),
          video_count: parseInt(video_count),
          view_count: parseInt(view_count),
        },
      });

      await axios
        .get(
          `https://www.googleapis.com/youtube/v3/search?channelId=${youtube_user.id}&maxResults=10&order=date&type=video&key=${process.env.YOUTUBE_API_KEY}`
        )
        .then((res) =>
          res?.data?.items?.map((item) =>
            video_data.push({
              id: item.id.videoId,
            })
          )
        );

      let video_ids = "";
      video_data.map((item) => (video_ids += `&id=${item.id}`));
      video_data = [];

      if (video_ids.length) {
        await axios
          .get(
            `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&part=statistics${video_ids}&key=${process.env.YOUTUBE_API_KEY}`
          )
          .then((res) =>
            res?.data?.items?.map((item) =>
              video_data.push({
                id: item.id,
                title: item.snippet.title,
                view_count: item.statistics.viewCount,
                like_count: item.statistics.likeCount,
                comment_count: item.statistics.commentCount,
              })
            )
          );
      }

      // console.log(video_data)

      video_data
        .slice(0, 5)
        .map((video) => addVideo(video, youtube_profile.id));
    }
  }

  res.send("<script>window.close();</script > ");
}
