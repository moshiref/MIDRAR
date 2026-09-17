import EmptyState from '../../components/ui/EmptyState';

/** Stand-in for supplier-portal pages not yet built by a later phase of the delivery plan. */
export default function SupplierPagePlaceholder({ title }) {
  return (
    <div>
      <h1 className="mb-4 text-xl font-extrabold text-text-primary">{title}</h1>
      <EmptyState title="قيد الإنشاء" message="هاد القسم رح يُبنى في مرحلة لاحقة من خطة تنفيذ لوحة المورد." />
    </div>
  );
}
