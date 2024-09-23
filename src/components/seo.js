import React from "react"
import PropTypes from "prop-types"
import Helmet from "react-helmet"

function SEO({ description="Solace Realtime EventDriven Feeds", lang="en", meta=[], title }) {

  return (
    <Helmet
      title={title}
      meta={[
        {
          name: `description`,
          content: description,
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:description`,
          content: description,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          property: `og:image`,
          content: "https://solace-dev-tutorials.netlify.app/solace-dev-meta-og-image.png",
        },
        {
          name: `twitter:card`,
          content: `summary_large_image`,
        },
        {
          name: `twitter:image`,
          content: "https://solace-dev-tutorials.netlify.app/solace-dev-meta-og-image.png",
        },
        {
          name: `twitter:title`,
          content: title,
        },
        {
          name: `twitter:description`,
          content: description,
        },
      ].concat(meta)}
    />
  )
}

SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string.isRequired,
}

export default SEO