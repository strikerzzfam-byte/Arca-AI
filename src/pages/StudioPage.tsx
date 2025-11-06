import React from 'react';
import StudioWithTerminal from '../components/studio/StudioWithTerminal';

const StudioPage: React.FC = () => {
  return (
    <div className="studio-page">
      <StudioWithTerminal theme="dark" />
    </div>
  );
};

export default StudioPage;