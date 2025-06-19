import React from "react";

const Test: React.FC = () => {
  return (
    <div style={{ padding: 40 }}>
      <h1>Deployment Test Page</h1>
      <p>If you see this page, your deployment is working!</p>
      <input type="text" placeholder="Type here to test..." style={{ padding: 8, fontSize: 16 }} />
    </div>
  );
};

export default Test; 