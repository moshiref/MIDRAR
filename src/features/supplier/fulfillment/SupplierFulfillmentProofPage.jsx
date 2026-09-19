import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Video, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import PageHeader from '../ui/PageHeader';
import { SkeletonRows } from '../ui/Skeleton';
import { useToast } from '../ui/SupplierToast';
import { useSupplierSession } from '../session/SupplierSessionContext';
import { getOrders, getFulfillmentProofs, addFulfillmentProof } from '../data/mockSupplierDb';

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('ar-SY', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function SupplierFulfillmentProofPage() {
  const { supplier, employee, hasPermission } = useSupplierSession();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState(null);
  const [proofsByOrder, setProofsByOrder] = useState({});
  const [selectedOrderId, setSelectedOrderId] = useState(searchParams.get('order'));
  const [files, setFiles] = useState([]);
  const [note, setNote] = useState('');

  const canUpload = hasPermission('fulfillment');

  const reload = async () => {
    const list = await getOrders(supplier.id);
    setOrders(list);
    const entries = await Promise.all(list.map(async (o) => [o.id, await getFulfillmentProofs(o.id)]));
    setProofsByOrder(Object.fromEntries(entries));
    if (!selectedOrderId && list.length) setSelectedOrderId(list[0].id);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier.id]);

  const selectedOrder = useMemo(() => orders?.find((o) => o.id === selectedOrderId) ?? null, [orders, selectedOrderId]);
  const selectedProofs = proofsByOrder[selectedOrderId] ?? [];

  const handleSelectOrder = (id) => {
    setSelectedOrderId(id);
    setSearchParams({ order: id });
  };

  const handleFilesChange = (fileList) => {
    setFiles(Array.from(fileList).map((f) => ({ name: f.name, type: f.type.startsWith('video') ? 'video' : 'image' })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderId || files.length === 0) return;
    await addFulfillmentProof({ orderId: selectedOrderId, files, note: note.trim(), uploadedBy: employee.name, actorName: employee.name });
    showToast('تم رفع إثبات التجهيز');
    setFiles([]); setNote('');
    reload();
  };

  if (orders === null) {
    return (
      <div>
        <PageHeader title="إثبات التجهيز" />
        <SkeletonRows rows={4} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="إثبات التجهيز" subtitle="وثّق تجهيز الطلب بفيديو أو صور قبل التسليم، لحمايتك عند أي نزاع لاحق." />

      {orders.length === 0 ? (
        <EmptyState title="لا توجد طلبات بعد" message="ستظهر الطلبات هنا لرفع إثبات التجهيز الخاص بكل واحد." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <Card className="h-fit p-2">
            <ul className="flex flex-col gap-1">
              {orders.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectOrder(o.id)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-start text-sm font-bold ${
                      o.id === selectedOrderId ? 'bg-brand-navy text-white' : 'text-text-secondary hover:bg-surface-subtle'
                    }`}
                  >
                    <span>{o.opRef}</span>
                    {(proofsByOrder[o.id]?.length ?? 0) > 0 && <CheckCircle2 size={14} strokeWidth={2} className="text-success" />}
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <div className="flex flex-col gap-4">
            {selectedOrder && canUpload && (
              <Card>
                <h2 className="mb-3 text-sm font-extrabold text-text-primary">رفع إثبات جديد — {selectedOrder.opRef}</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <label className="flex flex-col gap-1 text-sm font-bold text-text-primary">
                    فيديو أو صور
                    <input type="file" accept="video/*,image/*" multiple onChange={(e) => handleFilesChange(e.target.files)} className="text-sm" />
                  </label>
                  {files.length > 0 && (
                    <ul className="text-xs text-text-secondary">
                      {files.map((f) => <li key={f.name}>{f.name} ({f.type === 'video' ? 'فيديو' : 'صورة'})</li>)}
                    </ul>
                  )}
                  <label className="flex flex-col gap-1 text-sm font-bold text-text-primary">
                    ملاحظات
                    <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} className="rounded-md border border-border-default px-3 py-2 text-sm font-normal text-text-primary" />
                  </label>
                  <button type="submit" disabled={files.length === 0} className="self-end rounded-md bg-brand-navy px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                    رفع
                  </button>
                </form>
              </Card>
            )}

            <Card>
              <h2 className="mb-3 text-sm font-extrabold text-text-primary">سجل الإثباتات</h2>
              {selectedProofs.length === 0 ? (
                <p className="text-sm text-text-secondary">لا يوجد إثبات تجهيز مرفوع لهذا الطلب بعد.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {selectedProofs.map((p) => (
                    <li key={p.id} className="rounded-md border border-border-default p-3 text-sm">
                      <div className="mb-1 flex flex-wrap gap-2">
                        {p.files.map((f, i) => (
                          <span key={i} className="flex items-center gap-1 rounded-full bg-surface-subtle px-2 py-0.5 text-xs font-bold text-text-secondary">
                            {f.type === 'video' ? <Video size={12} strokeWidth={2} /> : <ImageIcon size={12} strokeWidth={2} />} {f.name}
                          </span>
                        ))}
                      </div>
                      {p.note && <p className="mb-1 text-text-primary">{p.note}</p>}
                      <div className="text-xs text-text-muted">{p.uploadedBy} — {formatDateTime(p.uploadedAt)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
