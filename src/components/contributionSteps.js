import React, { useState } from 'react';
import { message, Steps, Card } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';

const YouTubeVideoCard = ({ videoId }) => {
  return (
    <Card bordered={false}>
      <iframe
        width="40%"
        height="40%"
        style={{ aspectRatio: '1 / 1' }}
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </Card>
  );
};

const StepOne = <YouTubeVideoCard videoId="jt5HLptVvbM" />;

const StepTwo = <YouTubeVideoCard videoId="vj2uVCeD5hY" />;

const StepThree = <YouTubeVideoCard videoId="jt5HLptVvbM" />;

const StepFour = <YouTubeVideoCard videoId="vj2uVCeD5hY" />;

const StepFive = <YouTubeVideoCard videoId="jt5HLptVvbM" />;

const steps = [
  {
    title: 'Setup',
    content: StepOne,
  },
  {
    title: 'Download STM',
    content: StepTwo,
  },
  {
    title: 'Generate a feed',
    content: StepThree,
  },
  {
    title: 'Configure the feed',
    content: StepFour,
  },
  {
    title: 'Contribute the feed',
    content: StepFive,
  },
];

const App = () => {
  const [current, setCurrent] = useState(0);
  const [percent, setPercent] = useState(0);

  const next = () => {
    setCurrent(current + 1);
    console.log(current);
    console.log(steps.length);
    if (current + 2 === steps.length) {
      setPercent(100);
      message.success('Made it to the end!');
    } else {
      setPercent(((current + 1) / steps.length) * 100);
    }
  };

  const prev = () => {
    setCurrent(current - 1);
    setPercent(((current - 1) / steps.length) * 100);
  };

  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }));
  const contentStyle = {
    textAlign: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: '20px',
    marginTop: 16,
  };
  return (
    <>
      <Steps percent={percent} current={current} items={items} />
      <div style={contentStyle}>{steps[current].content}</div>
      <div
        style={{
          marginTop: 24,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {current > 0 && (
          <LeftOutlined
            style={{ fontSize: '24px', cursor: 'pointer' }}
            onClick={() => prev()}
          />
        )}
        {current < steps.length - 1 && (
          <RightOutlined
            style={{ fontSize: '24px', cursor: 'pointer' }}
            onClick={() => next()}
          />
        )}
      </div>
    </>
  );
};
export default App;
