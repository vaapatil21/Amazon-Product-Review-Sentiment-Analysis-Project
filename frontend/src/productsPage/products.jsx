import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const ProductsPage = (props) => {
  const [products, setProducts] = useState([]);
  const [subscriptions, setSubscriptions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const categoryName = location.state?.categoryName;
  const categoryId = location.state?.categoryId;
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!categoryName || !categoryId || !userId) {
      navigate("/unauthorized");
      return;
    }

    const fetchSubscriptions = async () => {
      try {
        const response = await fetch(
          `http://${process.env.REACT_APP_AWS_EC2_EIP}:5000/usersubscriptions?userId=${userId}`
        );
        const data = await response.json();
        console.log(data);

        const updatedSubscriptions = {};
        data.forEach((subscription) => {
          updatedSubscriptions[subscription.productId] = true;
        });

        setSubscriptions(updatedSubscriptions);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setIsLoading(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `http://${process.env.REACT_APP_AWS_EC2_EIP}:5000/products/${categoryId}`
        );
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
    fetchSubscriptions();
  }, [categoryId, userId]);

  const handleSubscribe = async (productId) => {
    try {
      // If already subscribed, unsubscribe
      if (subscriptions[productId]) {
        await handleUnsubscribe(productId);
      } else {
        const response = await fetch(
          `http://${process.env.REACT_APP_AWS_EC2_EIP}:5000/subscribe?userId=${userId}&productId=${productId}`,
          {
            method: "POST",
          }
        );
        const message = await response.text();
        if (message === "Subscription Successful!") {
          setSubscriptions((prevState) => ({
            ...prevState,
            [productId]: true,
          }));
        }
      }
    } catch (error) {
      console.error("Error subscribing to product:", error);
    }
  };

  const handleUnsubscribe = async (productId) => {
    try {
      const response = await fetch(
        `http://${process.env.REACT_APP_AWS_EC2_EIP}:5000/unsubscribe?userId=${userId}&productId=${productId}`,
        {
          method: "POST",
        }
      );
      const message = await response.text();
      if (message === "Unsubscription Successful!") {
        setSubscriptions((prevState) => ({
          ...prevState,
          [productId]: false,
        }));
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);
    }
  };

  return (
    <div>
      <Sidebar></Sidebar>
      <div className="cardmargin">
        <div className="text-center mb-8">
          <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-black md:text-5xl lg:text-6xl">
            Products in&nbsp;
            <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-blue-400">
              {categoryName}
            </span>
          </h1>
        </div>
        <div className="max-w-4xl mx-auto relative">
          {!isLoading ? (
            <ul>
              {products.map((product) => (
                <li key={product.productId} className="relative">
                  <div className="flex items-center justify-between  py-2 px-2 border border-gray-700 rounded-lg mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-200 transition duration-300">
                    <span
                      onClick={() => {
                        navigate(`/sentiment`, {
                          state: { productId: product.productId },
                        });
                      }}
                      style={{ textAlign: "justify", color: "black" }}
                    >
                      {product.productName}
                    </span>
                    <div className="flex">
                      <div className="w-px bg-gray-400 mx-2 h-7"></div>
                      <button
                        onClick={() => {
                          navigate(`/sentiment`, {
                            state: { productId: product.productId },
                          });
                        }}
                        className="text-sm text-white bg-emerald-500 hover:bg-emerald-700 focus:ring-4 focus:outline-none focus:ring-emerald-200 dark:focus:ring-emerald-800 font-medium rounded-lg py-1 px-3 mx-2"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleSubscribe(product.productId)}
                        className={`text-sm text-white font-medium rounded-lg py-1 px-3 mx-2 ${
                          subscriptions[product.productId]
                            ? "bg-red-500 hover:bg-red-700 focus:ring-red-200 dark:focus:ring-red-800"
                            : "bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-200 dark:focus:ring-blue-800"
                        }`}
                        style={{ width: "100px" }}
                      >
                        {subscriptions[product.productId]
                          ? "Unsubscribe"
                          : "Subscribe"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
