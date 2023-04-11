import axios from "axios";
import dotenv from "dotenv";
import { prisma } from "../../prisma.js";
dotenv.config();

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

export const updateYoutubeData = async (youtube_profile) => {
  let video_data = [],
    view_count,
    video_count,
    subscriber_count,
    channel_name;

  try {
    await axios
      .get(
        `https://youtube.googleapis.com/youtube/v3/channels?part=statistics&part=snippet&id=${youtube_profile.youtube_id}&key=${process.env.YOUTUBE_API_KEY}`
      )
      .then((res) => {
        let data = res.data.items[0].statistics;
        view_count = data.viewCount;
        video_count = data.videoCount;
        subscriber_count = data.subscriberCount;
        channel_name = res.data.items[0].snippet.title;
      });

    const result = await prisma.youtube_profile.update({
      where: {
        id: youtube_profile.id,
      },
      data: {
        name: channel_name,
        subscriber_count: parseInt(subscriber_count),
        video_count: parseInt(video_count),
        view_count: parseInt(view_count),
      },
    });

    await axios
      .get(
        `https://www.googleapis.com/youtube/v3/search?channelId=${youtube_profile.youtube_id}&maxResults=10&order=date&type=video&key=${process.env.YOUTUBE_API_KEY}`
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

    if (video_data[0].id === youtube_profile.recent_videos[0].video_id) {
      console.log("No new videos");
    } else {
      console.log("New videos");
      video_data
        .slice(0, 5)
        .map((video) => addVideo(video, youtube_profile.id));
    }

    // console.log("Result is ", result);
  } catch (err) {
    console.log("Error ", err);
  }
};
