const getVideoInFormat = ({ videos = [] }) => {
  return videos.map((video) => ({
    _id: video._id,
    title: video.title,
    creator: video.creator.name,
    creatorImgUrl: video.creator.img_url,
    description: video.description,
    duration: video.duration,
    category: video.category.name,
  }));
};

module.exports = { getVideoInFormat };
