import React from 'react';

export default function FAQ() {
  const faqs = [
    {
      question: 'What is TubeHeadlines?',
      answer: 'TubeHeadlines is a real-time video discovery platform that curates interesting and high-quality YouTube videos. We present them in a clean, headline-style format to help you discover content you might otherwise miss. Think of it as a better YouTube trending page that showcases great videos from creators of all sizes, with a special focus on helping emerging talent get discovered.'
    },
    {
      question: 'Why is TubeHeadlines great for small creators?',
      answer: 'The YouTube algorithm often favors established channels, making it difficult for new or small creators to break through. TubeHeadlines provides a level playing field where videos are featured based on the quality of the content, not the size of the channel. By getting featured, small creators can get their work in front of a new audience, gain valuable exposure, and attract new subscribers who genuinely appreciate their content.'
    },
    {
      question: 'How are videos selected?',
      answer: 'Videos are manually curated by our team based on quality, educational value, entertainment factor, and uniqueness. While we feature videos from creators of all sizes, we have a special passion for helping smaller channels get discovered. We look for content that is well-produced, engaging, and offers real value to viewers, regardless of subscriber count.'
    },
    {
      question: 'Do you host the videos?',
      answer: 'No, we don\'t host any videos. Every link takes you directly to the creator\'s YouTube channel. We\'re purely a discovery platform designed to drive traffic and views to the original creators. We believe in supporting creators by sending viewers directly to their channels where they can subscribe and engage.'
    },
    {
      question: 'Is TubeHeadlines free?',
      answer: 'Yes, TubeHeadlines is completely free to use with no subscriptions or hidden fees. Our mission is to help creators get discovered, and we believe this service should be accessible to everyone.'
    },
    {
      question: 'Who is TubeHeadlines for?',
      answer: 'TubeHeadlines is for curious viewers who want to discover amazing content beyond what the algorithm typically shows them. If you\'re tired of seeing the same big channels and want to find fresh perspectives or hidden gems, TubeHeadlines is for you.'
    },
    {
      question: 'Can I suggest videos?',
      answer: 'Currently we don\'t have a public submission system, but we\'re always looking for great content. We plan to add a community submission feature in the future based on user interest.'
    },
    {
      question: 'What types of videos do you feature?',
      answer: 'We feature a wide variety of content including educational videos, tutorials, documentaries, commentary, creative projects, and entertaining content. The common thread is that all videos come from talented creators who deserve more recognition.'
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
