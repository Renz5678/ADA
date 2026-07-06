import Button from '../ui/Button.jsx';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

const MaterialsTable = ({ materials, isFetching, onEdit, onDelete, onTransaction }) => {
  if (!materials || materials.length === 0) {
    return <div className="text-center py-10 text-gray-500 font-body">No materials found.</div>;
  }

  return (
    <div className={`flex-1 min-h-0 overflow-auto transition-opacity duration-150 ${isFetching ? 'opacity-60' : ''}`}>

      {/* Mobile card view */}
      <div className="flex flex-col gap-3 md:hidden">
        {materials.map((material) => (
          <div key={material.material_id} className="bg-white rounded-xl border border-[#e8d5b5] p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-headline font-semibold text-[#0F1D29] truncate">{material.material_name}</span>
              <span className="text-xs font-medium text-[#8D4A52] bg-[#FFF7E6] px-2 py-1 rounded-full shrink-0">{material.material_code}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <span className="text-gray-500">Quantity</span>
              <span className="text-right text-[#0F1D29] font-semibold">{material.quantity}</span>
              <span className="text-gray-500">Unit Cost</span>
              <span className="text-right text-[#8D4A52]">{formatCurrency(material.unit_cost)}</span>
            </div>
            <div className="flex gap-2 pt-1 border-t border-[#f0f0f0]">
              <Button variant="outline-primary" onClick={() => onTransaction(material)} className="flex-1">Log Tx</Button>
              <Button variant="secondary" onClick={() => onEdit(material)} className="flex-1">Edit</Button>
              <Button variant="danger" onClick={() => onDelete(material)} className="flex-1">Delete</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block rounded-lg border border-[#c1c1c1] overflow-auto">
        <table className="min-w-full divide-y divide-[#f0f0f0] font-body relative">
          <thead className="bg-[#F5F3F3] sticky top-0 z-10 shadow-[0_1px_0_0_#f0f0f0]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Quantity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Unit Cost</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[#0F1D29] uppercase font-label">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#f0f0f0]">
            {materials.map((material) => (
              <tr key={material.material_id} className="hover:bg-gray-50 transition duration-150">
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{material.material_code}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{material.material_name}</td>
                <td className="px-4 py-3 text-sm text-[#0F1D29]">{material.quantity}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(material.unit_cost)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-row gap-2 justify-end">
                    <Button variant="outline-primary" onClick={() => onTransaction(material)}>Log Tx</Button>
                    <Button variant="secondary" onClick={() => onEdit(material)}>Edit</Button>
                    <Button variant="danger" onClick={() => onDelete(material)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialsTable;
