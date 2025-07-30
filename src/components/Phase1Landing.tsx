import { Button } from "@/components/ui/button";

interface Phase1LandingProps {
  onJoinMeeting: () => void;
}

const Phase1Landing = ({ onJoinMeeting }: Phase1LandingProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
        {/* Zoom Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-blue-600 mb-2">zoom</div>
          <div className="w-16 h-1 bg-blue-600 mx-auto"></div>
        </div>
        
        {/* Meeting Info */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Join Meeting</h1>
          <p className="text-gray-600 mb-1">Meeting ID: 123 456 7890</p>
          <p className="text-gray-600 text-sm">Waiting for the host to start this meeting</p>
        </div>
        
        {/* User Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-blue-300 rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-blue-600">U</span>
            </div>
          </div>
        </div>
        
        {/* Name Display */}
        <div className="text-center mb-8">
          <p className="text-lg font-medium text-gray-800">John Doe</p>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={onJoinMeeting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
          >
            Join Meeting
          </Button>
          
          <Button 
            onClick={onJoinMeeting}
            variant="outline" 
            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-3 text-lg font-medium"
          >
            Sign In
          </Button>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By joining, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Phase1Landing;