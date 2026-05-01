import { AdminLayout } from './AdminLayout';
import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../services/api';

interface Transaction {
  id: string;
  name: string;
  email: string;
  type: 'donation' | 'membership' | 'event';
  amount: number;
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
  payment_id?: string;
  membership_id?: string;
  donationPurpose?: 'Scholarship' | 'Health' | 'General' | 'Education';
  panNumber?: string;
  donorAddress?: string;
}

export function PaymentManagement() {
  const [filterType, setFilterType] = useState<'all' | 'donation' | 'membership' | 'event'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [filterDonationPurpose, setFilterDonationPurpose] = useState<'all' | 'Scholarship' | 'Health' | 'General' | 'Education'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Please login to access payments');
      return;
    }

    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const response = await adminApi.getPayments(token, currentPage, 10);
        if (response.success && response.payments) {
          setTransactions(response.payments);
          if (response.pagination) {
            setTotalPages(response.pagination.pages);
          }
        } else {
          toast.error('Failed to fetch payments');
        }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
    };

    fetchPayments();
  }, [currentPage]);

  const filteredTransactions = transactions.filter((transaction) => {
    if (filterType !== 'all' && transaction.type !== filterType) return false;
    if (filterStatus !== 'all' && transaction.status !== filterStatus) return false;
    if (filterDonationPurpose !== 'all' && transaction.donationPurpose !== filterDonationPurpose) return false;
    if (startDate && new Date(transaction.created_at) < new Date(startDate)) return false;
    if (endDate && new Date(transaction.created_at) > new Date(endDate)) return false;
    return true;
  });

  const amt = (t: Transaction) => Number(t.amount) || 0;
  const totalAmount = filteredTransactions.reduce((sum: number, t: Transaction) => sum + amt(t), 0);
  const totalDonations = filteredTransactions.filter((t: Transaction) => t.type === 'donation').reduce((sum: number, t: Transaction) => sum + amt(t), 0);
  const totalMemberships = filteredTransactions.filter((t: Transaction) => t.type === 'membership').reduce((sum: number, t: Transaction) => sum + amt(t), 0);
  const totalEventFees = filteredTransactions.filter((t: Transaction) => t.type === 'event').reduce((sum: number, t: Transaction) => sum + amt(t), 0);

  const handleExport = () => {
    const esc = (v: unknown) => {
      const s = String(v ?? '');
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = [
      ['ID', 'Name', 'Email', 'Type', 'Amount', 'Date', 'Status', 'Payment ID', 'Donation Purpose', 'PAN Number', 'Address'],
      ...filteredTransactions.map((t) => [
        t.id,
        t.name || 'Guest',
        t.email || '',
        t.type,
        Number(t.amount) || 0,
        new Date(t.created_at).toLocaleDateString(),
        t.status,
        t.payment_id || '',
        t.type === 'donation' && t.donationPurpose ? t.donationPurpose : '',
        t.type === 'donation' && t.panNumber ? t.panNumber : '',
        t.type === 'donation' && t.donorAddress ? t.donorAddress : '',
      ]),
    ];
    const csv = rows.map((row) => row.map(esc).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast.success('CSV download started — check your Downloads folder.');
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#0A6C87] text-white rounded-lg hover:bg-[#0a5a73] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A6C87]"
              >
                <option value="all">All Types</option>
                <option value="donation">Donations</option>
                <option value="membership">Memberships</option>
                <option value="event">Event Fees</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Donation Purpose</label>
              <select
                value={filterDonationPurpose}
                onChange={(e) => setFilterDonationPurpose(e.target.value as any)}
                disabled={filterType !== 'all' && filterType !== 'donation'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A6C87] disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="all">All Purposes</option>
                <option value="Scholarship">Scholarship</option>
                <option value="Health">Health</option>
                <option value="General">General</option>
                <option value="Education">Education</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A6C87]"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A6C87]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A6C87]"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterType('all');
                  setFilterStatus('all');
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Amount</h3>
            <p className="text-2xl font-bold text-[#0A6C87]">₹{totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Donations</h3>
            <p className="text-2xl font-bold text-green-600">₹{totalDonations.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Memberships</h3>
            <p className="text-2xl font-bold text-blue-600">₹{totalMemberships.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Event Fees</h3>
            <p className="text-2xl font-bold text-purple-600">₹{totalEventFees.toLocaleString()}</p>
          </div>
        </div>

        {/* Donation Purpose Breakdown */}
        {(filterType === 'all' || filterType === 'donation') && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Breakdown by Purpose</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <h4 className="text-sm font-medium text-gray-700">Scholarship</h4>
                </div>
                <p className="text-xl font-bold text-purple-700">₹{donationByPurpose.Scholarship.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h4 className="text-sm font-medium text-gray-700">Health</h4>
                </div>
                <p className="text-xl font-bold text-red-700">₹{donationByPurpose.Health.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <h4 className="text-sm font-medium text-gray-700">General</h4>
                </div>
                <p className="text-xl font-bold text-gray-700">₹{donationByPurpose.General.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h4 className="text-sm font-medium text-gray-700">Education</h4>
                </div>
                <p className="text-xl font-bold text-blue-700">₹{donationByPurpose.Education.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Transactions ({filteredTransactions.length})</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-lg text-gray-600">Loading payments...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donation Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PAN Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.name || 'Guest'}</div>
                        <div className="text-xs text-gray-500">{transaction.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 capitalize">
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{amt(transaction).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaction.payment_id || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaction.type === 'donation' && transaction.donationPurpose ? (
                          <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                            transaction.donationPurpose === 'Scholarship'
                              ? 'bg-purple-100 text-purple-800'
                              : transaction.donationPurpose === 'Health'
                              ? 'bg-red-100 text-red-800'
                              : transaction.donationPurpose === 'Education'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {transaction.donationPurpose}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaction.type === 'donation' && transaction.panNumber ? (
                          transaction.panNumber
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        {transaction.type === 'donation' && transaction.donorAddress ? (
                          <div className="truncate" title={transaction.donorAddress}>
                            {transaction.donorAddress}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredTransactions.length === 0 && !isLoading && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No transactions found matching your filters.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#0A6C87] text-white rounded-md hover:bg-[#0a5a73] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-[#0A6C87] text-white rounded-md hover:bg-[#0a5a73] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
