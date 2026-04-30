import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, Trash2, Eye, Download, Loader2, CheckCircle, Pill } from 'lucide-react';
import { documentService } from '@/services/documentService';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

export default function Digitizer() {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted.');
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const doc = await documentService.upload(file, setProgress);
      qc.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document digitized successfully!');
      setSelected(doc);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [qc]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading,
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">🔬 Medical Document Digitizer</h1>
        <p className="text-slate-400 text-sm mt-1">Upload prescriptions or lab reports — AI extracts structured data instantly.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload zone */}
        <Card>
          <CardHeader>
            <CardTitle><span className="flex items-center gap-2"><Upload size={16} className="text-teal-400" />Upload Document</span></CardTitle>
          </CardHeader>

          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="space-y-4">
                <Loader2 size={40} className="mx-auto text-blue-400 animate-spin" />
                <p className="text-sm text-slate-300">Analyzing with AI Vision...</p>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">{progress}%</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto">
                  <Upload size={24} className="text-teal-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-300">
                    {isDragActive ? 'Drop to analyze' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP, PDF · Max 10MB</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center text-xs text-slate-500">
                  {['Prescription', 'Lab Report', 'Discharge Summary', 'Radiology'].map((t) => (
                    <span key={t} className="bg-slate-700/60 border border-slate-600/50 px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Extracted data preview */}
        <Card>
          <CardHeader>
            <CardTitle><span className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-400" />Extracted Data</span></CardTitle>
            {selected && (
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">
                <span className="text-xs">Clear</span>
              </button>
            )}
          </CardHeader>

          {!selected ? (
            <div className="text-center py-12 text-slate-500">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Upload a document to see AI-extracted data here</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-80">
              {/* Document type */}
              <div className="flex items-center gap-2">
                <Badge variant="info">{(selected as { documentType?: string }).documentType?.replace('_', ' ') || 'Document'}</Badge>
                <span className="text-xs text-slate-500">{(selected as { fileName?: string }).fileName}</span>
              </div>

              {/* Parsed fields */}
              {(selected as { parsedData?: Record<string, unknown> }).parsedData && (
                <div className="space-y-3 text-sm">
                  {(selected as { parsedData?: { patientName?: string; date?: string; doctorName?: string; diagnosis?: string[]; medications?: { name: string; dosage: string; frequency: string }[]; notes?: string } }).parsedData?.patientName && (
                    <Row label="Patient" value={(selected as { parsedData?: { patientName?: string } }).parsedData!.patientName!} />
                  )}
                  {(selected as { parsedData?: { date?: string } }).parsedData?.date && (
                    <Row label="Date" value={(selected as { parsedData?: { date?: string } }).parsedData!.date!} />
                  )}
                  {(selected as { parsedData?: { doctorName?: string } }).parsedData?.doctorName && (
                    <Row label="Doctor" value={(selected as { parsedData?: { doctorName?: string } }).parsedData!.doctorName!} />
                  )}
                  {(selected as { parsedData?: { diagnosis?: string[] } }).parsedData?.diagnosis?.length ? (
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Diagnosis</p>
                      <div className="flex flex-wrap gap-1">
                        {(selected as { parsedData?: { diagnosis?: string[] } }).parsedData!.diagnosis!.map((d, i) => (
                          <Badge key={i} variant="error">{d}</Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {(selected as { parsedData?: { medications?: { name: string; dosage: string; frequency: string }[] } }).parsedData?.medications?.length ? (
                    <div>
                      <p className="text-slate-500 text-xs mb-1.5 flex items-center gap-1"><Pill size={11} />Medications</p>
                      {(selected as { parsedData?: { medications?: { name: string; dosage: string; frequency: string }[] } }).parsedData!.medications!.map((m, i) => (
                        <div key={i} className="bg-slate-700/40 rounded-lg p-2.5 mb-1.5 text-xs">
                          <p className="text-white font-medium">{m.name}</p>
                          <p className="text-slate-400">{m.dosage} · {m.frequency}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {(selected as { parsedData?: { notes?: string } }).parsedData?.notes && (
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Notes</p>
                      <p className="text-slate-300 text-xs leading-relaxed">{(selected as { parsedData?: { notes?: string } }).parsedData!.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Document history */}
      <Card>
        <CardHeader>
          <CardTitle><span className="flex items-center gap-2"><FileText size={16} className="text-blue-400" />Document Library ({documents.length})</span></CardTitle>
        </CardHeader>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileText size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {(documents as { _id: string; fileName: string; documentType: string; createdAt: string; isProcessed: boolean }[]).map((doc) => (
                <motion.div
                  key={doc._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-700/40 border border-slate-700/60 hover:border-teal-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-teal-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{doc.fileName}</p>
                      <p className="text-[11px] text-slate-500">{doc.documentType?.replace('_', ' ')} · {formatDate(doc.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => documentService.getById(doc._id).then(setSelected)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(doc._id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-slate-500 w-16 shrink-0 text-xs">{label}</span>
      <span className="text-slate-200 text-xs">{value}</span>
    </div>
  );
}
