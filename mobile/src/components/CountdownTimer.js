import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CountdownTimer = ({ targetTime, onExpired, format = 'full' }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeRemaining('Started');
        setIsExpired(true);
        if (onExpired) onExpired();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (format === 'full') {
        if (days > 0) {
          setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeRemaining(`${minutes}m ${seconds}s`);
        } else {
          setTimeRemaining(`${seconds}s`);
        }
      } else if (format === 'compact') {
        if (days > 0) {
          setTimeRemaining(`${days}d`);
        } else if (hours > 0) {
          setTimeRemaining(`${hours}h`);
        } else if (minutes > 0) {
          setTimeRemaining(`${minutes}m`);
        } else {
          setTimeRemaining(`${seconds}s`);
        }
      } else if (format === 'hms') {
        setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onExpired, format]);

  return (
    <View style={styles.container}>
      <Text style={[styles.text, isExpired && styles.expired]}>{timeRemaining}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  expired: {
    color: '#888',
    textDecorationLine: 'line-through',
  },
});

export default CountdownTimer;
