import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { twilight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaRegCopy } from 'react-icons/fa';
import { message } from 'antd';
import '../css/codeblock.css'; // Import CSS for styling

const CodeBlock = ({ language, value }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setTooltipVisible(true);
    message.success('Copied!');
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
      <button className="copy-button" onClick={handleCopy}>
        <FaRegCopy />
      </button>
      <SyntaxHighlighter language={language} style={twilight}>
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
