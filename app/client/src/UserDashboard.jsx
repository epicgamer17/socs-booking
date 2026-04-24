import { useNavigate } from "react-router-dom"
import useAuth from "./utils/auth"
import { useEffect, useState } from "react"

import Button from './components/ui/Button';
import MailtoButton from "./components/ui/MailtoButton";
import styles from './UserDashboard.module.css';



const API_URL = import.meta.env.VITE_API_URL;


function UserDashboard(){

    const navigate = useNavigate()
    const{user,logout} = useAuth()
    const[bookings,setBookings] = useState([])
    const[error,setError] = useState()
    const[loading,setLoading] = useState(true)

    useEffect(()=>{
        async function fetchBookings() {
            try{
                const r = await fetch(`${API_URL}/dashboard/student`,{
                    method:"GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${user.token}`,
                    },
                });

                const data  = await r.json();
                if(!r.ok){
                    setError(data.message || "Failed to fetch bookings")
                    return;
                }

                setBookings(data);
            }
            catch(err){
                setError("Failed to fetch Bookings")
            }
            finally{
                setLoading(false);
            } 
        }

        if(user?.token){
            fetchBookings();
        }
    },[user?.token]);
    
    async function handleCancel(bookingID){
        const confirm = window.confirm("Are you sure you want to cancel this booking?")
        if (!confirm) {
            return;
            
        }

        try{

            const r = await fetch(`${API_URL}/bookings/${bookingID}`,{
                    method:"DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${user.token}`,
                    },
            });

            const data  = await r.json();

            if(!r.ok){
                setError(data.message || "Failed to Cancel booking")
                return;
            }

            const newBookingList = bookings.filter((b)=>b.bookingID !==bookingID)

            setBookings(newBookingList);

            if (data.emailToNotify) {
                window.location.href = `mailto:${data.emailToNotify}?subject=Booking Cancelled`

            }  
        }
        catch{
            setError("Failed to cancel the booking")
        }
    
    }











    return(

        

        
    
        <div className={styles.container}>




            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>User Dashboard</h1>
                    <p className={styles.subtitle}>Welcome back,Student</p>
                </div>
                <div className={styles.actionGroup}>
                    <Button variant="danger" onClick={() => { logout(); navigate("/login"); }}>Logout</Button>
                </div>
            </header>





            {error && <p style={{color:"red"}}>{error}</p>}

            <div className={styles.grid}>
                <div className={styles.statCard}>
                    <h3>Total Bookings</h3>
                    <p className={styles.statValue}>{bookings.length}</p>
                </div>
            </div>




            <section className={styles.section}>
                <h2>Your Bookings</h2>
                {loading && <p>Loading..</p>}
                {!loading && bookings.length===0 && <p>No Bookings</p>}


                <div className={styles.activityList}>
                    {bookings.map((b)=>{
                        return <div key={b.bookingID} className={styles.activityItem}>
                            <span>
                                {b.date} · {b.timeFrom} - {b.timeTo}
                            </span>

                            <span className={styles.activityTime}>
                                {b.ownerEmail}
                            </span>

                            <div className={styles.actionGroup}>
                                <MailtoButton variant="primary" email={b.ownerEmail}>
                                    Mail
                                </MailtoButton>

                                <Button variant="danger" onClick={()=> handleCancel(b.bookingID)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    })}
                </div>


            </section>

        </div>);





}

export default UserDashboard