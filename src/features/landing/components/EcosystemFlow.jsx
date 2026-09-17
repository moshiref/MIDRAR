import logoMark from '../../../assets/logo-mark.png';

export default function EcosystemFlow() {
  return (
    <section className="ecosystem">
      <img className="logo-watermark wm-eco" src={logoMark} alt="" />
      <div className="wrap">
        <div className="section-head center reveal">
          <span className="label">كيف تعمل المنظومة</span>
          <h2 className="h1">مدرار البنية الخلفية، مو سوق وسيط</h2>
        </div>
        <div className="flow reveal">
          <div className="flow-node supplier">
            <div className="icon-ring tile3d blue tile-64">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9">
                <path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              </svg>
            </div>
            <div className="ftitle">المورد</div><div className="fsub">منتجات ومخزون</div>
          </div>
          <div className="flow-connector"><span className="pulse" style={{ animationDelay: '0s' }}></span></div>
          <div className="flow-node midrar">
            <div
              className="icon-ring tile3d tile-64"
              style={{ background: 'linear-gradient(150deg,#7BF6DB,#10B7A0 40%,#0A63D6 80%,#063C8C)' }}
            >
              <img
                src={logoMark}
                style={{
                  width: '34px',
                  height: 'auto',
                  position: 'relative',
                  zIndex: 1,
                  filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.35))',
                }}
                alt=""
              />
            </div>
            <div className="ftitle">مدرار</div><div className="fsub">البنية والتشغيل</div>
          </div>
          <div className="flow-connector"><span className="pulse" style={{ animationDelay: '.65s' }}></span></div>
          <div className="flow-node merchant">
            <div className="icon-ring tile3d teal tile-64">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9">
                <path d="M3 9l9-6 9 6v10a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />
              </svg>
            </div>
            <div className="ftitle">التاجر</div><div className="fsub">متجر وعلامة</div>
          </div>
          <div className="flow-connector"><span className="pulse" style={{ animationDelay: '1.3s' }}></span></div>
          <div className="flow-node customer">
            <div className="icon-ring tile3d navy tile-64">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9">
                <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </div>
            <div className="ftitle">العميل</div><div className="fsub">تسوق واستلام</div>
          </div>
        </div>
        <p className="flow-note">شبكة توصيل متكاملة تربط كل مرحلة من التجهيز حتى التسليم</p>
      </div>
    </section>
  );
}
