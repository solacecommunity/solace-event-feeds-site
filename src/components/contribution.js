import React from 'react';
import CodeBlock from './codeBlock';
import '../css/carousel.css';

const Contribution = () => {
  return (
    <div>
      <br />
      <br />
      <br />
      <h2>1. Download STM</h2>
      <p>MacOS</p>
      <CodeBlock
        language="bash"
        value={`brew tap SolaceLabs/stm \nbrew install stm`}
      />
      <p>Linux (or WSL on Windows) </p>
      <CodeBlock
        language="bash"
        value={`echo "deb [arch=amd64 trusted=yes] https://raw.githubusercontent.com/SolaceLabs/apt-stm/master stm main" /\n| sudo tee  /etc/apt/sources.list.d/solace-stm-test.list\nsudo apt-get update\nsudo apt-get install stm
`}
      />
      <p>
        Visit the{' '}
        <a
          href="https://github.com/SolaceLabs/solace-tryme-cli"
          target="_blank"
          rel="noopener noreferrer"
        >
          Solace TryMe CLI GitHub page
        </a>{' '}
        for more infomraiton.
      </p>
      <h2>2. Generate your own feed</h2>
      <CodeBlock language="bash" value={`stm feed generate`} />
      <h2>3. Configure your own feed</h2>
      <CodeBlock language="bash" value={`stm feed configure`} />
      <h2>4. Contribute the feed</h2>
      <CodeBlock language="bash" value={`stm feed contribute`} />
      <p>
        Visit the{' '}
        <a
          href="https://solace.community/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Solace Community forum
        </a>{' '}
        for more discussions.
      </p>
    </div>
  );
};

export default Contribution;
