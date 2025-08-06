import React from 'react';
import SEO from './SEO';
import '../styles/FAQ.css';
// Updated to ensure deployment completes

const faqs = [
  {
    question: 'What is TubeHeadlines?',
    answer: 'TubeHeadlines is a real-time video discovery platform that gathers the latest and most popular videos from across YouTube. We present them in a fast, clean, easy-to-read headline format, helping you discover what\'s new and trending.'
  },
  {
    question: 'Who is TubeHeadlines for?',
    answer: 'TubeHeadlines is for anyone curious about what\'s capturing attention on YouTube right now. It\'s for viewers looking for interesting videos beyond their usual recommendations, and for small creators seeking a new platform to be discovered.'
  },
  {
    question: 'How are the headlines and videos chosen?',
    answer: 'Our system monitors a wide variety of YouTube channels. Videos are selected based on a combination of popularity, relevance, and our own editorial curation to give you a broad overview of what\'s making an impact on the platform.'
  },
  {
    question: 'How does TubeHeadlines help new creators?',
    answer: 'A core part of our mission is to help small creators break through the algorithm and get their content discovered by a wider audience. By featuring a diverse range of channels, we aim to be a platform where new talent can be found.'
  },
  {
    question: 'Where do the videos play? Do you take credit for them?',
    answer: 'We do not host any videos. TubeHeadlines is purely a discovery platform. Every headline and thumbnail links directly to the video on the creator\'s official YouTube channel. Our goal is to drive traffic and viewers to the original creators, and we take no credit for their amazing work.'
  },
  {
    question: 'How often is the site updated?',
    answer: 'TubeHeadlines is updated continuously throughout the day, every day. Our goal is to provide a live look at the videos that are currently trending or breaking.'
  },
  {
    question: 'Is TubeHeadlines free to use?',
    answer: 'Yes, TubeHeadlines is completely free for everyone to use. There are no subscriptions or hidden fees.'
  },
  {
    question: 'Can I suggest a video or channel?',
    answer: 'Currently, we do not have a public submission system. However, we are always looking to improve our sources and may add a feature like this in the future.'
  }
];

export default function FAQ() {
  return (
    <>
      <SEO 
        title="FAQ - TubeHeadlines"
        description="Frequently Asked Questions about TubeHeadlines. Learn about our mission, how we select videos, and how to use the site."
        path="/faq"
      />
      <div className="faq-container">
        <h1 className="faq-title">Frequently Asked Questions (FAQ)</h1>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <h2 className="faq-question">{faq.question}</h2>
              <p className="faq-answer">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
