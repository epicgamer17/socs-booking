import { useParams } from "react-router-dom"
import useAuth from "./utils/auth"
import { useEffect, useState } from "react"



const API_URL = import.meta.env.VITE_API_URL
function BookingPage(){
    const {ownerId}  = useParams()
    const{user} = useAuth()
    const[slots,setSlots] = useState([])
    const[error,setError] = useState("")


    // useEffect(()=>{

    //     async function fetchSlots() {

    //         const r = await fetch(`${API_URL}/slots/owner/${ownerId}`, {
    //             method: "GET",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "Authorization": `Bearer ${user.token}`
    //             },
    //         });

    //         const data = await r.json();
    //         if (!r.ok) {
    //             setError(data.message || "Failed to fetch data")
    //             return;
    //         }
    //         setSlots(data)

    //     }

    //     if (user?.token && ownerId) {
    //         fetchSlots();

    //     }

    // },[user,ownerId])

    useEffect(() => {
  const dummySlots = [
    {
      id: 1,
      date: "2026-04-22",
      timeFrom: "10:00",
      timeTo: "10:30",
    },
    {
      id: 2,
      date: "2026-04-22",
      timeFrom: "11:00",
      timeTo: "11:30",
    },
    {
      id: 3,
      date: "2026-04-23",
      timeFrom: "09:00",
      timeTo: "09:30",
    },
    {
      id: 4,
      date: "2026-04-23",
      timeFrom: "14:00",
      timeTo: "14:30",
    },
  ];

  setSlots(dummySlots);
}, []);

    async function handleBooking(slotId) {
        const confirmation = window.confirm("Are you sure you want to book this slot?")
        if(!confirmation){
            return;
        }

        const r = await fetch(`${API_URL}/bookings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`
            },
            body:JSON.stringify({id:slotId}) ,
        });

        const data = await r.json();
        if (!r.ok) {
            setError(data.message || "Failed to fetch data")
            return;
        }

        if(data.mailtoUrl){
            window.open(data.mailtoUrl)
        }

        setSlots((prev)=>prev.filter(s=>s.id!==slotId))
        
    }




    return(
        <div>
            <h1>Booking Page</h1>
            {slots.length===0&& <p>no active slots available for this owner.</p>}
            {error&&<p style={{color:"red"}}>{error}</p>}
            
            <div className="header-block">

                <h2>Date</h2>
                <h2>From</h2>
                <h2>To</h2>
            </div>

            {slots.map((s, index) => {
                return (<div key={s.id} className="slot-row">
                    <p>{s.date}</p>
                    <p>{s.timeFrom}</p>
                    <p>{s.timeTo}</p>
                    <button onClick={()=>handleBooking(s.id)}>
                        Book Slot
                    </button>
                </div>);
            }

                        )}
        </div>
    )



}


export default BookingPage