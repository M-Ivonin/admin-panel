'use client';

import { useState, useEffect } from 'react';
import { getAllUsers, User } from '@/lib/api/users';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserSelectProps {
  onUserSelect: (userId: string) => void;
  selectedUserId?: string;
}

function getUserDisplayName(user: User): string {
  return user.name_app || user.name_tg || user.email || user.telegram_username || 'Unknown';
}

export function UserSelect({ onUserSelect, selectedUserId }: UserSelectProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load users';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(term) ||
      user.name_app?.toLowerCase().includes(term) ||
      user.name_tg?.toLowerCase().includes(term) ||
      user.telegram_username?.toLowerCase().includes(term)
    );
  });

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {selectedUser ? (
          <div>
            <div className="font-medium text-gray-900">{getUserDisplayName(selectedUser)}</div>
            <div className="text-sm text-gray-600">{selectedUser.email || '-'}</div>
          </div>
        ) : (
          <div className="text-gray-500">Select a user...</div>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 border border-gray-300 rounded-md bg-white shadow-lg">
          <div className="p-2 border-b border-gray-200">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-gray-900"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {error && (
              <div className="p-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-600">Loading users...</span>
              </div>
            )}

            {!isLoading && !error && filteredUsers.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-600">
                {users.length === 0 ? 'No users found' : 'No matching users'}
              </div>
            )}

            {!isLoading &&
              !error &&
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onUserSelect(user.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="font-medium text-gray-900">{getUserDisplayName(user)}</div>
                  <div className="text-sm text-gray-600">{user.email || '-'}</div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
