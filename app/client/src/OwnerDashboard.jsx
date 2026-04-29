// Author: Jonathan Lamontagne-Kratz
import { useState, useEffect, useCallback } from 'react';
import useAuth from './utils/auth';
import useAutoRefresh from './utils/useAutoRefresh';
import Button from './components/ui/Button';
import MailtoButton from './components/ui/MailtoButton';
import CalendarSelector from './components/CalendarSelector';
import GroupMeetingForm from './components/GroupMeetingForm';
import styles from './OwnerDashboard.module.css';

const API_URL = import.meta.env.VITE_API_URL;

function OwnerDashboard() {
  const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState({ slots: [], meetingRequests: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.token) return;
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
    } catch {
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalBookings = dashboardData.slots.filter((s) => s.bookedByEmail).length;
  const activeSlots = dashboardData.slots.filter((s) => s.isActive).length;
  const pendingRequests = dashboardData.meetingRequests.length;

  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkBusy, setLinkBusy] = useState(false);

  const fetchInviteLink = useCallback(async () => {
    if (!user?.token) return;
    try {
      const r = await fetch(`${API_URL}/url/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.message || "Failed to fetch invite link");
        return;
      }
      setInviteUrl(data.url);
    } catch {
      setError("Failed to fetch invite link");
    }
  }, [user]);

  useEffect(() => {
    fetchInviteLink();
  }, [fetchInviteLink]);

  const [polls, setPolls] = useState([]);
  const [recurrenceByPoll, setRecurrenceByPoll] = useState({});

  const fetchPolls = useCallback(async () => {
    if (!user?.token) return;
    try {
      const r = await fetch(`${API_URL}/groupMeetings/group/owner`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.message || 'Failed to fetch polls');
        return;
      }
      setPolls(data.polls ?? []);
    } catch {
      setError('Failed to fetch polls');
    }
  }, [user]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  useAutoRefresh([fetchDashboardData, fetchPolls], 5_000);

  function handlePollCreated() {
    fetchPolls();
  }

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

  async function handleFinalizePoll(pollID, candidate) {
    const weeks = recurrenceByPoll[pollID] ?? 1;
    const confirmed = window.confirm(
      `Finalize ${candidate.date} · ${candidate.timeFrom}–${candidate.timeTo}?\n` +
      `This will create ${weeks} slot${weeks === 1 ? '' : 's'} and book all voters.`
    );
    if (!confirmed) return;
    try {
      const r = await fetch(`${API_URL}/groupMeetings/group/finalize/${pollID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          winningTimeWindowID: candidate.candidateID,
          recurrenceWeeks: weeks,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.message || "Failed to finalize poll");
        return;
      }
      setPolls((prev) => prev.filter((p) => p.id !== pollID));
      setRecurrenceByPoll((prev) => {
        const { [pollID]: _, ...rest } = prev;
        return rest;
      });
      fetchDashboardData();
      if (data.mailtoUrl) {
        window.location.href = data.mailtoUrl;
      }
    } catch {
      setError("Failed to finalize poll");
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

  async function handleRegenerateLink() {
    if (!inviteUrl) {
      fetchInviteLink();
      return;
    }
    const confirmed = window.confirm("Generate a new invite link? The current one will stop working.");
    if (!confirmed) return;
    setLinkBusy(true);
    try {
      const token = inviteUrl.split('/').pop();
      const r = await fetch(`${API_URL}/url/delete/${token}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
      });
      if (!r.ok) {
        const data = await r.json();
        setError(data.message || "Failed to revoke invite link");
        return;
      }
      setInviteUrl('');
      await fetchInviteLink();
    } catch {
      setError("Failed to regenerate invite link");
    } finally {
      setLinkBusy(false);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Staff Dashboard</h1>
          <p className={styles.subtitle}>Welcome back, Administrator</p>
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
          <Button variant="danger" onClick={handleRegenerateLink} disabled={linkBusy}>
            {linkBusy ? 'Working…' : 'Generate New Link'}
          </Button>
        </div>
      </section>

      <section className={styles.section} style={{ marginBottom: '2rem' }}>
        <h2>Create Slots</h2>
        <p>Create a single slot or repeat it weekly for multiple weeks.</p>
        <CalendarSelector onCreated={fetchDashboardData} />
      </section>

      <section className={styles.section} style={{ marginBottom: '2rem' }}>
        <h2>Create Group Meeting Poll</h2>
        <p>Propose candidate time slots and invite students to vote.</p>
        <GroupMeetingForm onCreated={handlePollCreated} />
      </section>

      <section className={styles.section} style={{ marginBottom: '2rem' }}>
        <h2>Meeting Polls</h2>
        <p>Students have voted on candidate slots. Pick the winner to finalize a shared booking.</p>
        {polls.length === 0 && <p>No active polls.</p>}
        <div className={styles.activityList}>
          {polls.map((poll) => {
            const maxVotes = Math.max(...poll.candidates.map((c) => c.votes));
            return (
              <div key={poll.id} className={styles.pollCard}>
                <div className={styles.pollHeader}>
                  <strong>{poll.title}</strong>
                  <span className={styles.activityTime}>{poll.voterCount} vote{poll.voterCount === 1 ? '' : 's'} cast</span>
                  <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Recur (weeks):
                    <input
                      type="number"
                      min="1"
                      value={recurrenceByPoll[poll.id] ?? 1}
                      onChange={(e) => {
                        const n = parseInt(e.target.value, 10);
                        setRecurrenceByPoll((prev) => ({
                          ...prev,
                          [poll.id]: Number.isFinite(n) && n > 0 ? n : 1,
                        }));
                      }}
                      style={{ width: '4rem' }}
                    />
                  </label>
                </div>
                <div className={styles.pollCandidates}>
                  {poll.candidates.map((candidate) => {
                    const isLeader = candidate.votes === maxVotes && maxVotes > 0;
                    return (
                      <div
                        key={candidate.candidateID}
                        className={`${styles.activityItem} ${isLeader ? styles.leader : ''}`}
                      >
                        <span>
                          {candidate.date} · {candidate.timeFrom} – {candidate.timeTo}
                        </span>
                        <span className={styles.activityTime}>
                          {candidate.votes} vote{candidate.votes === 1 ? '' : 's'}
                          {isLeader && ' · leading'}
                        </span>
                        <Button variant="primary" onClick={() => handleFinalizePoll(poll.id, candidate)}>
                          Finalize
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
            <div key={slot.slotID} className={styles.activityItem}>
              <span>
                {slot.date} · {slot.timeFrom} – {slot.timeTo}
                {!slot.isActive && ' (private)'}
              </span>
              <span className={styles.activityTime}>
                {slot.bookedByEmail ? `Booked by ${slot.bookedByEmail}` : 'Available'}
              </span>
              <div className={styles.actionGroup}>
                {!slot.isActive && (
                  <Button variant="primary" onClick={() => handleActivate(slot.slotID)}>
                    Activate
                  </Button>
                )}
                {slot.bookedByEmail && (
                  <MailtoButton
                    variant="primary"
                    email={slot.bookedByEmail}
                    subject={`Regarding your booking on ${slot.date} (${slot.timeFrom}-${slot.timeTo})`}
                  >
                    Mail
                  </MailtoButton>
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
