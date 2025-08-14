import SEO from './SEO';

export default function Terms() {
  return (
    <>
      <SEO 
        title="Terms of Service - TubeHeadlines"
        description="Read our Terms of Service to understand the rules and guidelines for using TubeHeadlines."
        path="/terms"
      />
      <div className="terms-of-service">
        <h1>TubeHeadlines Terms of Service</h1>
        <p>Last Updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using TubeHeadlines, you accept and agree to be bound by these Terms of Service.</p>

        <h2>2. Description of Service</h2>
        <p>TubeHeadlines provides a curated collection of YouTube video headlines and links organized by category.</p>

        <h2>3. YouTube Content</h2>
        <p>All video content is hosted by YouTube and subject to YouTube's Terms of Service. We do not host any video content directly.</p>

        <h2>4. User Conduct</h2>
        <p>Users agree to:</p>
        <ul>
          <li>Use the service for lawful purposes only</li>
          <li>Not attempt to circumvent any security measures</li>
          <li>Not interfere with the proper operation of the site</li>
        </ul>

        <h2>5. Intellectual Property</h2>
        <p>The TubeHeadlines name, logo, and site layout are protected by copyright and other intellectual property laws.</p>

        <h2>6. Third Party Links</h2>
        <p>Our service contains links to YouTube. We are not responsible for third-party content or websites.</p>

        <h2>7. Disclaimer of Warranties</h2>
        <p>The service is provided "as is" without any warranties, express or implied.</p>

        <h2>8. Limitation of Liability</h2>
        <p>TubeHeadlines shall not be liable for any indirect, incidental, or consequential damages.</p>

        <h2>9. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Changes will be posted on this page.</p>

        <h2>10. Contact</h2>
        <p>For questions about these Terms, contact: info@tubeheadlines.com</p>

        <div className="copyright">
          <p>Copyright {new Date().getFullYear()} TubeHeadlines</p>
        </div>
      </div>
    </>
  );
}
