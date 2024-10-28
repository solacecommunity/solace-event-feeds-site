const path = require('path');

/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `Solace Feeds`,
    siteUrl: `https://www.feeds.solace.dev`,
    description: `A collection of feeds for Solace PubSub+`,
    author: `@SolaceDevs`,
  },
  plugins: [
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [
          `Open Sans\:300,400,600`, // you can also specify font weights and styles
        ],
        display: 'swap',
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Solace Feeds`,
        short_name: `SolaceFeeds`,
        start_url: `/`,
        icon: `static/favicon.ico`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `feeds`,
        path: path.resolve(process.env.HOME, '.stm/feeds'),
      },
    },
    {
      resolve: `gatsby-transformer-json`,
      options: {
        typeName: `FeedsJson`, // Set a custom type name for all feedinfo.json files
      },
    },
  ],
};
