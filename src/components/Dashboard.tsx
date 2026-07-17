'use client'

// src/components/Dashboard.tsx
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthContext } from './AuthProvider'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { InviteUserModal } from './InviteUserModal'
import { deleteProperty, updateViewingRequestStatus } from '@/lib/properties'
import { setUserRole } from '@/lib/auth'
import { theme, roleBadgeColor } from '@/styles/theme'
import type { Property, Profile, ViewingRequest, UserRole, ViewingStatus } from '@/types/database'
import type { AdminUserRow } from '@/lib/admin-users.server'

export function Dashboard({
  profile,
  initialProperties,
  initialUsers,
  usersError,
  initialViewingRequests,
}: {
  profile: Profile
  initialProperties: Property[]
  initialUsers: AdminUserRow[]
  usersError?: string | null
  initialViewingRequests: ViewingRequest[]
}) {
  const router = useRouter()
  const { signOut } = useAuthContext()
  const [properties, setProperties] = useState(initialProperties)
  const [users, setUsers] = useState(initialUsers)
  const [requests, setRequests] = useState(initialViewingRequests)
  const [pendingDelete, setPendingDelete] = useState<Property | null>(null)
  const [pendingDeleteUser, setPendingDeleteUser] = useState<AdminUserRow | null>(null)
  const [showInvite, setShowInvite] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  const isAdmin = profile.role === 'admin'

  const stats = [
    { label: isAdmin ? 'All Listings' : 'My Listings', value: properties.length, icon: '🏠' },
    { label: 'For Sale', value: properties.filter((p) => p.type === 'For Sale').length, icon: '🔑' },
    { label: 'For Rent', value: properties.filter((p) => p.type === 'For Rent').length, icon: '📋' },
    { label: 'Viewing Requests', value: requests.length, icon: '📅' },
  ]

  const filteredUsers = users.filter((u) => {
    const q = userSearch.trim().toLowerCase()
    if (!q) return true
    return u.full_name.toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q) || u.role.includes(q)
  })

  function flash(msg: string) {
    setNotice(msg)
    setTimeout(() => setNotice(''), 3500)
  }

  async function handleLogout() {
    await signOut()
    router.push('/')
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    setBusy(true)
    try {
      await deleteProperty(pendingDelete.id)
      setProperties((prev) => prev.filter((p) => p.id !== pendingDelete.id))
      flash(`"${pendingDelete.name}" was archived.`)
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Could not delete this property.')
    } finally {
      setBusy(false)
      setPendingDelete(null)
    }
  }

  async function handleRoleChange(userId: string, role: UserRole) {
    try {
      await setUserRole(userId, role)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)))
      flash('Role updated.')
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Could not update role.')
    }
  }

  async function handleRequestStatus(requestId: string, status: ViewingStatus) {
    try {
      await updateViewingRequestStatus(requestId, status)
      setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status } : r)))
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Could not update request.')
    }
  }

  async function handleToggleSuspend(user: AdminUserRow) {
    const action = user.is_suspended ? 'unsuspend' : 'suspend'
    try {
      const res = await fetch(`/api/admin/users/${user.id}/${action}`, { method: 'POST' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Request failed.')
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_suspended: !u.is_suspended } : u)))
      flash(user.is_suspended ? `${user.full_name} can sign in again.` : `${user.full_name} has been suspended.`)
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Could not update this account.')
    }
  }

  async function handleConfirmDeleteUser() {
    if (!pendingDeleteUser) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/users/${pendingDeleteUser.id}`, { method: 'DELETE' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Could not delete this user.')
      setUsers((prev) => prev.filter((u) => u.id !== pendingDeleteUser.id))
      flash(`${pendingDeleteUser.full_name} was deleted.`)
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Could not delete this user.')
    } finally {
      setBusy(false)
      setPendingDeleteUser(null)
    }
  }

  async function handleInvite(data: { email: string; fullName: string; role: UserRole }) {
    const res = await fetch('/api/admin/users/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const body = await res.json()
    if (!res.ok) throw new Error(body.error ?? 'Could not send invite.')
    flash(`Invitation sent to ${data.email}.`)
    setShowInvite(false)
    // The invited user doesn't have a profiles row until they accept,
    // so there's nothing to add to the table yet — just confirm the send.
  }

  return (
    <main style={{ maxWidth: 1160, margin: '0 auto', padding: '36px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <h1 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 24, margin: 0 }}>
            {profile.full_name}&apos;s Dashboard
          </h1>
          <span style={{ background: roleBadgeColor(profile.role), color: '#fff', borderRadius: 3, padding: '1px 8px', fontSize: 10, fontWeight: 700, fontFamily: theme.font.body, textTransform: 'uppercase' }}>
            {profile.role}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {profile.role !== 'viewer' && (
            <Link href="/properties/new" style={{ background: theme.color.gold, color: '#fff', borderRadius: 6, padding: '10px 20px', fontFamily: theme.font.body, fontSize: 13, fontWeight: 700 }}>
              + Add Property
            </Link>
          )}
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: `1px solid ${theme.color.navy}`,
              color: theme.color.navy,
              borderRadius: 6,
              padding: '10px 18px',
              fontFamily: theme.font.body,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Log out
          </button>
        </div>
      </div>

      {notice && (
        <div style={{ background: theme.color.navy, color: '#fff', padding: '10px 16px', borderRadius: 8, fontFamily: theme.font.body, fontSize: 13, margin: '20px 0' }}>
          {notice}
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '28px 0 36px' }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', flex: '1 1 140px', boxShadow: theme.shadow.card }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: theme.font.display, fontSize: 26, fontWeight: 700, color: theme.color.navy }}>{s.value}</div>
            <div style={{ fontFamily: theme.font.body, fontSize: 12, color: theme.color.textMuted }}>{s.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 18, marginBottom: 14 }}>
        {isAdmin ? 'All Properties' : 'My Properties'}
      </h2>
      <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: theme.shadow.card, marginBottom: 36 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: theme.color.navy }}>
              {['Image', 'Name', 'Price', 'Status', 'Agent', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px 14px', fontFamily: theme.font.body, fontSize: 12, fontWeight: 700, color: '#fff', textAlign: 'left' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {properties.map((p, i) => {
              const canEditRow = isAdmin || p.agent_id === profile.id
              return (
                <tr key={p.id} style={{ borderBottom: `1px solid ${theme.color.border}`, background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '10px 14px' }}>
                    {p.primary_image && (
                      <Image src={p.primary_image} alt="" width={52} height={40} style={{ objectFit: 'cover', borderRadius: 5 }} />
                    )}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: theme.font.body, fontSize: 13, fontWeight: 700, color: theme.color.navy }}>
                    <Link href={`/properties/${p.id}`} style={{ color: 'inherit' }}>{p.name}</Link>
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: theme.font.body, fontSize: 12 }}>
                    {p.currency} {Number(p.price).toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: theme.font.body, fontSize: 12, textTransform: 'capitalize' }}>{p.status}</td>
                  <td style={{ padding: '10px 14px', fontFamily: theme.font.body, fontSize: 12 }}>{p.agent?.full_name ?? '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {canEditRow && (
                        <Link href={`/properties/${p.id}/edit`} style={{ fontFamily: theme.font.body, fontSize: 12, color: theme.color.navy, border: `1px solid ${theme.color.navy}`, borderRadius: 4, padding: '4px 10px' }}>
                          Edit
                        </Link>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => setPendingDelete(p)}
                          style={{ fontFamily: theme.font.body, fontSize: 12, color: '#fff', background: theme.color.red, border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {properties.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 28, color: theme.color.textMuted, fontFamily: theme.font.body, fontSize: 13 }}>
                  No properties yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 18, marginBottom: 14 }}>
        Viewing Requests
      </h2>
      <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: theme.shadow.card, marginBottom: 36 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: theme.color.navy }}>
              {['Property', 'Requester', 'Contact', 'Status', 'Update'].map((h) => (
                <th key={h} style={{ padding: '12px 14px', fontFamily: theme.font.body, fontSize: 12, fontWeight: 700, color: '#fff', textAlign: 'left' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: `1px solid ${theme.color.border}`, background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '10px 14px', fontFamily: theme.font.body, fontSize: 12, fontWeight: 700, color: theme.color.navy }}>
                  {r.property?.name ?? '—'}
                </td>
                <td style={{ padding: '10px 14px', fontFamily: theme.font.body, fontSize: 12 }}>{r.contact_name}</td>
                <td style={{ padding: '10px 14px', fontFamily: theme.font.body, fontSize: 12 }}>
                  {r.contact_email}{r.contact_phone ? ` · ${r.contact_phone}` : ''}
                </td>
                <td style={{ padding: '10px 14px', fontFamily: theme.font.body, fontSize: 12, textTransform: 'capitalize' }}>{r.status}</td>
                <td style={{ padding: '10px 14px' }}>
                  <select
                    value={r.status}
                    onChange={(e) => handleRequestStatus(r.id, e.target.value as ViewingStatus)}
                    style={{ border: `1px solid ${theme.color.border}`, borderRadius: 4, padding: '4px 8px', fontFamily: theme.font.body, fontSize: 12 }}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 28, color: theme.color.textMuted, fontFamily: theme.font.body, fontSize: 13 }}>
                  No viewing requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAdmin && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 18, margin: 0 }}>User Management</h2>
            <button
              onClick={() => setShowInvite(true)}
              style={{ background: theme.color.gold, color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontFamily: theme.font.body, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              + Invite User
            </button>
          </div>

          {usersError && (
            <div style={{ background: '#fdecec', color: theme.color.red, padding: '10px 14px', borderRadius: 6, fontSize: 13, fontFamily: theme.font.body, marginBottom: 14 }}>
              <strong>Couldn&apos;t load the user list:</strong> {usersError}
              <div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>
                Everything else on this page still works. Refresh to try again.
              </div>
            </div>
          )}

          <input
            placeholder="Search by name, email, or role…"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            style={{
              width: '100%', maxWidth: 340, border: `1px solid ${theme.color.border}`, borderRadius: 6,
              padding: '8px 12px', fontFamily: theme.font.body, fontSize: 13, marginBottom: 14, boxSizing: 'border-box',
            }}
          />

          <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: theme.shadow.card }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: theme.color.navy }}>
                  {['Name', 'Email', 'Role', 'Status', 'Change Role', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '12px 14px', fontFamily: theme.font.body, fontSize: 12, fontWeight: 700, color: '#fff', textAlign: 'left' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${theme.color.border}`, background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '10px 14px', fontFamily: theme.font.body, fontSize: 13, fontWeight: 700, color: theme.color.navy }}>{u.full_name}</td>
                    <td style={{ padding: '10px 14px', fontFamily: theme.font.body, fontSize: 12, color: theme.color.textMuted }}>{u.email ?? '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: roleBadgeColor(u.role), color: '#fff', borderRadius: 3, padding: '1px 8px', fontSize: 10, fontWeight: 700, fontFamily: theme.font.body, textTransform: 'uppercase' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {u.is_suspended ? (
                        <span style={{ background: theme.color.red, color: '#fff', borderRadius: 3, padding: '1px 8px', fontSize: 10, fontWeight: 700, fontFamily: theme.font.body }}>SUSPENDED</span>
                      ) : (
                        <span style={{ background: theme.color.green, color: '#fff', borderRadius: 3, padding: '1px 8px', fontSize: 10, fontWeight: 700, fontFamily: theme.font.body }}>ACTIVE</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {u.id !== profile.id && (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          style={{ border: `1px solid ${theme.color.border}`, borderRadius: 4, padding: '4px 8px', fontFamily: theme.font.body, fontSize: 12 }}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="agent">Agent</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {u.id !== profile.id && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => handleToggleSuspend(u)}
                            style={{
                              fontFamily: theme.font.body, fontSize: 12, cursor: 'pointer', borderRadius: 4, padding: '4px 10px', border: `1px solid ${theme.color.navy}`,
                              background: '#fff', color: theme.color.navy,
                            }}
                          >
                            {u.is_suspended ? 'Reinstate' : 'Suspend'}
                          </button>
                          <button
                            onClick={() => setPendingDeleteUser(u)}
                            style={{ fontFamily: theme.font.body, fontSize: 12, color: '#fff', background: theme.color.red, border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 28, color: theme.color.textMuted, fontFamily: theme.font.body, fontSize: 13 }}>
                      No users match &quot;{userSearch}&quot;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {pendingDelete && (
        <DeleteConfirmModal
          title="Delete property"
          message={`Remove "${pendingDelete.name}" from listings? This can't be undone from here.`}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleConfirmDelete}
          busy={busy}
        />
      )}

      {pendingDeleteUser && (
        <DeleteConfirmModal
          title="Delete user"
          message={`Permanently delete ${pendingDeleteUser.full_name}'s account? This can't be undone. If they still own listings, consider suspending them instead.`}
          onCancel={() => setPendingDeleteUser(null)}
          onConfirm={handleConfirmDeleteUser}
          busy={busy}
        />
      )}

      {showInvite && (
        <InviteUserModal onClose={() => setShowInvite(false)} onInvite={handleInvite} />
      )}
    </main>
  )
}
