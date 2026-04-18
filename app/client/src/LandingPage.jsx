import {Route,Link} from 'react-router-dom'
import Register from './Register';
import './LandingPage.css'
import Login from './login';


function LandingPage(){

    return(
        <div className='landing'>      

                <h1>Booking Application</h1><br/>

            

                <Link className='link-register' to='/Register'>Register</Link>
                <Link className='link-login' to='/Login'>Log In</Link>
            
               
        </div>
        );


}

export default LandingPage