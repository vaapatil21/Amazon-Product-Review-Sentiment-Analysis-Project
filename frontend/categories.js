import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import { useNavigate } from "react-router-dom";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/unauthorized");
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `http://${process.env.REACT_APP_AWS_EC2_EIP}:5000/categories`
        );
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const getImageSource = (categoryName) => {
    try {
      return require(`../images/${categoryName}.jpeg`);
    } catch (error) {
      console.error(
        `Error loading image for category '${categoryName}':`,
        error
      );
      return require("../images/Image Not Found.jpeg");
    }
  };

  return (
    <div>
      <Sidebar></Sidebar>
      <div className="cardmargin">
        <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-black md:text-5xl lg:text-6xl">
          Categories
        </h1>
        <div className="category-container flex flex-wrap justify-center">
          {categories.map((category) => (
            <div
              key={category.categoryId}
              className="cards cardspace hover:cursor-pointer max-w-sm bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:bg-black dark:bg-gray-800 dark:border-gray-700 mb-8"
            >
              <div className="max-w-80 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                <a
                  onClick={() => {
                    navigate(`/products`, {
                      state: {
                        categoryName: category.categoryName,
                        categoryId: category.categoryId,
                      },
                    });
                  }}
                >
                  <img
                    className="img_cat rounded-t-lg"
                    src={getImageSource(category.categoryName)}
                    alt={category.categoryName}
                  />
                  <div className="p-3">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {category.categoryName}
                    </h5>
                  </div>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
