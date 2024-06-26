const Unauthorized = () => {
  return (
    <div className="flex items-center justify-center h-screen flex-col">
      <div className="mb-4">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-black md:text-5xl lg:text-5xl">
          Please Login!
        </h1>
      </div>
      <div>
        <button
          onClick={() => (window.location.href = `/`)}
          className={
            "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-md py-2 px-4 text-center"
          }
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
