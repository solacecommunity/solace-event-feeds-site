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
