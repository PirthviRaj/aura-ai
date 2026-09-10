import { Suspense } from "react";
import { EditorPreview } from "@/components/editor/editor-preview";

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="text-sm text-zinc-500">Loading editor…</div>}>
      <EditorPreview />
    </Suspense>
  );
}
