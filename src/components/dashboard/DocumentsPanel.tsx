import { useRef, useState } from "react";
import type { ProjectFile } from "../../lib/types";

interface DocumentsPanelProps {
  onNotify: (message: string) => void;
}

const initialFiles: ProjectFile[] = [
  { id: "f1", name: "API_Spec_v2.pdf", icon: "📄", visibility: "SHARED" },
  { id: "f2", name: "analyzer.py", icon: "💻", visibility: "PRIVATE" },
];

export default function DocumentsPanel({ onNotify }: DocumentsPanelProps) {
  const [files, setFiles] = useState<ProjectFile[]>(initialFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  function handleUpload(fileList: FileList | null, kind: "file" | "folder") {
    if (!fileList || fileList.length === 0) return;
    // TODO: replace with Person 1's real upload call, e.g.
    // await uploadToProject(fileList, kind)
    const label = kind === "folder"
      ? `📁 ${(fileList[0] as any).webkitRelativePath?.split("/")[0] || "project-folder"}/`
      : `📄 ${fileList[0].name}`;
    setFiles((prev) => [
      { id: crypto.randomUUID(), name: label, icon: "", visibility: "PRIVATE" },
      ...prev,
    ]);
    onNotify(`${kind === "folder" ? "Folder" : "Files"} uploaded to your workspace ✓`);
  }

  function requestShare(fileName: string) {
    // TODO: call Person 1's requestDocumentShare(fileId)
    onNotify(`Share request sent for ${fileName} ✓`);
  }

  return (
    <div className="panel">
      <h3>PROJECT DOCUMENTS + CODE</h3>
      <p className="request-meta">
        Upload your actual work files or an entire folder from the dashboard.
        New uploads stay private until you choose to share them.
      </p>

      <div className="dash-upload-actions">
        <button className="btn teal" onClick={() => fileInputRef.current?.click()}>＋ UPLOAD FILES</button>
        <button className="btn pink" onClick={() => folderInputRef.current?.click()}>＋ UPLOAD FOLDER</button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => { handleUpload(e.target.files, "file"); e.target.value = ""; }}
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore - non-standard attributes for folder selection
        webkitdirectory=""
        directory=""
        multiple
        hidden
        onChange={(e) => { handleUpload(e.target.files, "folder"); e.target.value = ""; }}
      />

      <div className="upload" style={{ marginTop: 10 }} onClick={() => fileInputRef.current?.click()}>
        DROP / SELECT YOUR WORK
        <br />
        <small>PDF • DOCX • ZIP • PY • JS • images • datasets • any project file</small>
      </div>

      <div>
        {files.map((file) => (
          <div key={file.id} className="file-row">
            <span>{file.icon} {file.name} <span className="chip">{file.visibility}</span></span>
            <span>
              <button className="btn paper" onClick={() => requestShare(file.name)}>
                REQUEST SHARE
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}