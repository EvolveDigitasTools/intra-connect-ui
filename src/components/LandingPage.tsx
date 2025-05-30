import React, { useEffect, useState } from 'react';
import '../index.css';
import { Navigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, removeRedirect } from '../features/auth/authSlice';
import { RootState } from '../app/store';
import { Spinner } from 'flowbite-react';
import { Notification } from '../interface';
import { addNotification } from '../features/notificationService/notificationSlice';

const LandingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const code = searchParams.get('code');


  useEffect(() => {
    const loginUsingCode = async (code: string) => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/login/${code}`);
        dispatch(loginSuccess(response.data.data))
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.error('Error fetching access token:', error);
        const notification: Notification = {
          id: new Date().getTime(),
          message: 'Some Error Occured while logging in',
          type: 'error',
          timed: false
        }
        if (process.env.NODE_ENV != 'development')
          dispatch(addNotification(notification))
      }
    };

    if (code) {
      setLoading(true)
      loginUsingCode(code);
    }
  }, []);

  if (auth.isAuthenticated) {
    const redirect = auth.redirectPath
    setTimeout(() => dispatch(removeRedirect()), 1000)    
    if (redirect)
      return (<div>
        <Navigate to={redirect} />
      </div>)
    else
      return (<div>
        <Navigate to="/dashboard" />
      </div>)
  }

  if (loading)
    return (<section className="w-full h-[90vh] flex justify-center items-center">
      <Spinner size="xl" />
    </section>)

  return (
    <div className="mx-auto sm:px-6 sm:py-16 lg:px-16 h-[90vh]">
      <div className="relative isolate overflow-hidden bg-gray-900 px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
        <svg
          viewBox="0 0 1024 1024"
          className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
          aria-hidden="true"
        >
          <circle cx={512} cy={512} r={512} fill="url(#759c1415-0410-454c-8f7c-9a820de03641)" fillOpacity="0.7" />
          <defs>
            <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
              <stop stopColor="#7775D6" />
              <stop offset={1} stopColor="#E935C1" />
            </radialGradient>
          </defs>
        </svg>
        <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Boost your productivity.
            <br />
            Start using our app today.
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Task Management App you Need
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
            <a
              href={`https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=${process.env.REACT_APP_CLIENT_ID_EVOLVE}&scope=email,profile&redirect_uri=${process.env.REACT_APP_BASE_URL}&access_type=offline&prompt=consent`}
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Login for Evolve
            </a>
            <a
              href={`https://accounts.zoho.in/oauth/v2/auth?response_type=code&client_id=${process.env.REACT_APP_CLIENT_ID_PLUUGIN}&scope=email,profile&redirect_uri=${process.env.REACT_APP_BASE_URL}&access_type=offline&prompt=consent`}
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Login for Pluugin
            </a>
          </div>
        </div>
        <div className="relative mt-16 h-80 lg:mt-8">
          <img
            className="absolute left-0 top-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
            src="/dark-project-app-screenshot.png"
            alt="App screenshot"
            width={1824}
            height={1080}
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
