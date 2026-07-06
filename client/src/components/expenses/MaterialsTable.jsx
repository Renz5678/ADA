import Button from '../ui/Button.jsx';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

const MaterialsTable = ({ materials, isFetching, onEdit, onDelete, onTransaction }) => {
  if (!materials || materials.length === 0) {
    return <div className="text-center py-10 text-gray-500 font-body">No materials found.</div>;
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-[#c1c1c1] transition-opacity duration-150 ${isFetching ? 'opacity-60' : ''}`}>
      <table className="min-w-full divide-y divide-[#f0f0f0] font-body">
        <thead className="bg-[#F5F3F3]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Code</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Quantity</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Unit Cost</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-[#0F1D29] uppercase font-label">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[#f0f0f0]">
          {materials.map((material) => {
            return (
              <tr key={material.material_id} className="hover:bg-gray-50 transition duration-150">
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{material.material_code}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{material.material_name}</td>
                <td className="px-4 py-3 text-sm text-[#0F1D29]">{material.quantity}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(material.unit_cost)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-row gap-2 justify-end">
                    <Button variant="secondary" onClick={() => onTransaction(material)}>Log Tx</Button>
                    <Button variant="secondary" onClick={() => onEdit(material)}>Edit</Button>
                    <Button variant="danger" onClick={() => onDelete(material)}>Delete</Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MaterialsTable;
