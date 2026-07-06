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
    <div className={`overflow-x-auto rounded-lg border border-[#c1c1c1] transition-opacity duration-150 ${isFetching ? 'opacity-60' : ''}`}>
      <table className="min-w-full divide-y divide-[#f0f0f0] font-body">
        <thead className="bg-[#F5F3F3]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Title</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Category</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Amount</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#0F1D29] uppercase font-label">Date</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-[#0F1D29] uppercase font-label">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[#f0f0f0]">
          {expenses.map((expense) => {
            return (
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ExpensesTable;
