import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, X, Upload, Image as ImageIcon } from "lucide-react";

export default function ShareHandler() {
  const [, setLocation] = useLocation();
  const [shareData, setShareData] = useState<{
    title?: string;
    text?: string;
    url?: string;
    files?: File[];
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processShareData = async () => {
      try {
        // Check if this is a POST request with form data
        const urlParams = new URLSearchParams(window.location.search);
        const title = urlParams.get("title") || "";
        const text = urlParams.get("text") || "";
        const url = urlParams.get("url") || "";

        // For now, we'll just extract the URL params
        // In a real implementation, you'd handle file uploads here
        setShareData({
          title,
          text,
          url,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error processing share data:", error);
        setLoading(false);
      }
    };

    processShareData();
  }, []);

  const handleCancel = () => {
    setLocation("/");
  };

  const handleShareToMessages = () => {
    // Navigate to messages with the shared content
    const params = new URLSearchParams();
    if (shareData.title) params.set("title", shareData.title);
    if (shareData.text) params.set("text", shareData.text);
    if (shareData.url) params.set("url", shareData.url);
    
    setLocation(`/messages?${params.toString()}`);
  };

  const handleShareToBooking = () => {
    // Navigate to create booking with shared content
    setLocation("/bookings/new");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d4a6f] to-[#1e3a5f] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Processing shared content...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d4a6f] to-[#1e3a5f] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 dark:bg-orange-950 p-3 rounded-full">
              <Share2 className="h-6 w-6 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold">Share to Dine Maison</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4 mb-6">
          {shareData.title && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</label>
              <p className="mt-1 text-gray-900 dark:text-gray-100">{shareData.title}</p>
            </div>
          )}

          {shareData.text && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
              <p className="mt-1 text-gray-900 dark:text-gray-100">{shareData.text}</p>
            </div>
          )}

          {shareData.url && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Link</label>
              <a 
                href={shareData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-1 text-orange-500 hover:text-orange-600 break-all block"
              >
                {shareData.url}
              </a>
            </div>
          )}

          {shareData.files && shareData.files.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Files</label>
              <div className="mt-2 space-y-2">
                {shareData.files.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Upload className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-900 dark:text-gray-100">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Button onClick={handleShareToMessages} className="w-full" size="lg">
            Share in Messages
          </Button>
          
          <Button onClick={handleShareToBooking} variant="outline" className="w-full" size="lg">
            Share with Booking
          </Button>
          
          <Button onClick={handleCancel} variant="ghost" className="w-full">
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
