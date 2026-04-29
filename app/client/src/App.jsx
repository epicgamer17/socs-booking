/* Author: Tanav Bansal and Author: Jonathan Lamontagne-Kratz */

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
import UserDashboard from './UserDashboard';
import { AuthProvider } from './utils/auth';
import { ThemeProvider } from './utils/theme';



function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <NavBar />
                    <Routes>
                        <Route path='/' element={<LandingPage />} />
                        <Route path='/register' element={<Register />} />
                        <Route path='/login' element={<Login />} />

                        <Route element={<ProtectedRoutes />}>
                            <Route path='/directory-page' element={<DirectoryPage />} />
                            <Route path='/bookingPage/:token' element={<BookingPage />} />
                            <Route path='/user-dashboard' element={<UserDashboard />} />


                            <Route element={<OwnerRoute />}>
                                <Route path='/owner-dashboard' element={<OwnerDashboard />} />
                            </Route>
                        </Route>
                    </Routes>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}


export default App
