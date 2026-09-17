import { CheckIcon } from '../../../components/ui/icons';

const ITEMS = [
  'متجرك باسمك',
  'منتجات جاهزة للبيع',
  'توريد منظم',
  'إدارة متكاملة',
  'توصيل ومتابعة',
];

export default function TrustStrip() {
  return (
    <div className="trust">
      <div className="wrap">
        {ITEMS.map((label) => (
          <div className="trust-item" key={label}>
            <CheckIcon size={18} stroke="#10B7A0" strokeWidth={2} /> {label}
          </div>
        ))}
      </div>
    </div>
  );
}
