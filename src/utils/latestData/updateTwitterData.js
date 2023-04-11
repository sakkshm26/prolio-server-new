import axios from "axios";
import { prisma } from "../../prisma.js";
import dotenv from "dotenv";
dotenv.config();

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

export const updateTwitterData = async (twitter_profile) => {
  let tweet_data = [];
  try {
    const response = await axios.get(
      `https://api.twitter.com/2/users/${twitter_profile.twitter_id}?user.fields=public_metrics`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      }
    );

    await axios
      .get(
        `https://api.twitter.com/2/users/${twitter_profile.twitter_id}/tweets?max_results=10&exclude=retweets,replies&tweet.fields=public_metrics`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          },
        }
      )
      .then((res) =>
        res.data?.data?.map((item) => tweet_data.push({ ...item, id: item.id }))
      );

    if (tweet_data[0].id === twitter_profile.recent_tweets[0].tweet_id) {
      console.log("No new tweets");
    } else {
      console.log("New tweets");
      tweet_data
        .slice(0, 5)
        .map((tweet) => addTweet(tweet, twitter_profile.id));
    }

    // console.log(response.data)

    const result = await prisma.twitter_profile.update({
      where: {
        id: twitter_profile.id,
      },
      data: {
        name: response.data.data.name,
        username: response.data.data.username,
        tweet_count: response.data.data.public_metrics.tweet_count,
        followers_count: response.data.data.public_metrics.followers_count,
        following_count: response.data.data.public_metrics.following_count,
      },
    });

    // console.log("Result is ", result);
  } catch (err) {
    console.log(err);
  }
};
