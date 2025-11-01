"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, X, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  createStartup,
  fetchStripeBusinessInfo,
} from "@/app/actions/startup.actions";
import type { CreateStartupInput } from "@/types/startup";

const startupFormSchema = z.object({
  apiKey: z
    .string()
    .min(10, "API key is required")
    .regex(
      /^(rk_|sk_)/,
      "Must be a valid Stripe API key (restricted or secret)"
    ),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type StartupFormValues = z.infer<typeof startupFormSchema>;

interface StartupFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface BusinessInfo {
  name: string;
  description: string | null;
  logo: string | null;
}

export function StartupForm({ onSuccess, onCancel }: StartupFormProps) {
  const [founders, setFounders] = useState<string[]>([]);
  const [founderInput, setFounderInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  const form = useForm<StartupFormValues>({
    resolver: zodResolver(startupFormSchema),
    defaultValues: {
      apiKey: "",
      website: "",
    },
  });

  const validateApiKey = async (apiKey: string) => {
    if (!apiKey || apiKey.length < 10) {
      setBusinessInfo(null);
      setApiKeyError(null);
      return;
    }

    setIsValidatingKey(true);
    setApiKeyError(null);

    try {
      const result = await fetchStripeBusinessInfo(apiKey);
      if (result.success) {
        setBusinessInfo(result.data || null);
        setApiKeyError(null);
      } else {
        setBusinessInfo(null);
        setApiKeyError(result.error || "Invalid API key");
      }
    } catch (err) {
      setBusinessInfo(null);
      setApiKeyError("Failed to validate API key");
    } finally {
      setIsValidatingKey(false);
    }
  };

  const addFounder = () => {
    const trimmed = founderInput.trim().replace("@", "");
    if (trimmed && !founders.includes(trimmed)) {
      setFounders([...founders, trimmed]);
      setFounderInput("");
    }
  };

  const removeFounder = (username: string) => {
    setFounders(founders.filter((f) => f !== username));
  };

  const onSubmit = async (values: StartupFormValues) => {
    if (!businessInfo) {
      setError("Please validate your API key first");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const input: CreateStartupInput = {
        apiKey: values.apiKey,
        website: values.website || undefined,
        founders: founders.length > 0 ? founders : undefined,
      };

      const result = await createStartup(input);

      if (result.success) {
        form.reset();
        setFounders([]);
        setBusinessInfo(null);
        onSuccess?.();
      } else {
        setError(result.error || "Failed to create startup");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stripe API Key</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="rk_live_..."
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      // Debounced validation would be better, but for simplicity:
                      const value = e.target.value;
                      if (value && value.length >= 10) {
                        validateApiKey(value);
                      } else {
                        setBusinessInfo(null);
                        setApiKeyError(null);
                      }
                    }}
                  />
                  {isValidatingKey && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                    </div>
                  )}
                  {!isValidatingKey && businessInfo && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                  {!isValidatingKey && apiKeyError && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Restricted Stripe API key with read permissions.{" "}
                <a
                  href="https://dashboard.stripe.com/apikeys/create?name=TrustMyMRR&permissions%5B%5D=rak_charge_read&permissions%5B%5D=rak_subscription_read&permissions%5B%5D=rak_bucket_connect_read&permissions%5B%5D=rak_file_read"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Create one here
                </a>
              </FormDescription>
              {apiKeyError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {apiKeyError}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Business Info Preview */}
        {businessInfo && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  Business Found
                </h4>
                <div className="flex items-start gap-3">
                  {businessInfo.logo && (
                    <img
                      src={businessInfo.logo}
                      alt={businessInfo.name}
                      className="h-12 w-12 rounded-lg object-cover border border-green-300 dark:border-green-700 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <strong>Name:</strong> {businessInfo.name}
                    </p>
                    {businessInfo.description && (
                      <p className="mt-1 text-sm text-green-800 dark:text-green-200 wrap-break-word">
                        <strong>Info:</strong> {businessInfo.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your startup&apos;s website (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Founders Section */}
        <div className="space-y-3">
          <Label>Founders (X/Twitter Usernames)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="@username"
              value={founderInput}
              onChange={(e) => setFounderInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFounder();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addFounder}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {founders.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {founders.map((founder) => (
                <Badge key={founder} variant="secondary" className="gap-1">
                  @{founder}
                  <button
                    type="button"
                    onClick={() => removeFounder(founder)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Add founder X/Twitter usernames (optional)
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Creating..." : "Create Startup"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
