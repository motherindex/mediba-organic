"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase-client";

type ProductImageUploadProps = {
  value: string[];
  onChange: (images: string[]) => void;
};

export function ProductImageUpload({
  value,
  onChange,
}: ProductImageUploadProps) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMessage("");

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      }

      onChange([...value, ...uploadedUrls]);
    } catch (error: any) {
      setErrorMessage(error.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function removeImage(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function moveImageLeft(index: number) {
    if (index === 0) return;

    const next = [...value];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function moveImageRight(index: number) {
    if (index === value.length - 1) return;

    const next = [...value];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-xl border border-[#556B2F] px-4 py-3 text-sm font-medium text-[#556B2F] transition hover:bg-[#556B2F] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {uploading ? "Uploading..." : "Upload Images"}
      </button>

      {errorMessage ? (
        <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
      ) : null}

      {value.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {value.map((image, index) => (
            <div
              key={image + index}
              className="rounded-2xl border border-[#E7DCC8] bg-white p-3"
            >
              <img
                src={image}
                alt={`Product image ${index + 1}`}
                className="h-32 w-full rounded-xl object-cover"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => moveImageLeft(index)}
                  disabled={index === 0}
                  className="rounded-lg border border-[#E7DCC8] px-3 py-2 text-xs text-[#556B2F] transition hover:bg-[#F8F3E9] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Left
                </button>

                <button
                  type="button"
                  onClick={() => moveImageRight(index)}
                  disabled={index === value.length - 1}
                  className="rounded-lg border border-[#E7DCC8] px-3 py-2 text-xs text-[#556B2F] transition hover:bg-[#F8F3E9] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Right
                </button>

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600 transition hover:bg-red-50"
                >
                  Remove
                </button>
              </div>

              {index === 0 ? (
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[#8B6B2C]">
                  Main image
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}