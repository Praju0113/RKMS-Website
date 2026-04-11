import { AdminLayout } from './AdminLayout';
import { useState, useEffect, useCallback } from 'react';
import { Search, Download, Calendar, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../services/api';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipId: string;
  city: string;
  state: string;
  joinDate: string;
  status: 'Active' | 'Inactive';
}

const MEMBERS_FETCH_LIMIT = 2000;

function csvEscape(value: unknown): string {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function triggerFileDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([`\uFEFF${content}`], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function MemberManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadMembers = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Please login to view members');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await adminApi.getMembers(token, 1, MEMBERS_FETCH_LIMIT);
      if (response.success && Array.isArray(response.members)) {
        const rows: Member[] = response.members.map((m: Record<string, unknown>) => ({
          id: String(m.id),
          name: String(m.name ?? ''),
          email: String(m.email ?? ''),
          phone: String(m.phone ?? ''),
          membershipId: String(m.membership_id ?? ''),
          city: String(m.city ?? ''),
          state: String(m.state ?? ''),
          joinDate: String(m.created_at ?? ''),
          status: m.is_active === 1 || m.is_active === true ? 'Active' : 'Inactive',
        }));
        setMembers(rows);
        const total = (response as { pagination?: { total?: number } }).pagination?.total;
        if (total != null && total > MEMBERS_FETCH_LIMIT) {
          toast.info(`Showing first ${MEMBERS_FETCH_LIMIT} of ${total} members.`);
        }
      } else {
        toast.error('Failed to load members');
        setMembers([]);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load members');
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers, refreshKey]);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.membershipId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm);

    const memberDate = new Date(member.joinDate);
    const validDate = !Number.isNaN(memberDate.getTime());
    const matchesStartDate =
      !startDate || (validDate && memberDate >= new Date(startDate));
    const matchesEndDate =
      !endDate || (validDate && memberDate <= new Date(`${endDate}T23:59:59`));

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  const handleExportCSV = () => {
    const headers = ['Membership ID', 'Name', 'Email', 'Phone', 'City', 'State', 'Status', 'Join Date'];
    const lines = [
      headers.map(csvEscape).join(','),
      ...filteredMembers.map((member) =>
        [
          member.membershipId,
          member.name,
          member.email,
          member.phone,
          member.city,
          member.state,
          member.status,
          (member.joinDate || '').slice(0, 10),
        ]
          .map(csvEscape)
          .join(',')
      ),
    ];
    triggerFileDownload(lines.join('\n'), `members_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    toast.success('CSV download started — check your Downloads folder.');
  };

  const handleExportExcel = () => {
    const headers = ['Membership ID', 'Name', 'Email', 'Phone', 'City', 'State', 'Status', 'Join Date'];
    const lines = [
      headers.join('\t'),
      ...filteredMembers.map((member) =>
        [
          member.membershipId,
          member.name,
          member.email,
          member.phone,
          member.city,
          member.state,
          member.status,
          (member.joinDate || '').slice(0, 10),
        ].join('\t')
      ),
    ];
    triggerFileDownload(lines.join('\n'), `members_${new Date().toISOString().split('T')[0]}.xls`, 'application/vnd.ms-excel');
    toast.success('Spreadsheet download started — check your Downloads folder.');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Member Management</h1>
            <p className="text-gray-600 mt-2">View, search, and export member information</p>
          </div>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh list
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or membership ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={!filteredMembers.length}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={!filteredMembers.length}
              className="flex items-center gap-2 px-4 py-2 bg-[#0A6C87] text-white rounded-lg font-semibold hover:bg-[#085569] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Members ({isLoading ? '…' : filteredMembers.length}
              {!isLoading && members.length !== filteredMembers.length ? ` of ${members.length}` : ''})
            </h2>
          </div>
          {isLoading ? (
            <div className="p-12 text-center text-gray-600">Loading members…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Membership ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      State
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.membershipId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.city}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.state}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {member.joinDate ? new Date(member.joinDate).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && filteredMembers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No members found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
