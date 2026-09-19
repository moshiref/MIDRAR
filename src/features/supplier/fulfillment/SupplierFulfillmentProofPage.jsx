import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Video, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
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
      <section className="page">
        <div className="page-head"><div><h1>إثبات التجهيز</h1></div></div>
        <div className="skeleton" style={{ height: 220 }} />
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h1>إثبات التجهيز</h1>
          <div className="sub">وثّق تجهيز الطلب بفيديو أو صور قبل التسليم، لحمايتك عند أي نزاع لاحق.</div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="title">لا توجد طلبات بعد</div>
            <div className="msg">ستظهر الطلبات هنا لرفع إثبات التجهيز الخاص بكل واحد.</div>
          </div>
        </div>
      ) : (
        <div className="split-panel">
          <div className="panel">
            <div className="split-list">
              {orders.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`split-list-item${o.id === selectedOrderId ? ' active' : ''}`}
                  onClick={() => handleSelectOrder(o.id)}
                >
                  <span className="en">{o.opRef}</span>
                  {(proofsByOrder[o.id]?.length ?? 0) > 0 && <CheckCircle2 size={14} strokeWidth={2} color="var(--success)" />}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selectedOrder && canUpload && (
              <div className="panel">
                <div className="panel-head"><h3>رفع إثبات جديد — {selectedOrder.opRef}</h3></div>
                <form onSubmit={handleSubmit} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="field full">
                    <label>فيديو أو صور</label>
                    <input type="file" accept="video/*,image/*" multiple onChange={(e) => handleFilesChange(e.target.files)} style={{ border: 'none', padding: '6px 0' }} />
                  </div>
                  {files.length > 0 && (
                    <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {files.map((f) => <li key={f.name}>{f.name} ({f.type === 'video' ? 'فيديو' : 'صورة'})</li>)}
                    </ul>
                  )}
                  <div className="field full">
                    <label>ملاحظات</label>
                    <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
                  </div>
                  <button type="submit" disabled={files.length === 0} className="btn btn-primary" style={{ alignSelf: 'flex-end', opacity: files.length === 0 ? 0.5 : 1 }}>
                    رفع
                  </button>
                </form>
              </div>
            )}

            <div className="panel">
              <div className="panel-head"><h3>سجل الإثباتات</h3></div>
              <div style={{ padding: selectedProofs.length ? '16px 22px' : 0 }}>
                {selectedProofs.length === 0 ? (
                  <div className="empty-state" style={{ padding: '32px 16px' }}>
                    <div className="msg">لا يوجد إثبات تجهيز مرفوع لهذا الطلب بعد.</div>
                  </div>
                ) : (
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {selectedProofs.map((p) => (
                      <li key={p.id} style={{ border: '1px solid var(--border-default)', borderRadius: 9, padding: 12, fontSize: '0.86rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                          {p.files.map((f, i) => (
                            <span key={i} className="badge badge-neutral">
                              {f.type === 'video' ? <Video size={12} strokeWidth={2} /> : <ImageIcon size={12} strokeWidth={2} />} {f.name}
                            </span>
                          ))}
                        </div>
                        {p.note && <p style={{ marginBottom: 6 }}>{p.note}</p>}
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{p.uploadedBy} — {formatDateTime(p.uploadedAt)}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
