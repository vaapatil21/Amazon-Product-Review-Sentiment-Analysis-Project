import React from 'react'
import "../App.css"
import { signOut } from '@aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { Link, useResolvedPath, useMatch } from 'react-router-dom'


function Sidebar() {
  const nav = useNavigate();
  

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.setItem("userId", "");
      nav('/'); // Redirect to login page after logout
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const handleClick = (url) => {
    nav(url);
  }

  return (

    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-2">
        <ul className="items-center flex flex-col md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
          <li>
            <a className="block py-2 px-3 text-sky-500 rounded md:hover:bg-transparent md:p-0 dark:hover:bg-gray-700 md:dark:hover:bg-transparent dark:border-gray-700" aria-current="page" style={{fontSize: "1.6rem"}}>Amazon Product Sentiment</a>
          </li>
          <li>
            <a onClick={() => handleClick('/categories')} className="hover:cursor-pointer block text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-orange-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Categories</a>
          </li>
          <li>
            <a onClick={() => handleClick('/subscriptions')} className="hover:cursor-pointer block text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-orange-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Subscriptions</a>
          </li>
        </ul>

        <div className="flex items-center">
          <p className="usernav">Welcome!</p>
          <button onClick={handleLogout} className="text-white bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-orange-300 dark:focus:ring-orange-800 font-medium rounded-lg text-sm py-2 px-4 text-center">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

// function CustomLink({ to, children, ...props }) {
//   const resolvedPath = useResolvedPath(to)
//   const isActive = useMatch({ path: resolvedPath.pathname, end: true })

//   return (
//     <li className={isActive ? "active" : ""}>
//       <Link to={to} {...props}>
//         {children}
//       </Link>
//     </li>
//   )
// }

export default Sidebar    
