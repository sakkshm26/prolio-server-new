-- CreateTable
CREATE TABLE "profile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT,
    "email_id" TEXT,
    "email_text" TEXT,
    "web_url" TEXT,
    "web_url_text" TEXT,
    "bio" TEXT,
    "profile_image" TEXT,
    "update_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tweet" (
    "id" TEXT NOT NULL,
    "tweet_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "retweet_count" INTEGER NOT NULL,
    "reply_count" INTEGER NOT NULL,
    "like_count" INTEGER NOT NULL,
    "twitter_profile_id" TEXT NOT NULL,

    CONSTRAINT "tweet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "twitter_profile" (
    "id" TEXT NOT NULL,
    "twitter_id" TEXT NOT NULL,
    "profile_id" TEXT,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "tweet_count" INTEGER NOT NULL,
    "followers_count" INTEGER NOT NULL,
    "following_count" INTEGER NOT NULL,

    CONSTRAINT "twitter_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youtube_profile" (
    "id" TEXT NOT NULL,
    "youtube_id" TEXT NOT NULL,
    "profile_id" TEXT,
    "name" TEXT NOT NULL,
    "subscriber_count" INTEGER NOT NULL,
    "video_count" INTEGER NOT NULL,
    "view_count" INTEGER NOT NULL,

    CONSTRAINT "youtube_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youtube_video" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL,
    "like_count" INTEGER NOT NULL,
    "comment_count" INTEGER NOT NULL,
    "youtube_profile_id" TEXT NOT NULL,

    CONSTRAINT "youtube_video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_username_key" ON "profile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tweet" ADD CONSTRAINT "tweet_twitter_profile_id_fkey" FOREIGN KEY ("twitter_profile_id") REFERENCES "twitter_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "twitter_profile" ADD CONSTRAINT "twitter_profile_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youtube_profile" ADD CONSTRAINT "youtube_profile_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youtube_video" ADD CONSTRAINT "youtube_video_youtube_profile_id_fkey" FOREIGN KEY ("youtube_profile_id") REFERENCES "youtube_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
