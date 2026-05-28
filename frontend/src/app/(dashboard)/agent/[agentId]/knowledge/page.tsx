"use client";

import { useState, use, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { createClient } from "@/utils/supabase/client";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";

export default function KnowledgeBase({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params);
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<"file" | "text">("file");
  const [textContent, setTextContent] = useState("");
  const [textTitle, setTextTitle] = useState("");

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents", agentId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      const res = await fetchApi(`/api/v1/documents/?agent_id=${agentId}`, {}, session.access_token);
      return res.documents || [];
    },
    refetchInterval: (query) => {
      // Poll every 3 seconds if any document is processing
      const docs = query.state.data || [];
      const isProcessing = docs.some((doc: any) => doc.status === "processing");
      return isProcessing ? 3000 : false;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("agent_id", agentId);

      // Using raw fetch here since fetchApi stringifies JSON by default
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/api/v1/documents/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        },
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Upload failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", agentId] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });

  const textUploadMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      return fetchApi("/api/v1/documents/text", {
        method: "POST",
        body: JSON.stringify({
          agent_id: agentId,
          title: textTitle,
          content: textContent
        })
      }, session.access_token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", agentId] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setTextContent("");
      setTextTitle("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      return fetchApi(`/api/v1/documents/${documentId}`, { method: "DELETE" }, session.access_token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", agentId] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadMutation.mutate(acceptedFiles[0]);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Knowledge List */}
      <div className="lg:col-span-8">
        <div className="bg-surface-container-lowest border border-border-subtle p-8">
          <h2 className="font-label-mono text-[14px] font-bold uppercase tracking-widest text-charcoal-text mb-2">
            Memory Banks
          </h2>
          <p className="font-body-md text-on-surface-variant mb-8">
            Ingested knowledge vectors. Real-time RAG processing.
          </p>

          <div className="space-y-4">
            {isLoading ? (
               Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[80px] bg-surface-container-lowest border border-border-subtle p-4 animate-pulse"></div>
              ))
            ) : documents.length === 0 ? (
              <div className="border border-dashed border-border-subtle p-12 text-center text-on-surface-variant font-body-md bg-sand-bg">
                <span className="material-symbols-outlined text-[32px] mb-4 opacity-50">data_object</span>
                <p>No knowledge vectors detected. Upload documents to begin.</p>
              </div>
            ) : (
              <AnimatePresence>
                {documents.map((doc: any) => (
                  <motion.div 
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-4 border border-border-subtle bg-sand-bg group relative overflow-hidden"
                  >
                    {doc.status === "processing" && (
                      <div className="absolute inset-0 bg-sage-green/5 animate-pulse pointer-events-none"></div>
                    )}
                    {doc.status === "failed" && (
                      <div className="absolute inset-0 bg-error/5 pointer-events-none"></div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-headline-md text-[18px] font-bold text-charcoal-text truncate">{doc.file_name}</h4>
                      <span className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
                        {doc.file_size_bytes ? `${(doc.file_size_bytes / 1024).toFixed(1)} KB` : "—"} · {doc.file_type} · {doc.chunk_count} chunks
                      </span>
                      {doc.status === "failed" && doc.error_message && (
                        <p className="font-label-mono text-[10px] text-error mt-1 truncate">{doc.error_message}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="flex items-center gap-2">
                        {doc.status === "processing" && (
                          <span className="w-2 h-2 rounded-full bg-electric-tangerine animate-ping"></span>
                        )}
                        {doc.status === "ready" && (
                          <span className="w-2 h-2 rounded-full bg-sage-green"></span>
                        )}
                        {doc.status === "failed" && (
                          <span className="w-2 h-2 rounded-full bg-error"></span>
                        )}
                        <span className={`font-label-mono text-[10px] uppercase tracking-widest w-20 text-right ${doc.status === 'failed' ? 'text-error' : ''}`}>
                          {doc.status}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          if (confirm("Delete this document and purge its vectors?")) {
                            deleteMutation.mutate(doc.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                        title="Purge Document"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Ingestion Tools */}
      <div className="lg:col-span-4">
        <div className="bg-surface-container-lowest border border-border-subtle p-8 sticky top-8">
          <h3 className="font-label-mono text-[14px] font-bold text-charcoal-text uppercase tracking-widest mb-6">
            Data Ingestion
          </h3>

          {/* Error display */}
          {(uploadMutation.error || textUploadMutation.error) && (
            <div className="mb-6 p-4 bg-error text-sand-bg font-body-md shadow-lg flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] shrink-0">flag</span>
              <span className="text-[14px]">{(uploadMutation.error as Error)?.message || (textUploadMutation.error as Error)?.message}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-border-subtle mb-6">
            <button 
              className={`flex-1 py-3 font-label-mono text-[10px] uppercase tracking-widest transition-colors relative ${activeTab === 'file' ? 'text-charcoal-text font-bold' : 'text-on-surface-variant'}`}
              onClick={() => setActiveTab("file")}
            >
              Upload File
              {activeTab === 'file' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-electric-tangerine"></div>}
            </button>
            <button 
              className={`flex-1 py-3 font-label-mono text-[10px] uppercase tracking-widest transition-colors relative ${activeTab === 'text' ? 'text-charcoal-text font-bold' : 'text-on-surface-variant'}`}
              onClick={() => setActiveTab("text")}
            >
              Raw Text
              {activeTab === 'text' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-electric-tangerine"></div>}
            </button>
          </div>

          {activeTab === "file" && (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors duration-300 ${
                isDragActive ? 'border-sage-green bg-sage-green/5' : 'border-border-subtle hover:border-charcoal-text bg-sand-bg'
              }`}
            >
              <input {...getInputProps()} />
              <span className={`material-symbols-outlined text-[40px] mb-4 ${isDragActive ? 'text-sage-green' : 'text-on-surface-variant'}`}>
                {uploadMutation.isPending ? 'cloud_sync' : 'upload_file'}
              </span>
              <p className="font-body-md text-charcoal-text mb-2">
                {uploadMutation.isPending ? 'Transmitting data...' : isDragActive ? 'Drop file to ingest' : 'Drag & drop a document here'}
              </p>
              <p className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
                Supported: PDF, TXT, DOCX, CSV, XLSX
              </p>
            </div>
          )}

          {activeTab === "text" && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (textTitle.trim() && textContent.trim()) textUploadMutation.mutate();
              }} 
              className="space-y-4"
            >
              <div>
                <label className="font-label-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">
                  Document Title
                </label>
                <input 
                  type="text" 
                  required
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  className="w-full bg-sand-bg border border-border-subtle p-3 font-body-md text-charcoal-text focus:outline-none focus:border-sage-green transition-colors"
                />
              </div>
              <div>
                <label className="font-label-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">
                  Raw Content
                </label>
                <textarea 
                  required
                  rows={6}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full bg-sand-bg border border-border-subtle p-3 font-body-md text-charcoal-text focus:outline-none focus:border-sage-green transition-colors resize-none"
                ></textarea>
              </div>
              <MagneticButton 
                type="submit"
                className="w-full bg-charcoal-text text-sand-bg font-label-mono text-[10px] py-3 border border-charcoal-text hover:bg-transparent hover:text-charcoal-text transition-colors duration-300 disabled:opacity-50"
              >
                {textUploadMutation.isPending ? "Ingesting..." : "Commence Ingestion"}
              </MagneticButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
