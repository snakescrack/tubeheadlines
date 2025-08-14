import React from 'react';

export default function FAQ() {
  const faqs = [
    {
      question: 'What is TubeHeadlines?',
      answer: 'TubeHeadlines is a real-time video discovery platform that curates the most interesting YouTube videos from small creators (under 100k subscribers). We present them in a clean, headline-style format to help you discover quality content that you might otherwise miss. Think of it as a better YouTube trending page that actually showcases great content from emerging creators.'
    },
    {
      question: 'How are videos selected?',
      answer: 'Videos are manually curated by our team based on quality, educational value, entertainment factor, and uniqueness. We focus exclusively on creators with under 100k subscribers to help small channels get discovered. We look for content that is well-produced, engaging, and offers real value to viewers.'
    },
    {
      question: 'Do you host the videos?',
      answer: 'No, we don\'t host any videos. Every link takes you directly to the creator\'s YouTube channel. We\'re purely a discovery platform designed to drive traffic and views to the original creators. We believe in supporting creators by sending viewers directly to their channels where they can subscribe and engage.'
    },
    {
      question: 'Is TubeHeadlines free?',
      answer: 'Yes, TubeHeadlines is completely free to use with no subscriptions, hidden fees, or premium tiers. Our mission is to help small creators get discovered, and we believe this service should be accessible to everyone.'
    },
    {
      question: 'Who is TubeHeadlines for?',
      answer: 'TubeHeadlines is for anyone who wants to discover amazing content beyond the mainstream. Whether you\'re tired of seeing the same big channels dominate your recommendations, looking for fresh perspectives, or wanting to support small creators, TubeHeadlines helps you find hidden gems in the YouTube ecosystem.'
    },
    {
      question: 'Can I suggest videos?',
      answer: 'Currently we don\'t have a public submission system, but we\'re always looking for great content to feature. We\'re considering adding a community submission feature in the future based on user interest and feedback.'
    },
    {
      question: 'How often is content updated?',
      answer: 'We add new videos regularly throughout the week. Our goal is to keep the content fresh and ensure there\'s always something new to discover when you visit the site.'
    },
    {
      question: 'What types of videos do you feature?',
      answer: 'We feature a wide variety of content including educational videos, tutorials, documentaries, commentary, creative projects, and entertaining content. The common thread is that all videos come from talented creators with smaller audiences who deserve more recognition.'
    }
  ];

  return (
    <div style={{maxWidth: '800px', margin: '2rem auto', padding: '2rem', fontFamily: 'Arial, sans-serif'}}>
      <h1 style={{textAlign: 'center', marginBottom: '2rem', color: '#333'}}>Frequently Asked Questions</h1>
      
      {faqs.map((faq, index) => (
        <div key={index} style={{marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1.5rem'}}>
          <h2 style={{color: '#333', marginBottom: '0.8rem', fontSize: '1.2rem'}}>{faq.question}</h2>
          <p style={{color: '#555', lineHeight: '1.6', margin: '0'}}>{faq.answer}</p>
        </div>
      ))}
      
      <div style={{marginTop: '3rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center'}}>
        <p style={{color: '#666', margin: '0', fontSize: '0.9rem'}}>
          Have more questions? Feel free to reach out to us through our social media channels or contact page.
        </p>
      </div>
    </div>
  );
}
