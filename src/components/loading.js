import React from 'react';
import '../css/loading.css';

const Loading = (props) => {
  let section = props.section;
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <div className="laodingSection">
        Loading {section}...
      </div>
    </div>
  );
};

export default Loading;