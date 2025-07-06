import React, { useState, useEffect } from 'react';
import { getActiveMarquee } from '../services/marqueeService';
import { VolumeUp } from '@mui/icons-material';
import styled, { keyframes } from 'styled-components';

const marqueeAnimation = keyframes`
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
`;

const MarqueeContainer = styled.div`
  background-color: ${props => props.bgColor || '#f8d7da'};
  color: #333;
  padding: 10px;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  border: 1px solid rgba(0,0,0,0.1);
  width: 100%;
  margin-bottom: 20px;
`;

const MarqueeIcon = styled(VolumeUp)`
  margin-right: 15px;
  font-size: 1.5em;
`;

const MarqueeContent = styled.div`
  display: inline-block;
  padding-left: 100%;
  animation: ${marqueeAnimation} 10s linear infinite;
`;

const Marquee = () => {
  const [marquee, setMarquee] = useState(null);

  useEffect(() => {
    const fetchMarquee = async () => {
      try {
        console.log('Fetching active marquee...');
        const res = await getActiveMarquee();
        console.log('Marquee data received:', res.data);
        setMarquee(res.data);
      } catch (error) {
        console.error('Error fetching active marquee:', error);
      }
    };
    fetchMarquee();
  }, []);

  if (!marquee) {
    return null;
  }

  return (
    <MarqueeContainer bgColor={marquee.backgroundColor}>
      <MarqueeIcon />
      <MarqueeContent>{marquee.content}</MarqueeContent>
    </MarqueeContainer>
  );
};

export default Marquee;
