import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";
import { useEffect, useRef } from "react";

interface Phase2IncomingCallProps {
  onAccept: () => void;
  onDecline: () => void;
}

const Phase2IncomingCall = ({ onAccept, onDecline }: Phase2IncomingCallProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Create a simple ringing sound using Web Audio API
    const createRingingSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      const playRing = () => {
        oscillator.start();
        setTimeout(() => {
          try {
            oscillator.stop();
          } catch (e) {
            // Oscillator already stopped
          }
        }, 1000);
      };
      
      playRing();
      
      const interval = setInterval(() => {
        const newOscillator = audioContext.createOscillator();
        const newGainNode = audioContext.createGain();
        
        newOscillator.connect(newGainNode);
        newGainNode.connect(audioContext.destination);
        
        newOscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        newGainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        
        newOscillator.start();
        setTimeout(() => {
          try {
            newOscillator.stop();
          } catch (e) {
            // Oscillator already stopped
          }
        }, 1000);
      }, 2000);
      
      return () => {
        clearInterval(interval);
        try {
          audioContext.close();
        } catch (e) {
          // Audio context already closed
        }
      };
    };

    const cleanup = createRingingSound();
    
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="text-center">
        {/* Caller Info */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl font-bold text-white">JD</span>
          </div>
          <h2 className="text-3xl font-semibold text-white mb-2">John Doe</h2>
          <p className="text-xl text-gray-300">Incoming Zoom call...</p>
        </div>
        
        {/* Pulsing Animation */}
        <div className="mb-12">
          <div className="w-4 h-4 bg-green-500 rounded-full mx-auto animate-pulse"></div>
        </div>
        
        {/* Call Controls */}
        <div className="flex justify-center space-x-8">
          {/* Decline Button */}
          <Button
            onClick={onDecline}
            className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full p-0"
          >
            <PhoneOff className="w-8 h-8 text-white" />
          </Button>
          
          {/* Accept Button */}
          <Button
            onClick={onAccept}
            className="w-16 h-16 bg-green-600 hover:bg-green-700 rounded-full p-0"
          >
            <Phone className="w-8 h-8 text-white" />
          </Button>
        </div>
        
        {/* Status Text */}
        <div className="mt-8">
          <p className="text-gray-400 text-lg">Zoom Meeting</p>
          <p className="text-gray-500 text-sm">Swipe to answer</p>
        </div>
      </div>
    </div>
  );
};

export default Phase2IncomingCall;