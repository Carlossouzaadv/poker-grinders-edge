import React, { useState } from 'react';
import HeroSection from './sections/HeroSection';
import HowItWorksSection from './sections/HowItWorksSection';
import FutureSection from './sections/FutureSection';
import LeadCaptureModal from './LeadCaptureModal';

interface HandReplayerProps {
  initialHandHistory?: string;
}

const HandReplayer: React.FC<HandReplayerProps> = ({ initialHandHistory }) => {
  const [showLeadCapture, setShowLeadCapture] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Main replayer */}
      <HeroSection
        onShowLeadCapture={() => setShowLeadCapture(true)}
        initialHandHistory={initialHandHistory}
      />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Future Section - Lead capture */}
      <FutureSection onShowLeadCapture={() => setShowLeadCapture(true)} />

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showLeadCapture}
        onClose={() => setShowLeadCapture(false)}
      />
    </div>
  );
};

export default HandReplayer;