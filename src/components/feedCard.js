import React from 'react';
import asyncapiLogo from '../images/asyncapi.png';
import restLogo from '../images/rest.png';
import { Link } from 'gatsby';

const FeedCard = (props) => {
  let feed = props.feed;
  console.log(feed);
  let title = feed.name.replace(/_/g, ' ');
  // if the feed.image contains the word default then change it to ./defaultfeed.png
  feed.img = feed.img.includes('default') ? './defaultfeed.png' : feed.img;
  return (
    <Link
      // to={`/feed/?name=${feed.name}&decription=${feed.description}&contributor=${feed.contributor}&domain=${feed.domain}&img=${feed.img}&type=${feed.type}`}
      to={`/feed/?name=${encodeURIComponent(feed.name)}&isLocal=${props.isLocal}&type=${feed.type}`}
      style={{ textDecoration: 'none' }}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="custom-card">
        <div className="icon">
          {/* <img src="./defaultfeed.png" alt={feed.name} width="80px" /> */}
          <img
            src={feed.img ? feed.img : './defaultfeed.png'}
            alt={feed.name}
            width="80px"
          />
        </div>
        <div className="title">{title}</div>
        <div className="link">{feed.domain}</div>
        <div className="desc">{feed.contributor}</div>
      </div>
    </Link>
  );
};
export default FeedCard;
