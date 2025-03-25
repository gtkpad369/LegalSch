import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";

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
  allowedFileTypes = ['.pdf']
}: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  
  const handleFileChange = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    setError(null);
    const newFiles: File[] = [];
    let errorMessage = null;
    
    Array.from(selectedFiles).forEach(file => {
      // Check file size
      if (file.size > maxSizeInBytes) {
        errorMessage = `O arquivo "${file.name}" excede o tamanho máximo de ${maxSizeInMB}MB.`;
        return;
      }
      
      // Check file type
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (!allowedFileTypes.includes(fileExtension)) {
        errorMessage = `O arquivo "${file.name}" não é um tipo permitido. Tipos permitidos: ${allowedFileTypes.join(', ')}`;
        return;
      }
      
      newFiles.push(file);
    });
    
    // Check max files
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
  
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    handleFileChange(e.dataTransfer.files);
  };
  
  const handleButtonClick = () => {
    inputRef.current?.click();
  };
  
  const handleRemoveFile = (indexToRemove: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);
    onChange(updatedFiles);
  };
  
  return (
    <div className="space-y-3">
      <div 
        className={`border border-dashed rounded-lg p-4 ${dragActive ? 'border-primary bg-primary-light bg-opacity-10' : 'border-slate-300'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-center flex-col">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-slate-500 mb-1 text-center">Arraste documentos ou clique para selecionar</p>
          <p className="text-xs text-slate-400 text-center">(Documentos em PDF até {maxSizeInMB}MB)</p>
          <input 
            type="file" 
            ref={inputRef}
            className="hidden" 
            accept={allowedFileTypes.join(',')}
            onChange={(e) => handleFileChange(e.target.files)}
            multiple={maxFiles > 1}
          />
          <Button 
            type="button" 
            onClick={handleButtonClick}
            variant="outline"
            className="mt-3 bg-white border border-slate-300 text-slate-700 px-3 py-1 rounded-lg text-sm hover:bg-slate-50"
          >
            Selecionar arquivos
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="text-sm text-danger">{error}</div>
      )}
      
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Documentos selecionados:</p>
          <ul className="space-y-1">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
