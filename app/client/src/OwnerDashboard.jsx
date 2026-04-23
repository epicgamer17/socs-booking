
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from './utils/auth';
import Button from './components/ui/Button';
import styles from './OwnerDashboard.module.css';

const API_URL = import.meta.env.VITE_API_URL;

function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [dashboardData, setDashboardData] = useState({ slots: [], meetingRequests: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const r = await fetch(`${API_URL}/dashboard/owner`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`,
          },
        });

        const data = await r.json();
        if (!r.ok) {
          setError(data.message || "Failed to fetch dashboard data");
          return;
        }

        setDashboardData({
          slots: data.slots || [],
          meetingRequests: data.meetingRequests || [],
        });
      } catch (err) {
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    }

    if (user?.token) {
      fetchDashboardData();
    }
  }, [user]);

  const totalBookings = dashboardData.slots.filter((s) => s.bookedByEmail).length;
  const activeSlots = dashboardData.slots.filter((s) => s.isActive).length;
  const pendingRequests = dashboardData.meetingRequests.length;

  // JWT payload holds { id, role, email } — decode to build the invite link
  const ownerId = (() => {
    try {
      return user?.token ? JSON.parse(atob(user.token.split('.')[1])).id : null;
    } catch {
      return null;
    }
  })();

  const inviteUrl = ownerId ? `${window.location.origin}/invite/${ownerId}` : '';
  const [copied, setCopied] = useState(false);

  async function handleActivate(slotID) {
    try {
      const r = await fetch(`${API_URL}/slots/activate/${slotID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.message || "Failed to activate slot");
        return;
      }
      setDashboardData((prev) => ({
        ...prev,
        slots: prev.slots.map((s) => (s.slotID === slotID ? { ...s, isActive: 1 } : s)),
      }));
    } catch {
      setError("Failed to activate slot");
    }
  }

  async function handleDelete(slotID) {
    const confirmed = window.confirm("Delete this slot? The booker will be notified.");
    if (!confirmed) return;

    try {
      const r = await fetch(`${API_URL}/slots/delete/${slotID}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.message || "Failed to delete slot");
        return;
      }
      setDashboardData((prev) => ({
        ...prev,
        slots: prev.slots.filter((s) => s.slotID !== slotID),
      }));
      if (data.emailToNotify) {
        window.location.href = `mailto:${data.emailToNotify}?subject=Booking Cancelled`;
      }
    } catch {
      setError("Failed to delete slot");
    }
  }

  async function handleRequestAction(requestID, action) {
    try {
      const r = await fetch(`${API_URL}/request/${action}/${requestID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.message || `Failed to ${action} request`);
        return;
      }

      const accepted = action === "accept";
      const acceptedRequest = accepted
        ? dashboardData.meetingRequests.find((req) => req.id === requestID)
        : null;

      setDashboardData((prev) => ({
        ...prev,
        meetingRequests: prev.meetingRequests.filter((req) => req.id !== requestID),
        slots: accepted && acceptedRequest
          ? [
            ...prev.slots,
            {
              slotID: `pending-${requestID}`,
              date: acceptedRequest.date,
              timeFrom: acceptedRequest.timeFrom,
              timeTo: acceptedRequest.timeTo,
              isActive: 1,
              bookedByEmail: acceptedRequest.bookedByEmail,
            },
          ]
          : prev.slots,
      }));

      if (data.emailToNotify) {
        const subject = accepted ? "Meeting Request Accepted" : "Meeting Request Declined";
        const body = `Your meeting request on ${data.date} from ${data.timeFrom} to ${data.timeTo} has been ${accepted ? "accepted" : "declined"}.`;
        window.location.href = `mailto:${data.emailToNotify}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
    } catch {
      setError(`Failed to ${action} request`);
    }
  }

  async function handleCopyInvite() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy to clipboard");
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Owner Dashboard</h1>
            <p>Welcome back, Administrator</p>
          </div>
          <div className={styles.actionGroup}>
            <Button variant="secondary" onClick={() => navigate("/DirectoryPage")}>View Directory</Button>
            <Button variant="danger" onClick={() => { logout(); navigate("/Login"); }}>Logout</Button>
          </div>
        </div>
      </header>

      {error && <p style={{ color: '#ed1b2f' }}>{error}</p>}

      <div className={styles.grid}>
        <div className={styles.statCard}>
          <h3>Total Bookings</h3>
          <p className={styles.statValue}>{totalBookings}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Active Slots</h3>
          <p className={styles.statValue}>{activeSlots}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Pending Requests</h3>
          <p className={styles.statValue}>{pendingRequests}</p>
        </div>
      </div>

      <section className={styles.section} style={{ marginBottom: '2rem' }}>
        <h2>Invite Link</h2>
        <p>Share this link so students can book with you directly.</p>
        <div className={styles.inviteRow}>
          <input className={styles.inviteInput} type="text" readOnly value={inviteUrl} />
          <Button variant="primary" onClick={handleCopyInvite} disabled={!inviteUrl}>
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </div>
      </section>

      <section className={styles.section} style={{ marginBottom: '2rem' }}>
        <h2>Pending Meeting Requests</h2>
        {!loading && dashboardData.meetingRequests.length === 0 && <p>No pending requests.</p>}
        <div className={styles.activityList}>
          {dashboardData.meetingRequests.map((req) => (
            <div key={req.id} className={styles.requestItem}>
              <div className={styles.requestInfo}>
                <strong>{req.bookedByEmail}</strong>
                <span>{req.date} · {req.timeFrom} – {req.timeTo}</span>
                {req.message && <span className={styles.requestMessage}>"{req.message}"</span>}
              </div>
              <div className={styles.actionGroup}>
                <Button variant="primary" onClick={() => handleRequestAction(req.id, 'accept')}>
                  Accept
                </Button>
                <Button variant="danger" onClick={() => handleRequestAction(req.id, 'decline')}>
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Your Slots</h2>
        {loading && <p>Loading...</p>}
        {!loading && dashboardData.slots.length === 0 && <p>No slots yet.</p>}
        <div className={styles.activityList}>
          {dashboardData.slots.map((slot) => (
            <div key={slot.slotID} className="activity-item">
              <span>
                {slot.date} · {slot.timeFrom} – {slot.timeTo}
                {!slot.isActive && ' (private)'}
              </span>
              <span className="activity-time">
                {slot.bookedByEmail ? `Booked by ${slot.bookedByEmail}` : 'Available'}
              </span>
              <div className={styles.actionGroup}>
                {!slot.isActive && (
                  <Button variant="primary" onClick={() => handleActivate(slot.slotID)}>
                    Activate
                  </Button>
                )}
                <Button variant="danger" onClick={() => handleDelete(slot.slotID)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default OwnerDashboard;
