import { useState, useMemo } from "react";
import { z } from "zod";
import { customAlphabet } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Copy, ExternalLink, Link as LinkIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";

const urlSchema = z.string().url();
const generateAlias = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  6
);

type HistoryItem = {
  id: string;
  longUrl: string;
  shortUrl: string;
  createdAt: number;
};

const STORAGE_KEY = "ls_history_v1";

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 20)));
}

export default function ShortenForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HistoryItem | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());

  const isValid = useMemo(() => urlSchema.safeParse(url).success, [url]);

  async function onShorten(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    const parsed = urlSchema.safeParse(url.trim());
    if (!parsed.success) {
      toast.error("Please enter a valid URL");
      return;
    }

    const alias = generateAlias();

    setLoading(true);
    try {
      const api = new URL("https://is.gd/create.php");
      api.searchParams.set("format", "json");
      api.searchParams.set("url", parsed.data);
      api.searchParams.set("shorturl", alias);

      const res = await fetch(api.toString());
      const data = await res.json();

      if (!res.ok || data.errorcode) {
        throw new Error(data.errormessage || "Failed to shorten URL");
      }

      const item: HistoryItem = {
        id: crypto.randomUUID(),
        longUrl: parsed.data,
        shortUrl: data.shorturl as string,
        createdAt: Date.now(),
      };

      setResult(item);
      const updated = [item, ...history].slice(0, 20);
      setHistory(updated);
      saveHistory(updated);
      toast.success("Short link created");
    } catch (err: any) {
      toast.error(err.message || "Unable to create short link");
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard");
  }

  return (
    <section aria-labelledby="shortener" className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground bg-card/60 backdrop-blur">
          <Sparkles className="size-4 text-primary" />
          <span>Lightning-fast and free</span>
        </div>
        <h1 id="shortener" className="text-4xl md:text-6xl font-bold tracking-tight">
          Lightning‑fast Link Shortener
        </h1>
        <p className="max-w-2xl mx-auto text-muted-foreground">
          Paste a long URL, get a short one instantly. Share anywhere with confidence.
        </p>
      </div>

      <Card className="border-border/60 shadow-[var(--shadow-elegant)] bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl">Shorten your link</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onShorten} className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="grid gap-2">
              <Label htmlFor="url">Paste URL</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/very/long/link"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10"
                  aria-invalid={!isValid && url.length > 0}
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full md:w-auto" disabled={!isValid || loading} variant="default">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Shortening…
                  </>
                ) : (
                  "Shorten"
                )}
              </Button>
            </div>
          </form>

          {result && (
            <div className="mt-6">
              <Separator className="my-4" />
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Your short link</p>
                  <a href={result.shortUrl} target="_blank" rel="noreferrer" className="truncate font-medium text-primary hover:underline">
                    {result.shortUrl}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => copy(result.shortUrl)}>
                    <Copy className="mr-2 size-4" /> Copy
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={result.shortUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 size-4" /> Open
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {history.length > 0 && (
        <section aria-labelledby="history" className="space-y-3">
          <h2 id="history" className="text-xl font-semibold">Recent links</h2>
          <div className="grid gap-3">
            {history.map((item) => (
              <Card key={item.id} className="bg-card/70 backdrop-blur border-border/60">
                <CardContent className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="min-w-0">
                    <a href={item.shortUrl} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                      {item.shortUrl}
                    </a>
                    <p className="truncate text-sm text-muted-foreground">{item.longUrl}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="secondary" onClick={() => copy(item.shortUrl)}>
                      <Copy className="mr-2 size-4" /> Copy
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={item.shortUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-2 size-4" /> Open
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
