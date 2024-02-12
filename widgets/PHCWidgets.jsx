import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import widgetsRegistry from './components/index.js';

import EventBus from './util/EventEmitter.jsx';

const requestURL = process.env.NODE_ENV === 'production' ? 'https://dev.phc.events' : 'http://localhost:5000';

const AuthComponent = ({ Component, props }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Conditional rendering based on `error` state
  
  useEffect(() => {
    const unsubscribe = EventBus.subscribe('userChanged', setUser);
    return unsubscribe;
  }, []);
  
  const updateGlobalUser = (newUser) => {
    EventBus.emit('userChanged', newUser);
  };
  
  if (error) {
    return (
      <div className="error-message">
        <h2 style={{textAlign:"center", margin:".5rem 0"}}>Error</h2>
        <p style={{textAlign:"center", margin:"0"}}>{error}</p>
      </div>
    );
  }
  
  // Regular component rendering
  return (
    <Component
      {...props}
      requestURL={requestURL}
      userData={user}
      setUserData={updateGlobalUser}
      setError={setError}
    />
  );
};

document.addEventListener('DOMContentLoaded', () => {
  widgetsRegistry.forEach(widget => {
    const { name, Component } = widget;
    document.querySelectorAll(name).forEach(elem => {
      // Create an object to hold the props
      const props = {};

      // For each attribute on the element, add a prop
      Array.from(elem.attributes).forEach(attr => {
        // Convert attribute name to camelCase if necessary
        const propName = attr.name.replace(/-(\w)/g, (match, letter) => letter.toUpperCase());
        props[propName] = attr.value;
      });
      const root = createRoot(elem);
      root.render(React.createElement(AuthComponent, {Component, props})); // Render the component.
    });
  });
});

(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const cacheKey = urlParams.get("cacheKey");
  if (cacheKey) {
    sessionStorage.setItem("cachedKey", cacheKey);
  }

  // Dynamically add CSS
  const PHCStyleTag = document.createElement("link");
  PHCStyleTag.rel = "stylesheet";
  PHCStyleTag.href = `${requestURL}/widgets/styles/main.css`;
  document.head.appendChild(PHCStyleTag);
})();