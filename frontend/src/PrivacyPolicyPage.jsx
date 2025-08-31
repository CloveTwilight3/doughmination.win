/*
MIT License

Copyright (c) 2025 Clove Twilight

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Privacy Policy</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Last Updated: May 14, 2025</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">Introduction</h2>
        <p>
          Welcome to the Doughmination System website. This Privacy Policy explains how we collect, use, disclose, 
          and safeguard your information when you visit our website, including any other media form, media channel, 
          mobile website, or mobile application related or connected to it (collectively, the "Site").
        </p>
        <p>
          We respect your privacy and are committed to protecting personally identifiable information you may provide us 
          through the Site. We have adopted this privacy policy to explain what information may be collected on our Site, 
          how we use this information, and under what circumstances we may disclose the information to third parties.
        </p>
        <p>
          This Privacy Policy applies to information we collect on this Site and through emails or other electronic 
          communications between you and the Site. This privacy policy does not apply to information collected by us offline 
          or through any other means, including on any other website operated by any third party.
        </p>
        <p>
          Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
          please do not access the Site.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">Information We Collect</h2>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Personal Data</h3>
        <p>
          We may collect personal identification information from users in various ways, including, but not limited to, 
          when users visit our site, register on the site, and in connection with other activities, services, features, 
          or resources we make available on our Site. Users may visit our Site anonymously. We will collect personal 
          identification information from users only if they voluntarily submit such information to us.
        </p>
        <p>The personal information we may collect includes:</p>
        <ul className="list-disc ml-6 mb-4">
          <li>Name</li>
          <li>Email address</li>
          <li>Username</li>
          <li>Avatar images</li>
          <li>Any other information you choose to provide</li>
        </ul>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Usage Data</h3>
        <p>
          We may also collect information on how the Site is accessed and used ("Usage Data"). This Usage Data may include 
          information such as your computer's Internet Protocol address (IP address), browser type, browser version, 
          the pages of our Site that you visit, the time and date of your visit, the time spent on those pages, 
          unique device identifiers, and other diagnostic data.
        </p>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Cookies and Web Beacons</h3>
        <p>
          Our Site may use "cookies" to enhance user experience. A cookie is a small piece of data stored on your 
          device that helps us improve your experience by understanding how you use our Site. You can instruct your 
          browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, 
          you may not be able to use some portions of our Site.
        </p>
        <p>We use the following types of cookies:</p>
        <ul className="list-disc ml-6 mb-4">
          <li><strong>Essential Cookies</strong>: Required for the operation of our Site.</li>
          <li><strong>Analytical/Performance Cookies</strong>: Allow us to recognize and count the number of visitors and see how visitors move around our Site.</li>
          <li><strong>Functionality Cookies</strong>: Used to recognize you when you return to our Site.</li>
          <li><strong>Targeting Cookies</strong>: Record your visit to our Site, the pages you have visited, and the links you have followed. These cookies may be used to deliver advertisements more relevant to you and your interests.</li>
        </ul>
        <p>
          For more detailed information about the cookies we use, please see our <Link to="/cookies-policy" className="text-blue-500 hover:underline">Cookies Policy</Link>.
        </p>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Google Analytics and Advertising</h3>
        <p>
          We use Google Analytics to help analyze how users use the Site. Google Analytics uses cookies to collect 
          standard internet log information and visitor behavior information. The information generated by the cookie 
          about your use of the Site is transmitted to Google. This information is used to evaluate visitors' use of 
          the Site and to compile statistical reports on Site activity.
        </p>
        <p>
          We also use Google AdSense to serve advertisements. Google AdSense may use cookies to personalize the 
          advertisements you see. For more information on how Google uses data when you use our Site, please visit 
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">Google's Privacy Policy</a>.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">How We Use Your Information</h2>
        <p>We may use the information we collect from you for the following purposes:</p>
        <ul className="list-disc ml-6 mb-4">
          <li>To provide and maintain our Site</li>
          <li>To notify you about changes to our Site</li>
          <li>To allow you to participate in interactive features of our Site when you choose to do so</li>
          <li>To provide customer support</li>
          <li>To gather analysis or valuable information so that we can improve our Site</li>
          <li>To monitor the usage of our Site</li>
          <li>To detect, prevent and address technical issues</li>
          <li>To provide you with news, special offers and general information about other goods, services and events which we offer that are similar to those that you have already purchased or enquired about unless you have opted not to receive such information</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">Disclosure of Your Information</h2>
        <p>We may disclose personal information that we collect or you provide:</p>
        <ul className="list-disc ml-6 mb-4">
          <li>To comply with any court order, law, or legal process, including to respond to any government or regulatory request</li>
          <li>To enforce our rights arising from any contracts entered into between you and us</li>
          <li>If we believe disclosure is necessary or appropriate to protect the rights, property, or safety of the Doughmination System, our users, or others</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">Third-Party Use of Cookies and Other Tracking Technologies</h2>
        <p>
          Some content or applications on the Site are served by third parties, including content providers and application 
          providers. These third parties may use cookies or other tracking technologies to collect information about you 
          when you use our Site. We do not control these third parties' tracking technologies or how they may be used.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">Data Security</h2>
        <p>
          We have implemented measures designed to secure your personal information from accidental loss and from 
          unauthorized access, use, alteration, and disclosure. However, the transmission of information via the internet 
          is not completely secure. We cannot guarantee the security of your personal information transmitted to our Site.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">Children's Privacy</h2>
        <p>
          Our Site is not intended for children under the age of 13. We do not knowingly collect personal information 
          from children under 13. If you are a parent or guardian and you are aware that your child has provided us 
          with personal information, please contact us so that we can take necessary actions.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
          Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy. 
          You are advised to review this Privacy Policy periodically for any changes.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
        <ul className="list-disc ml-6 mb-4">
          <li>Email: admin@clovetwilight3.co.uk</li>
        </ul>
      </div>
      
      <div className="mt-8 pt-4 border-t dark:border-gray-700">
        <Link to="/" className="text-blue-500 dark:text-blue-400 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;