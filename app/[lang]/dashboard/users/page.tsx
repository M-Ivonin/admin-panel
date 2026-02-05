'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Search, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  getUsers,
  User,
  RetentionStage,
  RETENTION_STAGE_LABELS,
  RETENTION_STAGE_COLORS,
  PaginatedUsersResponse,
  RetentionCounts,
} from '@/lib/api/users';

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getPlanBadge(plan: string | undefined) {
  const colors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-800',
    playmaker: 'bg-purple-100 text-purple-800',
    probro: 'bg-amber-100 text-amber-800',
  };
  return colors[plan || 'free'] || 'bg-gray-100 text-gray-800';
}

const RETENTION_STAGES = [
  RetentionStage.NEW,
  RetentionStage.CURRENT,
  RetentionStage.AT_RISK_WAU,
  RetentionStage.AT_RISK_MAU,
  RetentionStage.DEAD,
  RetentionStage.REACTIVATED,
  RetentionStage.RESURRECTED,
] as const;

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function UsersPage() {
  const params = useParams();
  const lang = params.lang || 'en';

  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [retentionCounts, setRetentionCounts] = useState<RetentionCounts | null>(null);

  // Filter state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRetentionStage, setSelectedRetentionStage] = useState<RetentionStage | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: PaginatedUsersResponse = await getUsers({
        page,
        limit,
        search: debouncedSearch || undefined,
        retentionStage: selectedRetentionStage || undefined,
      });
      setUsers(response.users || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 0);
      setRetentionCounts(response.retentionCounts || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedRetentionStage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRetentionStageClick = (stage: RetentionStage) => {
    if (selectedRetentionStage === stage) {
      setSelectedRetentionStage(null);
    } else {
      setSelectedRetentionStage(stage);
    }
    setPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page on limit change
  };

  const getUserDisplayName = (user: User) => {
    return user.name_app || user.name_tg || user.email || user.telegram_username || 'Unknown';
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (page > 3) {
        pages.push('...');
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (page < totalPages - 2) {
        pages.push('...');
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <span className="text-sm text-gray-500">({total} total)</span>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Retention Stage Filter Chips */}
          {retentionCounts && (
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedRetentionStage(null);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    selectedRetentionStage === null
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({total})
                </button>
                {RETENTION_STAGES.map((stage) => {
                  const count = retentionCounts[stage] || 0;
                  const isSelected = selectedRetentionStage === stage;
                  return (
                    <button
                      key={stage}
                      onClick={() => handleRetentionStageClick(stage)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                        isSelected
                          ? 'ring-2 ring-offset-1 ring-gray-900'
                          : ''
                      } ${RETENTION_STAGE_COLORS[stage]}`}
                    >
                      {RETENTION_STAGE_LABELS[stage]} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search and actions */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, email, username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-gray-900"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Show:</span>
                  <select
                    value={limit}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-900"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUsers}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          )}

          {/* Users table */}
          {!isLoading && !error && (
            <>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Level
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          XP / Points
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          First Seen
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Active
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Language
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">
                                {getUserDisplayName(user)}
                              </span>
                              <span className="text-xs text-gray-500">{user.email || '-'}</span>
                              {user.telegram_username && (
                                <span className="text-xs text-blue-600">@{user.telegram_username}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.retentionStage ? RETENTION_STAGE_COLORS[user.retentionStage] : 'bg-gray-100 text-gray-800'}`}
                            >
                              {user.retentionStage ? RETENTION_STAGE_LABELS[user.retentionStage] : 'Unknown'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanBadge(user.subscription?.activePlan)}`}
                            >
                              {user.subscription?.activePlan || 'free'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">
                                Lvl {user.level}
                              </span>
                              <span className="text-xs text-gray-500">{user.levelName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-900">
                                {user.totalXp.toLocaleString()} XP
                              </span>
                              <span className="text-xs text-gray-500">
                                {user.totalPoints.toLocaleString()} pts
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.first_seen_at)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(user.last_active_at)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.language}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Link href={`/${lang}/dashboard/bot-chat?userId=${user.id}`}>
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                Chat
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                            {debouncedSearch || selectedRetentionStage
                              ? 'No users found matching your filters'
                              : 'No users found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} users
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((pageNum, index) =>
                        pageNum === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                            ...
                          </span>
                        ) : (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum as number)}
                            className={`px-3 py-1 text-sm rounded-md ${
                              page === pageNum
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
