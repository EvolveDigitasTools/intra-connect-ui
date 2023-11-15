import '../../index.css';
import ThemeToggler from '../../components/ThemeToggler';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Avatar, Dropdown } from 'flowbite-react';
import { DropdownItem } from 'flowbite-react/lib/esm/components/Dropdown/DropdownItem';
import { logout } from '../auth/authSlice';

export default function Navbar() {
  const auth = useSelector((state: RootState) => state.auth);
  const theme = useSelector((state: RootState) => state.theme)
  const dispatch = useDispatch();

  return (
    <section className="bg-light-navbar dark:bg-dark-navbar border-b border-light-border dark:border-dark-border h-[10vh] flex justify-between items-center px-4 md:px-6">
      <div className="h-full flex items-center">
        <a className='h-3/5 flex' href='/'><img className='h-full' src={theme.theme == "light" ? '/pluugin-logo-dark.png' : '/plugin-logo.png'} /></a>
      </div>
      <div className="right-nav flex items-center">
        <ThemeToggler />
        {auth.isAuthenticated ?
          <Dropdown
            arrowIcon={false}
            inline
            label={<Avatar alt="user" img={auth?.user?.picture} size="sm" rounded />}
          >
            <Dropdown.Header>
              <span className="block text-sm">
                {auth.user?.name}
              </span>
              <span className="block truncate text-sm font-medium">
                {auth.user?.email}
              </span>
            </Dropdown.Header>
            <DropdownItem>
              Dashboard
            </DropdownItem>
            <DropdownItem>
              Settings
            </DropdownItem>
            <DropdownItem>
              Earnings
            </DropdownItem>
            <Dropdown.Divider />
            <DropdownItem onClick={() => dispatch(logout())}>
              Sign out
            </DropdownItem>
          </Dropdown> :
          <Link to={`https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=${process.env.REACT_APP_CLIENT_ID}&scope=email,profile&redirect_uri=${process.env.REACT_APP_BASE_URL}&access_type=offline&prompt=consent`}>
            <button type="button" className="text-light-navbar dark:text-dark-navbar bg-light-primary dark:bg-dark-primary hover:bg-light-secondry focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:hover:bg-dark-secondry focus:outline-none dark:focus:ring-blue-800">Login</button>
          </Link>
        }
      </div>
    </section>
  )
}
