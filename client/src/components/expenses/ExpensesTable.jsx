import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

const ExpensesTable = ({ expenses, isFetching, onEdit, onDelete }) => {
  if (!expenses || expenses.length === 0) {
    return <div className="text-center py-10 text-gray-500 font-body">No expenses found.</div>;
  }

  return (
    <div className={`flex-1 min-h-0 overflow-auto transition-opacity duration-150 ${isFetching ? 'opacity-60' : ''}`}>

      {/* Mobile card view */}
      <div className="flex flex-col gap-3 md:hidden">
        {expenses.map((expense) => (
          <div key={expense.expense_id} className="bg-white rounded-xl border border-[#e8d5b5] p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-headline font-semibold text-[#0F1D29] truncate">{expense.title}</span>
              <Badge label={expense.category} bgColor="bg-[#E8F2FF]" textColor="text-blue-800" />
            </div>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="text-right font-semibold text-[#8D4A52]">{formatCurrency(expense.amount)}</span>
              <span className="text-gray-500">Date</span>
              <span className="text-right text-[#0F1D29]">{formatDate(expense.expense_date)}</span>
            </div>
            <div className="flex gap-2 pt-1 border-t border-[#f0f0f0]">
              <Button variant="secondary" onClick={() => onEdit(expense)} className="flex-1">Edit</Button>
              <Button variant="danger" onClick={() => onDelete(expense)} className="flex-1">Delete</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block rounded-lg border border-[#c1c1c1] overflow-auto">
        <table className="min-w-full divide-y divide-[#f0f0f0] font-body relative">
          <thead className="bg-[#F5F3F3] sticky top-0 z-10 shadow-[0_1px_0_0_#f0f0f0]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[#0F1D29] uppercase font-label">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#f0f0f0]">
            {expenses.map((expense) => (
              <tr key={expense.expense_id} className="hover:bg-gray-50 transition duration-150">
                <td className="px-4 py-3 text-sm text-gray-900">{expense.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <Badge label={expense.category} bgColor="bg-[#E8F2FF]" textColor="text-blue-800" />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-[#8D4A52]">{formatCurrency(expense.amount)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(expense.expense_date)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-row gap-2 justify-end">
                    <Button variant="secondary" onClick={() => onEdit(expense)}>Edit</Button>
                    <Button variant="danger" onClick={() => onDelete(expense)}>Delete</Button>
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

export default ExpensesTable;
