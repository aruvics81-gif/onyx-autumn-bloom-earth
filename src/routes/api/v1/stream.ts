import { createFileRoute } from "@tanstack/react-router";
import { isAllowedAudioHost } from "@/lib/server/ingest";

export const Route = createFileRoute("/api/v1/stream")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const src = new URL(request.url).searchParams.get("u");
        if (!src) return new Response("Missing audio url", { status: 400 });
        let parsed: URL;
        try {
          parsed = new URL(src);
        } catch {
          return new Response("Bad url", { status: 400 });
        }
        if (parsed.protocol !== "https:" || !isAllowedAudioHost(parsed.hostname)) {
          return new Response("Forbidden host", { status: 403 });
        }
        const range = request.headers.get("range");
        const upstream = await fetch(src, {
          headers: range ? { Range: range } : undefined,
        });
        if (!upstream.ok && upstream.status !== 206) {
          return new Response("Upstream audio failed", { status: 502 });
        }
        const headers = new Headers();
        headers.set("Content-Type", "audio/mp4");
        headers.set("Cache-Control", "public, max-age=86400");
        headers.set("Accept-Ranges", "bytes");
        const len = upstream.headers.get("content-length");
        if (len) headers.set("Content-Length", len);
        const cr = upstream.headers.get("content-range");
        if (cr) headers.set("Content-Range", cr);
        return new Response(upstream.body, { status: upstream.status, headers });
      },
    },
  },
});
