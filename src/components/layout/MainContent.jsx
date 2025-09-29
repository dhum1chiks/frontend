import React from 'react';

const MainContent = ({ children }) => (
  <main className="p-8 sm:p-12 flex-1 overflow-auto bg-card rounded-xl shadow-card">
    {children}
  </main>
);

export default MainContent;
