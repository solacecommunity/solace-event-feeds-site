/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `Solace Feeds`,
    siteUrl: `https://www.feeds.solace.dev`,
    description: `A collection of feeds for Solace PubSub+`,
    author: `@SolaceDevs`
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
        display: "swap",
      },
    }
  ],
}
