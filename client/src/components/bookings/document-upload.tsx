import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface DocumentUploadProps {
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
  allowedFileTypes?: string[];
}

export function DocumentUpload({
  onChange,
  maxFiles = 5,
  maxSizeInMB = 3,
  allowedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png']
}: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    setError(null);
    const newFiles: File[] = [];
    let errorMessage = null;

    Array.from(selectedFiles).forEach(file => {
      if (file.size > maxSizeInBytes) {
        errorMessage = `O arquivo "${file.name}" excede o tamanho máximo de ${maxSizeInMB}MB.`;
        return;
      }

      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (!allowedFileTypes.includes(fileExtension)) {
        errorMessage = `O arquivo "${file.name}" não é um tipo permitido. Tipos permitidos: ${allowedFileTypes.join(', ')}`;
        return;
      }

      newFiles.push(file);
    });

    if (files.length + newFiles.length > maxFiles) {
      errorMessage = `Você pode enviar no máximo ${maxFiles} documentos.`;
      return;
    }

    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onChange(updatedFiles);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onChange(updatedFiles);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? "border-primary bg-primary/5" : "border-slate-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={(e) => handleFileChange(e.target.files)}
          className="hidden"
          accept={allowedFileTypes.join(',')}
        />

        <Button 
          type="button"
          variant="outline" 
          onClick={() => inputRef.current?.click()}
        >
          Escolher arquivos
        </Button>

        <p className="mt-2 text-sm text-slate-600">
          ou arraste e solte aqui
        </p>

        {error && (
          <p className="mt-2 text-sm text-danger">{error}</p>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Arquivos selecionados:</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                <div className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-slate-700 truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-slate-500 ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleRemoveFile(index)}
                  className="text-slate-500 hover:text-danger p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}