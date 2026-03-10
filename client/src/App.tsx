import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import NewspaperAd from "@/pages/NewspaperAd";
import SocialMediaAds from "@/pages/SocialMediaAds";
import EventPoster from "@/pages/EventPoster";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/newspaper-ad" component={NewspaperAd} />
      <Route path="/event-poster" component={EventPoster} />
      <Route path="/social-media-ads" component={SocialMediaAds} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Navbar />
        <div className="pt-[60px]">
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
