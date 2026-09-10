"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getCollections,
  upsertCollection,
  type Collection,
} from "@/lib/workspace";
import { uid } from "@/lib/id";
import { toast } from "sonner";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    setCollections(getCollections());
  }, []);

  function create() {
    if (!name.trim()) {
      toast.error("Name the collection first.");
      return;
    }
    const collection: Collection = {
      id: uid(),
      name: name.trim(),
      status: "Drafting",
      documents: [],
    };
    setCollections(upsertCollection(collection));
    setName("");
    setOpen(false);
    toast.success("Collection created");
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Collections</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Topic clusters and draft libraries for each brand.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New collection
        </Button>
      </div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Create a collection now"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
        />
        <Button onClick={create}>Create</Button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {collections.map((collection) => (
          <Link key={collection.id} href={`/collections/${collection.id}`}>
            <Card className="transition-all hover:-translate-y-1 hover:border-glow">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="font-medium text-white">{collection.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {collection.documents.length} documents
                  </p>
                </div>
                <Badge>{collection.status}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New collection</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="e.g. Launch cluster"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
          />
          <Button onClick={create}>Create collection</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
