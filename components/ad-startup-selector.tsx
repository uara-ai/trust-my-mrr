"use client";

import { useState, useEffect } from "react";
import { Search, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getAllStartupsForSelection,
  updateAdWithStartup,
} from "@/app/actions/ad.actions";

interface Startup {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  description: string | null;
}

interface AdStartupSelectorProps {
  sessionId: string;
  onComplete: () => void;
}

export function AdStartupSelector({
  sessionId,
  onComplete,
}: AdStartupSelectorProps) {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(
    null
  );
  const [tagline, setTagline] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStartups();
  }, []);

  const loadStartups = async () => {
    try {
      const result = await getAllStartupsForSelection();
      if (result.success) {
        setStartups(result.startups);
      } else {
        setError(result.error || "Failed to load startups");
      }
    } catch (err) {
      setError("Failed to load startups");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStartupId) {
      setError("Please select a startup");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await updateAdWithStartup({
        sessionId,
        startupId: selectedStartupId,
        tagline: tagline || undefined,
      });

      if (result.success) {
        onComplete();
      } else {
        setError(result.error || "Failed to update ad");
      }
    } catch (err) {
      setError("Failed to update ad");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStartups = startups.filter((startup) =>
    startup.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Your Startup</h3>
        <p className="text-sm text-muted-foreground">
          Choose which startup you want to advertise in this spot
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search startups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Startup List */}
      <ScrollArea className="h-[300px] rounded-md border">
        <div className="p-2 space-y-2">
          {filteredStartups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {searchQuery
                ? "No startups found matching your search"
                : "No startups available"}
            </div>
          ) : (
            filteredStartups.map((startup) => (
              <button
                key={startup.id}
                onClick={() => setSelectedStartupId(startup.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all hover:bg-accent ${
                  selectedStartupId === startup.id
                    ? "border-primary bg-accent"
                    : "border-transparent"
                }`}
              >
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={startup.logo || undefined} />
                  <AvatarFallback>
                    {startup.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">
                      {startup.name}
                    </p>
                    {selectedStartupId === startup.id && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                  {startup.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {startup.description}
                    </p>
                  )}
                  {startup.website && (
                    <p className="text-xs text-primary mt-1 truncate">
                      {startup.website}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Tagline */}
      <div className="space-y-2">
        <Label htmlFor="tagline">
          Tagline <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Input
          id="tagline"
          placeholder="A catchy tagline for your ad..."
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground">
          {tagline.length}/100 characters
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleSubmit}
          disabled={!selectedStartupId || submitting}
          className="flex-1"
          size="lg"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Activating Ad...
            </>
          ) : (
            "Activate Ad"
          )}
        </Button>
      </div>
    </div>
  );
}
