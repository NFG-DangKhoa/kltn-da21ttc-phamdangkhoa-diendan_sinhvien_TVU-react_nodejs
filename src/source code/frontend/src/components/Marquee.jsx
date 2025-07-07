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
  position: fixed;
  top: ${props => props.isMemberList ? '64px' : '104px'};
  left: 0;
  z-index: 1200;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  border: 1px solid rgba(0,0,0,0.1);
  width: 100%;
  margin-bottom: 0px;
`;



const MarqueeContent = styled.div`
  display: inline-block;
  padding-left: 100%;
  animation: ${marqueeAnimation} 20s linear infinite;
  font-family: 'Arial', sans-serif; /* Or a more attractive font like 'Roboto', 'Open Sans' if imported */
  font-size: 1.1em;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
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
      <MarqueeContent><VolumeUp sx={{ fontSize: '1.2em', verticalAlign: 'middle', mr: 1 }} />{marquee.content}</MarqueeContent>
    </MarqueeContainer>
  );
};

export default Marquee;
