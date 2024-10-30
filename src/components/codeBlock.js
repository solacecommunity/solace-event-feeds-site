import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { twilight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaRegCopy } from 'react-icons/fa';
import { Tooltip } from 'antd';
import '../css/codeblock.css'; // Import CSS for styling

const CodeBlock = ({ language, value }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setTooltipVisible(true);
  };

  useEffect(() => {
    if (tooltipVisible) {
      const timer = setTimeout(() => {
        setTooltipVisible(false);
      }, 1000); // Hide tooltip after 1 second

      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [tooltipVisible]);

  return (
    <div className="code-block-container">
      <Tooltip title="Copied!" visible={tooltipVisible}>
        <button className="copy-button" onClick={handleCopy}>
          <FaRegCopy />
        </button>
      </Tooltip>
      <SyntaxHighlighter language={language} style={twilight}>
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
