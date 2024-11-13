// SentimentAnalysis.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ProgressBar } from 'react-bootstrap';

const AZURE_TEXT_ANALYTICS_KEY = process.env.REACT_APP_AZURE_TEXT_ANALYTICS_KEY;
const AZURE_TEXT_ANALYTICS_ENDPOINT = process.env.REACT_APP_AZURE_TEXT_ANALYTICS_ENDPOINT;

const SentimentAnalysis = ({ transcript }) => {
  const [sentimentScore, setSentimentScore] = useState(null);
  const [sentimentLabel, setSentimentLabel] = useState('Neutral');

  useEffect(() => {
    if (transcript) {
      analyzeSentiment(transcript);
    }
  }, [transcript]);

  const analyzeSentiment = async (text) => {
    try {
      const response = await axios.post(
        `${AZURE_TEXT_ANALYTICS_ENDPOINT}/text/analytics/v3.1/sentiment`,
        { documents: [{ id: '1', language: 'en', text }] },
        {
          headers: {
            'Ocp-Apim-Subscription-Key': AZURE_TEXT_ANALYTICS_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const sentiment = response.data.documents[0].confidenceScores;
      const score = sentiment.positive - sentiment.negative;

      setSentimentScore(score);

      if (score > 0.5) {
        setSentimentLabel('Positive');
      } else if (score < -0.5) {
        setSentimentLabel('Negative');
      } else {
        setSentimentLabel('Neutral');
      }
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
    }
  };

  const renderSentimentMeter = () => {
    const percentage = Math.abs(sentimentScore) * 100;
    const variant = sentimentLabel === 'Positive' ? 'success' : sentimentLabel === 'Negative' ? 'danger' : 'warning';

    return (
      <div className="mt-3">
        <h5>Sentiment Meter: {sentimentLabel}</h5>
        <ProgressBar now={percentage} variant={variant} label={`${Math.round(percentage)}%`} />
      </div>
    );
  };

  return (
    <div>
      {renderSentimentMeter()}
    </div>
  );
};

export default SentimentAnalysis;