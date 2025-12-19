import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Bot, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

type ChatKind = "concierge" | "support";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChefSuggestion = {
  id: string;
  name: string;
  cuisines?: string[];
  averageRating?: any;
  hourlyRate?: any;
  minimumSpend?: any;
  yearsExperience?: number | null;
  servicesOffered?: string[] | null;
};

interface AiChatProps {
  kind: ChatKind;
  title: string;
  description: string;
  placeholder?: string;
  className?: string;
}

export function AiChat({
  kind,
  title,
  description,
  placeholder = "Share a bit about your request...",
  className,
}: AiChatProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        kind === "concierge"
          ? "Tell me about your event and I’ll suggest chefs that fit."
          : "Hi! I can help with bookings, payments, or chef questions.",
    },
  ]);
  const [suggestions, setSuggestions] = useState<ChefSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useMutation({
    mutationFn: async (payload: { message: string; conversationId?: string | null }) => {
      const res = await apiRequest("POST", `/api/ai/${kind}`, payload);
      return res.json();
    },
    onMutate: () => setError(null),
    onError: (err: Error) => setError(err.message || "Something went wrong"),
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: input },
        { role: "assistant", content: data.reply },
      ]);
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
      setInput("");
    },
  });

  const isSending = sendMessage.isPending;

  const showSuggestions = kind === "concierge" && suggestions.length > 0;

  const disabledReason = useMemo(() => {
    if (!input.trim()) return "Enter a message";
    if (input.length > 800) return "Message too long";
    return null;
  }, [input]);

  const handleSubmit = () => {
    if (disabledReason) return;
    sendMessage.mutate({ message: input.trim(), conversationId });
  };

  return (
    <Card className={cn("border border-muted", className)}>
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            {kind === "concierge" ? <Sparkles className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ScrollArea className="h-64 rounded-md border bg-muted/40 p-3">
          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end text-right" : "justify-start text-left"
                )}
              >
                <div
                  className={cn(
                    "inline-flex max-w-[90%] rounded-lg px-3 py-2 text-sm shadow-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border border-muted"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {showSuggestions && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Chef suggestions
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestions.map((chef) => (
                <div key={chef.id} className="rounded-md border bg-background p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{chef.name}</p>
                    {chef.averageRating && (
                      <Badge variant="secondary">{`⭐ ${chef.averageRating}`}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {chef.cuisines?.slice(0, 3).join(" • ") || "Versatile cuisine"}
                  </p>
                  {chef.hourlyRate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      From ${chef.hourlyRate} / hr · Min spend ${chef.minimumSpend || "—"}
                    </p>
                  )}
                  {chef.servicesOffered && chef.servicesOffered.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {chef.servicesOffered.slice(0, 3).map((service) => (
                        <Badge key={service} variant="outline" className="text-[10px]">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="min-h-[90px]"
          maxLength={800}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <div className="flex w-full items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Share date, location, guests, and any must-haves for faster matches.
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!!disabledReason || isSending}
            className="min-w-[110px]"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending
              </>
            ) : (
              <>
                Send
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
