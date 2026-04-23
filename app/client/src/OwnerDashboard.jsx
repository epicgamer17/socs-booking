
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from './utils/auth';
import './index.css';

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

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Owner Dashboard</h1>
            <p>Welcome back, Administrator</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => navigate("/DirectoryPage")} className="nav-btn">View Directory</button>
            <button onClick={() => { logout(); navigate("/Login"); }} className="nav-btn logout">Logout</button>
          </div>
        </div>
      </header>

      {error && <p style={{ color: '#ed1b2f' }}>{error}</p>}

      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p className="stat-value">{totalBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Active Slots</h3>
          <p className="stat-value">{activeSlots}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Requests</h3>
          <p className="stat-value">{pendingRequests}</p>
        </div>
      </div>

      <section className="dashboard-section">
        <h2>Your Slots</h2>
        {loading && <p>Loading...</p>}
        {!loading && dashboardData.slots.length === 0 && <p>No slots yet.</p>}
        <div className="activity-list">
          {dashboardData.slots.map((slot) => (
            <div key={slot.slotID} className="activity-item">
              <span>
                {slot.date} · {slot.timeFrom} – {slot.timeTo}
                {!slot.isActive && ' (inactive)'}
              </span>
              <span className="activity-time">
                {slot.bookedByEmail ? `Booked by ${slot.bookedByEmail}` : 'Available'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .dashboard-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          color: #fff;
          font-family: 'Inter', sans-serif;
        }
        .dashboard-header {
          margin-bottom: 3rem;
          border-bottom: 2px solid #ed1b2f;
          padding-bottom: 1rem;
        }
        .dashboard-header h1 {
          font-size: 2.5rem;
          margin: 0;
          color: #ed1b2f;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          transition: transform 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          border-color: #ed1b2f;
        }
        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #ed1b2f;
          margin: 0.5rem 0 0 0;
        }
        .dashboard-section {
          background: rgba(0, 0, 0, 0.2);
          padding: 2rem;
          border-radius: 16px;
        }
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .activity-item {
          display: flex;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }
        .nav-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: #ed1b2f;
        }
        .nav-btn.logout:hover {
          background: #ed1b2f;
          border-color: #ed1b2f;
        }
      `}</style>
    </div>
  );
}

export default OwnerDashboard;
