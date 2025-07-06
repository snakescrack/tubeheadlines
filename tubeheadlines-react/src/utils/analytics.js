// Google Analytics 4 utility functions
export const GA_MEASUREMENT_ID = 'G-SVJLLJKJHR';

export const init = () => {
  if (window.gtag) {
    console.log('Google Analytics initialized');
  } else {
    console.warn('gtag not found, analytics not initialized');
  }
};

export const pageview = (title, location, path) => {
  if (window.gtag) {
    console.log('Sending pageview:', { title, location, path });
    window.gtag('event', 'page_view', {
      page_title: title,
      page_location: location,
      page_path: path,
    });
  } else {
    console.warn('gtag not found');
  }
};

export const event = ({ action, category, label, value }) => {
  if (window.gtag) {
    console.log('Sending event:', { action, category, label, value });
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } else {
    console.warn('gtag not found');
  }
};
