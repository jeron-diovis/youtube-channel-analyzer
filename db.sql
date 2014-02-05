use vsp_test;

CREATE TABLE IF NOT EXISTS channel (
  id varchar(64) NOT NULL
  , name varchar(255) NOT NULL
  , moviesListId varchar(255) NOT NULL
  , address varchar(255)
  , subscriberCount int DEFAULT 0
  , videoCount int DEFAULT 0
  , viewCount int DEFAULT 0
  , PRIMARY KEY(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS movie (
  id varchar(64) NOT NULL
  , channelId varchar(64) NOT NULL
  , videoId varchar(64) NOT NULL
  , title varchar(255)
  , link varchar(255)
  , description text
  , PRIMARY KEY(id)
) ENGINE=InnoDB;

CREATE UNIQUE INDEX movie_channel_video ON movie (channelId, videoId);