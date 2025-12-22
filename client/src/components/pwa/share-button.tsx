import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShare } from "@/hooks/use-share";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/native-features";

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ShareButton({ title, text, url, variant = "outline", size = "sm" }: ShareButtonProps) {
  const { share, supported } = useShare();
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData = {
      title,
      text,
      url: url || window.location.href,
    };

    if (supported) {
      const success = await share(shareData);
      if (!success) {
        // Fallback to copying link
        await fallbackCopy();
      }
    } else {
      // Fallback to copying link
      await fallbackCopy();
    }
  };

  const fallbackCopy = async () => {
    const copyUrl = url || window.location.href;
    const success = await copyToClipboard(copyUrl);
    
    if (success) {
      toast({
        title: "Link Copied",
        description: "Link has been copied to clipboard",
      });
    } else {
      toast({
        title: "Share Failed",
        description: "Could not share or copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleShare}>
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  );
}



