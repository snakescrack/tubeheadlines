import SEO from './SEO';

export default function Privacy() {
  return (
    <>
      <SEO 
        title="Privacy Policy - TubeHeadlines"
        description="Learn about how TubeHeadlines protects your privacy and handles your data."
        path="/privacy"
      />
      <div className="privacy-policy">
      <h1>TubeHeadlines Privacy Policy</h1>
      <p>Last Updated: {new Date().toLocaleDateString()}</p>

      <h2>SECTION 1 – WHO WE ARE</h2>
      <p>A reference to "TubeHeadlines," "we," or "our" means TubeHeadlines (tubeheadlines.com).</p>
      <p>TubeHeadlines provides curated YouTube video headlines with links to current events worldwide. We operate a website that provides information to the public and displays relevant online advertising to end users ("End Users") who interact with our Digital Properties.</p>

      <h2>SECTION 2 – THINGS WE PROMISE NOT TO DO</h2>
      <p>This Section covers the specific things that we promise not to do that you might be concerned about:</p>
      <ul>
        <li>We do not collect your email address, name, or telephone number(s) in order to use our website.</li>
        <li>We do not send marketing or sales emails to you.</li>
        <li>We do not store any personal information beyond basic analytics data.</li>
      </ul>

      <h2>SECTION 3 – PRIVACY FOR THE TUBEHEADLINES PROPERTIES</h2>
      
      <h3>3.1 WHAT INFORMATION DO WE COLLECT?</h3>
      <p>Information we collect automatically:</p>
      <ul>
        <li>Visit counts (24-hour, monthly, and yearly statistics)</li>
        <li>Pages accessed on our website</li>
        <li>Browser type and version</li>
        <li>Time and duration of visits</li>
      </ul>

      <h3>3.2 HOW DO WE USE YOUR INFORMATION?</h3>
      <p>We use information collected for the following purposes:</p>
      <ul>
        <li>Website traffic analysis</li>
        <li>Site performance monitoring</li>
        <li>Display of aggregate visit statistics</li>
        <li>To improve user experience</li>
      </ul>

      <h3>3.3 COOKIES AND SIMILAR TRACKING TECHNOLOGIES</h3>
      <p>We use Firebase Analytics to collect anonymous usage statistics. We do not use any other tracking cookies or similar technologies.</p>

      <h3>3.4 USE OF TUBEHEADLINES BY MINORS</h3>
      <p>The TubeHeadlines Properties are not intended for nor directed to individuals that are deemed to be children under applicable data protection or privacy laws.</p>

      <h2>SECTION 4 – GENERAL INFORMATION</h2>

      <h3>4.1 HOW DO WE SHARE YOUR INFORMATION?</h3>
      <p>Information we collect may be disclosed:</p>
      <ul>
        <li>To our service providers (Firebase) for data storage and analytics</li>
        <li>For legal purposes when required by law</li>
        <li>In aggregate, anonymous form for analytics</li>
      </ul>

      <h3>4.2 YOUR OPT-OUT CHOICES</h3>
      <p>Since we only collect anonymous analytics data and do not use marketing emails or additional tracking cookies, there is no need to opt out of data collection.</p>

      <h3>4.3 DATA PROTECTION RIGHTS</h3>
      <p>Under GDPR and other applicable laws, you have the following rights:</p>
      <ul>
        <li>Right to access your data</li>
        <li>Right to erasure (deletion) of your data</li>
        <li>Right to object to processing</li>
        <li>Right to data portability</li>
      </ul>

      <h3>4.4 LEGAL BASIS FOR PROCESSING</h3>
      <p>We process your information based on:</p>
      <ul>
        <li>Legitimate interests (website analytics and performance)</li>
        <li>Legal obligations when required</li>
      </ul>

      <h3>4.5 THIRD PARTIES</h3>
      <p>Our website includes links to:</p>
      <ul>
        <li>YouTube videos (which has its own privacy policy)</li>
        <li>Firebase (for analytics and data storage)</li>
      </ul>

      <h3>4.6 HOW DO WE KEEP YOUR INFORMATION SECURE?</h3>
      <p>We use Firebase's security features to protect all stored data. All analytics data is anonymous and aggregated.</p>

      <h3>4.7 RETENTION OF INFORMATION</h3>
      <p>We retain anonymous analytics data for up to 26 months, after which it is automatically deleted by Firebase.</p>

      <h3>4.8 INTERNATIONAL DATA TRANSFERS</h3>
      <p>Our services are hosted in the United States through Firebase. By using our service, you consent to your data being transferred to and processed in the United States.</p>

      <h3>4.9 UPDATES TO THIS POLICY</h3>
      <p>We will review and update this Policy periodically and will note the date of its most recent revision above. Material changes will be posted on this page.</p>

      <h3>4.10 CONTACTING US</h3>
      <p>If you have any questions about this Policy or TubeHeadlines' privacy practices, please contact us at:</p>
      <p>Email: info@tubeheadlines.com</p>

      <div className="copyright">
        <p>Copyright {new Date().getFullYear()} TubeHeadlines</p>
      </div>
    </div>
    </>
  );
}
