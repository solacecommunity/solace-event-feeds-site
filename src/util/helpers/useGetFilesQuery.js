import { useStaticQuery, graphql } from 'gatsby';

const useGetFilesQuery = (feedName) => {
  const data = useStaticQuery(graphql`
    query {
      allFile(filter: { extension: { eq: "json" } }) {
        nodes {
          name
          relativePath
          publicURL
        }
      }
    }
  `);

  return data.allFile.nodes.filter(({ relativePath }) =>
    relativePath.includes(feedName)
  );
};

export default useGetFilesQuery;
