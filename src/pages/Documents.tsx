import { useRef, useState } from "react";
import { useToast } from "../components/ui/useToast";
import Toast from "../components/ui/Toast";
import type { ProjectFile } from "../lib/uiTypes";

interface WorkspaceFile extends ProjectFile {
  owner: string;
  meta: string;
}

const initialFiles: WorkspaceFile[] = [
  { id: "f1", name: "API_Spec_v2.pdf", icon: "📄", visibility: "SHARED", owner: "Priya", meta: "shared • 2.1 MB" },
  { id: "f2", name: "frontend-build/", icon: "📁", visibility: "SHARED", owner: "Arun", meta: "folder • 18 files" },
  { id: "f3", name: "analyzer.py", icon: "💻", visibility: "PRIVATE", owner: "Priya", meta: "private" },
];

const teammates = ["Arun — Frontend", "Meena — Analytics", "Vishal — QA / DevOps"];

export default function Documents() {
  const { toastMessage, showToast } = useToast();
  const [files, setFiles] = useState<WorkspaceFile[]>(initialFiles);
  const [person, setPerson] = useState(teammates[0]);
  const [item, setItem] = useState("frontend-build / API integration code");
  const [reason, setReason] = useState(
    "I need the completed API integration module to connect it with the analytics dashboard."
  );
  const [sentRequests, setSentRequests] = useState<string[]>([
    "Arun • frontend-build / API integration code • Integration dependency",
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  function handleUpload(fileList: FileList | null, kind: "file" | "folder") {
    if (!fileList || fileList.length === 0) return;
    // TODO: replace with Person 1's real upload call
    const label = kind === "folder"
      ? `📁 ${(fileList[0] as any).webkitRelativePath?.split("/")[0] || "project-folder"}/`
      : `📄 ${fileList[0].name}`;
    setFiles((prev) => [
      { id: crypto.randomUUID(), name: label, icon: "", visibility: "PRIVATE", owner: "Priya", meta: "private by default" },
      ...prev,
    ]);
    showToast(`${kind === "folder" ? "Folder" : "Files"} uploaded to your workspace ✓`);
  }

  function shareFile(id: string, name: string) {
    // TODO: call Person 1's requestDocumentShare(id) / shareDocument(id)
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, visibility: "SHARED" } : f)));
    showToast(`${name} shared with the project ✓`);
  }

  function sendWorkRequest() {
    if (!item.trim()) {
      showToast("Enter the work you need first");
      return;
    }
    const name = person.split(" — ")[0];
    setSentRequests((prev) => [`${name} • ${item} • ${reason}`, ...prev]);
    showToast(`Work request sent to ${name} ✓`);
  }

  return (
    <section>
      <div className="section-head">
        <div>
          <div className="eyebrow">PROJECT KNOWLEDGE BASE</div>
          <h2>DOCUMENTS + WORK.</h2>
          <p>Upload individual files or an entire project folder. Keep private work private until you explicitly share it.</p>
        </div>
        <div>
          <button className="btn" onClick={() => fileInputRef.current?.click()}>+ UPLOAD FILES</button>{" "}
          <button className="btn pink" onClick={() => folderInputRef.current?.click()}>+ UPLOAD FOLDER</button>
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
            // @ts-ignore
            webkitdirectory=""
            directory=""
            multiple
            hidden
            onChange={(e) => { handleUpload(e.target.files, "folder"); e.target.value = ""; }}
          />
        </div>
      </div>

      <div className="notice blue">
        Uploads are stored as <b>private by default</b>. You choose when to
        share them with the project. Shared files become available to authorized AI analysis.
      </div>

      <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="panel">
          <h3>MY WORKSPACE</h3>
          <div className="upload" onClick={() => fileInputRef.current?.click()}>
            DROP WORK FILES HERE
            <br />
            <span className="small">PDF • DOCX • ZIP • PY • JS • images • datasets • any project file</span>
          </div>
          <div>
            {files.map((file) => (
              <div key={file.id} className="file-row">
                <span>
                  {file.icon} {file.name}
                  <br />
                  <small>{file.owner} • {file.meta}</small>
                </span>
                <span>
                  <span className="chip">{file.visibility}</span>
                  {file.visibility === "PRIVATE" ? (
                    <button className="btn teal" onClick={() => shareFile(file.id, file.name)}>SHARE</button>
                  ) : (
                    <button className="btn paper" onClick={() => showToast("Share link copied ✓")}>COPY</button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>REQUEST COMPLETED WORK</h3>
          <div className="notice pink">
            Need something another teammate already finished? Send a targeted
            request for the exact file, folder, code module or document you need for your integration.
          </div>
          <div className="form-row">
            <div>
              <label>Teammate</label>
              <select value={person} onChange={(e) => setPerson(e.target.value)}>
                {teammates.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label>Needed work</label>
              <input value={item} onChange={(e) => setItem(e.target.value)} />
            </div>
          </div>
          <label>Why do you need it?</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
          <button className="btn teal" onClick={sendWorkRequest}>SEND WORK REQUEST</button>
          <div style={{ marginTop: 10 }}>
            {sentRequests.map((r, i) => (
              <div key={i} className="approval"><b>REQUESTED</b><br /><span className="small">{r}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <h3>PROJECT-SHARED FILES</h3>
        <div className="three-col" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          <div className="kpi"><b>{files.filter((f) => f.visibility === "SHARED").length} FILES</b><br /><span className="small">Available to authorized AI analysis</span></div>
          <div className="kpi"><b>03 FOLDERS</b><br /><span className="small">Shared project directories</span></div>
          <div className="kpi"><b>{sentRequests.length} REQUESTS</b><br /><span className="small">Pending teammate/document requests</span></div>
        </div>
      </div>

      <Toast message={toastMessage} />
    </section>
  );
}