import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProtectedRoutes from './utils/ProtectedRoutes';
import OwnerRoute from './utils/OwnerRoute';

import LandingPage from './LandingPage';
import Register from './Register';
import DirectoryPage from './DirectoryPage';
import BookingPage from './BookingPage';
import Login from './login';
import OwnerDashboard from './OwnerDashboard';
import NavBar from './components/NavBar';
import { AuthProvider } from './utils/auth';
import UserDashboard from './userDashboard';


function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <NavBar />
                <Routes>
                    <Route path='/' element={<LandingPage />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/login' element={<Login />} />





                    <Route element={<ProtectedRoutes />}>

                        <Route path='/directory-page' element={<DirectoryPage />} />
                        <Route path='/invite/:ownerId' element={<BookingPage />} />
                        <Route path='/user-dashboard' element={<UserDashboard/>} />


                        <Route element={<OwnerRoute />}>
                            <Route path='/owner-dashboard' element={<OwnerDashboard />} />
                        </Route>

                    </Route>

                </Routes>
            </AuthProvider>
        </BrowserRouter>

    );
}


export default App

// import { useState } from 'react'
// test
// import { useState, useEffect } from 'react';

// function App() {
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     fetch('http://localhost:5000/api/test')
//       .then(res => res.json())
//       .then(setData);
//   }, []);

//   return <pre>{JSON.stringify(data)}</pre>;
// }

// export default App;
