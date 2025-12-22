import { AiChat } from "@/components/chat/ai-chat";

export function ConciergeChatSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide">AI Concierge</p>
          <h3 className="text-3xl font-serif">Plan your dining experience in minutes</h3>
          <p className="text-muted-foreground">
            Share your date, location, and preferences. Our concierge gathers the details and suggests chefs that
            match your event—no endless browsing required.
          </p>
        </div>
        <AiChat
          kind="concierge"
          title="Concierge chat"
          description="Tell us about your event and get curated chef options."
          placeholder="Example: Anniversary dinner in SF on Feb 10 for 8 guests. Prefer Italian, gluten-free friendly."
        />
      </div>
    </section>
  );
}


