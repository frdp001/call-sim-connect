import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { encodeEmailToBase64 } from "@/lib/meetingUtils";
import { useToast } from "@/hooks/use-toast";

const URLGenerator = () => {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateURL = () => {
    if (!email) return "";
    const encodedEmail = encodeEmailToBase64(email);
    return `${window.location.origin}/?email=${encodedEmail}`;
  };

  const copyToClipboard = async () => {
    const url = generateURL();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "URL Copied!",
        description: "The meeting URL has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  const generatedURL = generateURL();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Meeting URL Generator</CardTitle>
          <CardDescription>
            Generate a meeting URL with a prefilled email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {generatedURL && (
            <div className="space-y-2">
              <Label>Generated URL</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedURL}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={copyToClipboard}
                  size="icon"
                  variant="outline"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                When this URL is visited, the email field will be prefilled with: <strong>{email}</strong>
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={copyToClipboard} 
              disabled={!email}
              className="flex-1"
            >
              {copied ? "Copied!" : "Copy URL"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open("/", "_blank")}
              className="flex-1"
            >
              Test URL
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default URLGenerator;