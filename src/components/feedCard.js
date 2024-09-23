import React from "react"

const FeedCard = (props) => {
  let feed = props.feed
  let title = feed.name.replace(/_/g, ' ')
  // if the feed.image contains the word default then change it to ./defaultfeed.png
  feed.img = feed.img.includes("default") ? "./defaultfeed.png" : feed.img
  return (
    <a href='/'>
      <div className="custom-card">
        <div className="icon">
          <img src={feed.img ? feed.img : "./defaultfeed.png"} alt={feed.name} width="100px" />
        </div>
        <div className="title">{title}</div>
        <div className="link">Open Feed</div>
      </div>
    </a>
  )
}
export default FeedCard
