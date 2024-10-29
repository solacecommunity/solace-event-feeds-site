exports.onCreateWebpackConfig = ({ stage, actions, getConfig }) => {
  const config = getConfig();

  if (stage === 'build-javascript' || stage === 'develop') {
    const miniCssExtractPlugin = config.plugins.find(
      (plugin) => plugin.constructor.name === 'MiniCssExtractPlugin'
    );

    if (miniCssExtractPlugin) {
      miniCssExtractPlugin.options.ignoreOrder = true;
    }

    actions.replaceWebpackConfig(config);
  }
};

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  const typeDefs = `
    type File implements Node {
      name: String
      relativePath: String
      publicURL: String
      childFeedsJson: FeedsJson @link
    }

    type FeedsJson implements Node {
      name: String
      description: String
      img: String
      type: String
      contributor: String
      github: String
      domain: String
      tags: String
      lastUpdated: Date @dateformat
    }
  `;
  createTypes(typeDefs);
};
