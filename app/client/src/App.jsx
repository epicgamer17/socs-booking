import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProtectedRoutes from './utils/ProtectedRoutes';
import OwnerRoute from './utils/OwnerRoute';

import LandingPage from './LandingPage';
import Register from './Register';
import DirectoryPage from './DirectoryPage';
import BookingPage from './BookingPage';
import Login from './login';
import OwnerDashboard from './OwnerDashboard';
import { AuthProvider } from './utils/auth';



function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path='/' element={<LandingPage />} />
                    <Route path='/Register' element={<Register />} />
                    <Route path='/Login' element={<Login />} />





                    <Route element={<ProtectedRoutes />}>

                        <Route path='/DirectoryPage' element={<DirectoryPage />} />
                        <Route path='/invite/:ownerId' element={<BookingPage />} />


                        <Route element={<OwnerRoute />}>
                            <Route path='/OwnerDashboard' element={<OwnerDashboard />} />
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
