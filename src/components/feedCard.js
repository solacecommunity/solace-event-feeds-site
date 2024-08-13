import React from "react"
import { Col } from "react-bootstrap"

const FeedCard = (props) => {
  let feed = props.feed
  let title = feed.name.replace(/_/g, ' ')
  return (
    <Col key={feed.name} xs={12} sm={12} md={6} lg={4} xl={4} xxl={3} className="mt3 mb3">
        <div key={feed.name} className="custom-card">
          <div className="icon">
            <img src={feed.img ? feed.img : null} alt={feed.name} width="100px" />
          </div>
          <div className="title">{title}</div>
          <div className="link">Open Feed</div>
        </div>
    </Col>
  )
}
export default FeedCard
