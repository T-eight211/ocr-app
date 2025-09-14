// app/page.tsx
"use client"; // needed if this page uses state/hooks

import DocumentForm from "@/components/used-gold-purcahse-form";

export default function Page() {
  return (
    <main className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Document Form</h1>
      <DocumentForm />
    </main>
  );
}
