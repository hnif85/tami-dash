"use client";

import { useState } from "react";
import type { Deliverable } from "@/lib/types";

const CW_BASE = "https://createwhiz.ai";

function withBase(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${CW_BASE}${url}`;
}

function proxied(url?: string | null) {
  const full = withBase(url);
  if (!full) return "";
  return `/api/deliverables/file?url=${encodeURIComponent(full)}`;
}

export default function DeliverableModal({ guid }: { guid: string }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<{ deliverables?: Deliverable[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Deliverable | null>(null);

  async function handleOpen() {
    setOpen(true);
    if (data) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/deliverables?guid=${encodeURIComponent(guid)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setError(err?.error || `HTTP ${res.status}`);
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const deliverables = data?.deliverables ?? [];

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="text-xs font-medium text-blue-600 hover:text-blue-800 underline underline-offset-2"
      >
        Lihat
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => { setOpen(false); setSelected(null); }}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Deliverables</h2>
              <button
                type="button"
                onClick={() => { setOpen(false); setSelected(null); }}
                className="text-2xl leading-none text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {!loading && !error && deliverables.length === 0 && (
                <p className="py-16 text-center text-sm text-gray-400">
                  No deliverables found.
                </p>
              )}

              {!loading && !error && deliverables.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {deliverables.map((d) => (
                    <article
                      key={d.id}
                      className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                    >
                      <div className="relative h-44 w-full bg-gray-200">
                        <img
                          src={proxied(d.thumbnailUrl || d.fileUrl)}
                          alt={d.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                          {d.type}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col gap-1.5 p-3">
                        <p className="text-sm font-semibold leading-tight">{d.title}</p>
                        <p className="text-[11px] text-gray-400">{d.captionPlatform ?? "-"}</p>
                        <p className="line-clamp-2 text-xs text-gray-600">
                          {d.captionText ?? ""}
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelected(d)}
                          className="mt-auto self-start rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Buka file
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Detail modal */}
              {selected && (
                <div
                  className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
                  onClick={() => setSelected(null)}
                >
                  <div
                    className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="absolute right-4 top-4 text-2xl leading-none text-gray-400 hover:text-gray-600"
                    >
                      &times;
                    </button>

                    {selected.type?.toLowerCase().includes("video") ? (
                      <video
                        src={proxied(selected.fileUrl)}
                        controls
                        className="w-full rounded-lg"
                        autoPlay
                      />
                    ) : (
                      <img
                        src={proxied(selected.fileUrl)}
                        alt={selected.title}
                        className="w-full rounded-lg"
                      />
                    )}

                    <div className="mt-4 space-y-2">
                      <h3 className="text-lg font-bold">{selected.title}</h3>
                      {selected.captionText && (
                        <p className="text-sm text-gray-600">{selected.captionText}</p>
                      )}
                      {selected.captionHashtags && selected.captionHashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {selected.captionHashtags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] text-blue-700"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <a
                        href={withBase(selected.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block rounded-lg bg-gray-800 px-4 py-2 text-xs font-medium text-white hover:bg-gray-900"
                      >
                        Buka di tab baru
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
