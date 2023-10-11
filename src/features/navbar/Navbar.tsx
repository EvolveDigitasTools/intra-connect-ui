import '../../index.css';
import ThemeToggler from '../../components/ThemeToggler';

export default function Example() {

  return (
    <header className="bg-light-navbar dark:bg-dark-navbar border-b border-light-border dark:border-dark-border h-[10vh] flex justify-between items-center px-4 md:px-6">
      <div className="h-full flex items-center">
        <a className='h-3/5 flex' href='/'><img className='h-full' src='/logo.png' /></a>
      </div>
      <div className="right-nav flex items-center">
        <ThemeToggler />
        <button type="button" className="text-light-navbar dark:text-dark-navbar bg-light-primary dark:bg-dark-primary hover:bg-light-secondry focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:hover:bg-dark-secondry focus:outline-none dark:focus:ring-blue-800">Login</button>
      </div>
    </header>
  )
}
