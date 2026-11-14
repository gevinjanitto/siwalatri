import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useStore } from "@/store/AppStore";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Panel } from "./AdminLayout";
import { Dropdown } from "@/components/common/Dropdown";

const inp = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--teal)]";

const FieldInput = ({ f, value, onChange, master }) => {
  if (f.type === "select") {
    const opts = f.options(master);
    return <Dropdown testid={`crud-field-${f.key}`} sub={f.label} value={value ?? ""} onChange={(v) => onChange(opts.find((o) => String(o.value) === v)?.value ?? v)} options={opts} />;
  }
  if (f.type === "textarea") return <textarea data-testid={`crud-field-${f.key}`} rows={3} className={inp} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  if (f.type === "file") return (
    <div className="flex items-center gap-3">
      {value && <img src={value} alt="" className="h-12 w-12 rounded-full object-cover" />}
      <input data-testid={`crud-field-${f.key}`} type="file" accept="image/*" className="text-xs" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onload = () => onChange(r.result); r.readAsDataURL(file); } }} />
    </div>
  );
  return <input data-testid={`crud-field-${f.key}`} type={f.type || "text"} className={inp} value={value ?? ""} onChange={(e) => onChange(f.type === "number" ? Number(e.target.value) : e.target.value)} />;
};

export const CrudTable = ({ entity, config }) => {
  const st = useStore();
  const rows = st.master[entity] || [];
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);
  const fl = config.filter;
  const list = rows.filter((r) => JSON.stringify(Object.values(r)).toLowerCase().includes(q.toLowerCase()) && (!filter || String(r[fl.key]) === filter));

  const save = () => {
    const missing = config.fields.filter((f) => f.required && (edit.data[f.key] === undefined || edit.data[f.key] === ""));
    if (missing.length) return toast.error(`${missing[0].label} wajib diisi`);
    const err = config.validate?.(edit.data, edit.mode);
    if (err) return toast.error(err);
    const { _pwNow, _pwNew, ...data } = edit.data;
    st.crud(entity, edit.mode, data);
    toast.success(edit.mode === "create" ? `${config.singular} ditambahkan` : `${config.singular} diperbarui`);
    setEdit(null);
  };

  return (
    <Panel data-testid={`crud-${entity}`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full bg-[var(--canvas)] px-4 py-2.5">
          <Search className="h-4 w-4 text-slate-500" /><input data-testid={`crud-${entity}-search`} value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Cari ${config.singular.toLowerCase()}…`} className="w-full bg-transparent text-sm outline-none" />
        </div>
        {fl && (
          <Dropdown variant="pill" testid={`crud-${entity}-filter`} value={filter} onChange={setFilter} options={[{ value: "", label: `Semua ${fl.label}` }, ...fl.options(st.master)]} className="min-w-[180px]" />
        )}
        <button data-testid={`crud-${entity}-add`} onClick={() => setEdit({ mode: "create", data: {} })} className="flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal)]"><Plus className="h-4 w-4" />Tambah</button>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-slate-500"><tr>{config.columns.map((c) => <th key={c.key} className="pb-3 pr-4 font-semibold">{c.label}</th>)}<th className="pb-3 text-right font-semibold">Aksi</th></tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-[var(--canvas)]/60" data-testid={`crud-${entity}-row-${r.id}`}>
                {config.columns.map((c) => <td key={c.key} className="py-3 pr-4">{c.render ? c.render(r, st.master) : r[c.key]}</td>)}
                <td className="py-3 text-right whitespace-nowrap">
                  <button data-testid={`crud-${entity}-edit-${r.id}`} onClick={() => setEdit({ mode: "update", data: { ...r } })} className="rounded-full p-2 text-slate-600 hover:bg-[var(--foam)] hover:text-teal-800"><Pencil className="h-4 w-4" /></button>
                  <button data-testid={`crud-${entity}-delete-${r.id}`} onClick={() => setDel(r)} className="rounded-full p-2 text-slate-600 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={9} className="py-10 text-center text-slate-500">Tidak ada data</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500">{list.length} dari {rows.length} data</p>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[28px] sm:max-w-xl" data-testid="crud-dialog">
          <DialogHeader><DialogTitle className="font-display text-2xl">{edit?.mode === "create" ? "Tambah" : "Ubah"} {config.singular}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {edit && config.fields.filter((f) => !f.onlyOn || f.onlyOn === edit.mode).map((f) => (
              <div key={f.key} className={`block ${f.full ? "sm:col-span-2" : ""}`}>
                <span className="mb-1 block text-xs font-medium text-slate-600">{f.label}{f.required && " *"}</span>
                <FieldInput f={f} master={st.master} value={edit.data[f.key]} onChange={(v) => setEdit({ ...edit, data: { ...edit.data, [f.key]: v } })} />
              </div>
            ))}
          </div>
          <DialogFooter><button data-testid="crud-dialog-cancel" onClick={() => setEdit(null)} className="rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-slate-100">Batal</button><button data-testid="crud-dialog-save" onClick={save} className="rounded-full bg-[var(--ink)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal)]">Simpan</button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent className="rounded-[28px]">
          <AlertDialogHeader><AlertDialogTitle>Hapus {config.singular.toLowerCase()}?</AlertDialogTitle><AlertDialogDescription>Data “{del?.[config.columns[0].key] ?? del?.nama}” akan dihapus. {config.deleteNote || ""}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel data-testid="crud-delete-cancel" className="rounded-full">Batal</AlertDialogCancel><AlertDialogAction data-testid="crud-delete-confirm" className="rounded-full bg-red-600 hover:bg-red-700" onClick={() => { st.crud(entity, "delete", del); toast.success("Data dihapus"); setDel(null); }}>Hapus</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  );
};
