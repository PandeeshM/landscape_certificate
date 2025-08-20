import React from 'react';
import CertificateForm from './components/CertificateForm';
import generateCertificate from './components/CertificateGenerator';


function App() {
  return (
    <div>
      <h1>Certificate Generator</h1>
      <CertificateForm onGenerate={generateCertificate} />
      
    </div>
  );
}

export default App;
