  import React from 'react';

//import './components/Certificatetemplate.css'; // Import the CSS file
//import CertificateForm from'./components/CertificateForm';
import CertificateGenerator from './components/CertificateGenerator';
function App() {
  return (
    <div>
      <h1> Certificate Generator</h1>
      {/* Render the CertificateForm component */}
     <CertificateGenerator/>
    </div>
  );
}

export default App;
