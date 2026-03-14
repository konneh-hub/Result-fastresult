import React from 'react';

const PlaceholderPage = ({ title, description }) => {
  return (
    <div className="placeholder-page">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      <div className="placeholder-box">
        <p>This page is under construction. It will fetch and display real data from the API.</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
