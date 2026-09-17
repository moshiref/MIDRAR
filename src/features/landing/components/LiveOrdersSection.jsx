import { useEffect, useRef, useState } from 'react';

const STORES = ['متجر لمسة', 'متجر روزا', 'متجر أثاث البيت', 'متجر عبق', 'متجر لؤلؤة الشام', 'متجر كنوز'];
const CITIES = ['دمشق', 'حلب', 'حمص', 'اللاذقية', 'طرطوس', 'درعا'];
const STATUSES = [
  { t: 'طلب مؤكد', cls: 'ok' },
  { t: 'قيد التجهيز', cls: 'pending' },
  { t: 'تم التسليم', cls: 'ok' },
  { t: 'خرج للتوصيل', cls: 'pending' },
];

const INITIAL_ROWS = [
  { id: 'seed-1', cls: 'ok', t: 'طلب مؤكد · متجر لمسة', s: 'دمشق · قبل لحظات', amt: 240 },
  { id: 'seed-2', cls: 'pending', t: 'قيد التجهيز · متجر روزا', s: 'حلب · قبل دقيقة', amt: 115 },
  { id: 'seed-3', cls: 'ok', t: 'تم التسليم · متجر أثاث البيت', s: 'حمص · قبل 3 دقائق', amt: 860 },
  { id: 'seed-4', cls: 'ok', t: 'طلب مؤكد · متجر عبق', s: 'اللاذقية · قبل 4 دقائق', amt: 95 },
];

/**
 * Faithful port of the live-feed simulation. The original manipulated the
 * DOM directly (prepend a row, trim to 6, bump a counter) driven by a
 * setInterval that only ran while #liveFeed was in view. Here that becomes
 * React state (`rows`, `liveCount`) updated on the same 3200ms cadence,
 * gated by the same IntersectionObserver threshold (0.2).
 */
export default function LiveOrdersSection() {
  const feedRef = useRef(null);
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [liveCount, setLiveCount] = useState(1248);
  const nextId = useRef(1);

  useEffect(() => {
    const feedEl = feedRef.current;
    if (!feedEl) return;

    let liveInterval = null;

    function pushLiveRow() {
      const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
      const store = STORES[Math.floor(Math.random() * STORES.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const amt = Math.floor(60 + Math.random() * 400);

      setRows((prev) => {
        const row = {
          id: `live-${nextId.current++}`,
          cls: status.cls,
          t: `${status.t} · ${store}`,
          s: `${city} · الآن`,
          amt,
        };
        const next = [row, ...prev];
        while (next.length > 6) next.pop();
        return next;
      });
      setLiveCount((c) => c + 1);
    }

    const liveIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !liveInterval) {
            liveInterval = setInterval(pushLiveRow, 3200);
          } else if (!entry.isIntersecting && liveInterval) {
            clearInterval(liveInterval);
            liveInterval = null;
          }
        });
      },
      { threshold: 0.2 }
    );

    liveIO.observe(feedEl);

    return () => {
      liveIO.disconnect();
      if (liveInterval) clearInterval(liveInterval);
    };
  }, []);

  return (
    <section className="live-section">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="label">مباشر من الشبكة</span>
          <h2 className="h1">كل طلب، من كل متجر، لحظة بلحظة</h2>
        </div>
        <div className="live-stats reveal">
          <div className="live-stat"><div className="num en" id="liveCount">{liveCount.toLocaleString('en-US')}</div><div className="cap">طلب اليوم</div></div>
          <div className="live-stat"><div className="num en">98.6%</div><div className="cap">نسبة التأكيد</div></div>
          <div className="live-stat"><div className="num en">+40</div><div className="cap">قطاع نشاط</div></div>
        </div>
        <div className="live-feed reveal" id="liveFeed" ref={feedRef}>
          {rows.map((row) => (
            <div className="live-row" key={row.id}>
              <span className={`dotstatus ${row.cls}`}></span>
              <div className="info"><div className="t">{row.t}</div><div className="s">{row.s}</div></div>
              <div className="amt en">{row.amt}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
