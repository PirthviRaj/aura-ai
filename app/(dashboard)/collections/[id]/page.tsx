"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateDraft } from "@/lib/generate-client";
import {
  deleteCollection,
  getCollection,
  saveDraft,
  upsertCollection,
  type Collection,
  type CollectionDoc,
} from "@/lib/workspace";
import { uid } from "@/lib/id";
import { toast } from "sonner";

const statuses: Collection["status"][] = [
  "Drafting",
  "Review",
  "Ready",
  "Publishing",
];

export default function CollectionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [title, setTitle] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCollection(getCollection(params.id));
    setReady(true);
  }, [params.id]);

  if (!ready) {
    return <p className="text-sm text-zinc-500">Loading collection…</p>;
  }

  if (!collection) {
    return (
      <p className="text-sm text-zinc-500">
        Collection not found.{" "}
        <Link href="/collections" className="text-primary">
          Back
        </Link>
      </p>
    );
  }

  const current = collection;

  function persist(next: Collection) {
    setCollection(next);
    upsertCollection(next);
  }

  async function addDraft() {
    if (!title.trim()) {
      toast.error("Give the document a title.");
      return;
    }
    try {
      const result = await generateDraft(title.trim(), "SEO Blog Post");
      const document: CollectionDoc = {
        id: uid(),
        title: result.draft.title,
        status: "Draft",
        words: result.words,
        updatedAt: new Date().toISOString(),
        template: "SEO Blog Post",
      };
      persist({
        ...current,
        documents: [document, ...current.documents],
      });
      saveDraft({
        ...result.draft,
        collectionId: current.id,
        documentId: document.id,
      });
      setTitle("");
      toast.success("Draft added");
      router.push(`/editor?topic=${encodeURIComponent(document.title)}`);
    } catch {
      toast.error("Could not create draft");
    }
  }

  function openDoc(document: CollectionDoc) {
    router.push(
      `/editor?topic=${encodeURIComponent(document.title)}${
        document.template
          ? `&template=${encodeURIComponent(document.template)}`
          : ""
      }`,
    );
  }

  function remove() {
    deleteCollection(current.id);
    toast.success("Collection deleted");
    router.push("/collections");
  }

  return (
    <div>
      <Link href="/collections" className="text-xs text-zinc-500 hover:text-white">
        ← All collections
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">{collection.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {collection.documents.length} documents in this cluster
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={collection.status === status ? "default" : "secondary"}
              onClick={() => persist({ ...collection, status })}
            >
              {status}
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={remove}>
            Delete
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="New document title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addDraft()}
        />
        <Button onClick={() => void addDraft()}>Add draft</Button>
      </div>

      <div className="mt-5 space-y-3">
        {collection.documents.length === 0 ? (
          <p className="text-sm text-zinc-500">
            This collection is empty. Add a draft to start the cluster.
          </p>
        ) : (
          collection.documents.map((document) => (
            <Card key={document.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-white">{document.title}</p>
                  <p className="text-xs text-zinc-500">
                    {document.template ?? "Untitled"} · {document.words} words
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{document.status}</Badge>
                  <Button size="sm" onClick={() => openDoc(document)}>
                    Open in editor
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
