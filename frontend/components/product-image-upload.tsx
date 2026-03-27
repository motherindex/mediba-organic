"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase-client";

type ProductImageUploadProps = {
  value: string[];
  onChange: (images: string[]) => void;
};

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export function ProductImageUpload({ value, onChange }: ProductImageUploadProps) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setErrorMessage("");

    // Validate all files before uploading anything
    for (const file of Array.from(files)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setErrorMessage(`"${file.name}" is not a supported image type. Use JPEG, PNG, WebP, or GIF.`);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setErrorMessage(`"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length });

        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      }

      onChange([...value, ...uploadedUrls]);
    } catch (err: any) {
      setErrorMessage(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (inputRef.current) inputRef.current.value = "";
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
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: "none" }}
      />

      {/* Upload zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: "2px dashed var(--border)",
          borderRadius: 6,
          padding: "24px 20px",
          textAlign: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          transition: "border-color 0.2s, background 0.2s",
          background: uploading ? "var(--cream-dark)" : "var(--cream)",
          opacity: uploading ? 0.8 : 1,
        }}
        onMouseEnter={(e) => {
          if (!uploading) (e.currentTarget as HTMLDivElement).style.borderColor = "var(--gold-muted)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        }}
      >
        {uploading ? (
          <>
            <div
              style={{
                width: 32,
                height: 32,
                border: "3px solid var(--border)",
                borderTopColor: "var(--gold)",
                borderRadius: "50%",
                margin: "0 auto 12px",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.88rem",
                fontWeight: 500,
                color: "var(--brown-mid)",
              }}
            >
              {uploadProgress
                ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}…`
                : "Uploading…"}
            </p>
          </>
        ) : (
          <>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--gold-muted)"
              strokeWidth="1.5"
              style={{ margin: "0 auto 10px", display: "block" }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.88rem",
                fontWeight: 500,
                color: "var(--brown-mid)",
                marginBottom: 4,
              }}
            >
              Click to upload images
            </p>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.75rem",
                color: "var(--brown-light)",
                fontWeight: 300,
              }}
            >
              JPEG, PNG, WebP, GIF · Max {MAX_FILE_SIZE_MB}MB each · Multiple files supported
            </p>
          </>
        )}
      </div>

      {/* Error */}
      {errorMessage && (
        <p
          style={{
            marginTop: 10,
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.82rem",
            color: "#c0392b",
            background: "rgba(192,57,43,0.06)",
            border: "1px solid rgba(192,57,43,0.2)",
            borderRadius: 4,
            padding: "8px 12px",
          }}
        >
          {errorMessage}
        </p>
      )}

      {/* Image previews */}
      {value.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--brown-light)",
              marginBottom: 12,
            }}
          >
            {value.length} image{value.length !== 1 ? "s" : ""} · First image is the main display image
          </p>

          <div className="image-preview-grid">
            {value.map((image, index) => (
              <div
                key={image + index}
                style={{
                  border: index === 0 ? "2px solid var(--gold)" : "1px solid var(--border)",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "var(--white)",
                  position: "relative",
                }}
              >
                {index === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      background: "var(--gold)",
                      color: "#fff",
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      padding: "2px 8px",
                      borderRadius: 3,
                      zIndex: 1,
                    }}
                  >
                    Main
                  </div>
                )}

                <div style={{ aspectRatio: "1/1", overflow: "hidden" }}>
                  <img
                    src={image}
                    alt={`Product image ${index + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>

                <div
                  style={{
                    padding: "10px 10px 10px",
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => moveImageLeft(index)}
                    disabled={index === 0}
                    style={{
                      flex: 1,
                      padding: "6px 4px",
                      fontSize: "0.72rem",
                      fontFamily: "'Jost', sans-serif",
                      fontWeight: 500,
                      color: index === 0 ? "#ccc" : "var(--green)",
                      background: "var(--cream)",
                      border: "1px solid var(--border)",
                      borderRadius: 4,
                      cursor: index === 0 ? "not-allowed" : "pointer",
                      transition: "background 0.15s",
                      minWidth: 0,
                    }}
                  >
                    ← Left
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImageRight(index)}
                    disabled={index === value.length - 1}
                    style={{
                      flex: 1,
                      padding: "6px 4px",
                      fontSize: "0.72rem",
                      fontFamily: "'Jost', sans-serif",
                      fontWeight: 500,
                      color: index === value.length - 1 ? "#ccc" : "var(--green)",
                      background: "var(--cream)",
                      border: "1px solid var(--border)",
                      borderRadius: 4,
                      cursor: index === value.length - 1 ? "not-allowed" : "pointer",
                      transition: "background 0.15s",
                      minWidth: 0,
                    }}
                  >
                    Right →
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      flex: 1,
                      padding: "6px 4px",
                      fontSize: "0.72rem",
                      fontFamily: "'Jost', sans-serif",
                      fontWeight: 500,
                      color: "#c0392b",
                      background: "rgba(192,57,43,0.04)",
                      border: "1px solid rgba(192,57,43,0.2)",
                      borderRadius: 4,
                      cursor: "pointer",
                      transition: "background 0.15s",
                      minWidth: 0,
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .image-preview-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 480px) {
          .image-preview-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 640px) {
          .image-preview-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
