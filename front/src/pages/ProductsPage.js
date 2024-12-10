import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    sellerName: "",
    sellerPhone: "",
    minPrice: "",
    maxPrice: "",
    minDiscount: "",
    maxDiscount: "",
  });
  const [sortOption, setSortOption] = useState(""); // State for sorting
  const [showPopup, setShowPopup] = useState(false);
  const [showFilters, setShowFilters] = useState(false); // Toggle filters visibility

  // Fetch Products
  const fetchProducts = async (filterQuery = "", sortQuery = "") => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/products${filterQuery}${sortQuery}`
      );
      setProducts(response.data.data);
      const lowestPrice = response.data.lowest;
      console.log(lowestPrice);
      setFilters((prevFilters) => ({
        ...prevFilters,
        minPrice: lowestPrice, // Update only the minPrice filter
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Fetch Products with Filters
  const fetchProductsFilter = async (filters, sortQuery = "") => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/products/filter${sortQuery}`,
        filters
      );
      setProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching filtered products:", error);
    }
  };

  // Check if popup should be shown on initial load
  useEffect(() => {
    const popupStatus = sessionStorage.getItem("popupOpened");
    if (!popupStatus) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 5000); // 5 seconds delay
  
      // Clean up the timeout if the component is unmounted
      return () => clearTimeout(timer);
    }
  }, []);
  

  // Fetch all products on initial render
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle Filter Changes
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Apply Filters
  const applyFilters = () => {
    fetchProductsFilter(filters, `?sort=${sortOption}`);
  };

  // Apply Sorting
  const applySorting = (e) => {
    setSortOption(e.target.value); // Update sort state
    fetchProducts(`?sort=${e.target.value}`); // Fetch sorted data
  };

  // Handle Popup Close
  const handlePopupClose = () => {
    setShowPopup(false);
    sessionStorage.setItem("popupOpened", "true");
  };
 // Handle Form Submission
 const handleFormSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  try {
    await axios.post(`${process.env.REACT_APP_API_URL}/products`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    fetchProducts(); // Refresh product list after adding a new product
    handlePopupClose();
  } catch (error) {
    console.error("Error submitting product:", error);
  }
};

  return (
    <div className="p-4">
      {/* Popup Form */}
      {showPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Add a New Product</h2>
            <form onSubmit={handleFormSubmit}>
            <input
                type="text"
                name="name"
                placeholder="Product Name"
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <input
                type="text"
                name="sellerName"
                placeholder="Seller Name"
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <input
                type="text"
                name="sellerPhone"
                placeholder="Seller Phone"
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <input
                type="number"
                name="discount"
                placeholder="Discount"
                className="w-full mb-3 p-2 border rounded"
              />
              <input
                type="file"
                name="image"
                className="w-full mb-3 p-2"
                accept="image/*"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded w-full"
              >
                Submit
              </button>
            </form>
            <button
              onClick={handlePopupClose}
              className="mt-4 text-gray-500 underline w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        {/* Filter Dropdown */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              name="name"
              placeholder="Filter by product name"
              className="border p-2 rounded"
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="sellerName"
              placeholder="Filter by seller name"
              className="border p-2 rounded"
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="sellerPhone"
              placeholder="Filter by seller phone"
              className="border p-2 rounded"
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              placeholder="Min Price"
              className="border p-2 rounded"
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              className="border p-2 rounded"
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="minDiscount"
              placeholder="Min Discount"
              className="border p-2 rounded"
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="maxDiscount"
              placeholder="Max Discount"
              className="border p-2 rounded"
              onChange={handleFilterChange}
            />
          </div>
        )}
        <button
          onClick={applyFilters}
          className="bg-green-500 text-white py-2 px-4 rounded mb-6"
        >
          Apply Filters
        </button>
      </div>

      {/* Sorting Options */}
      <div className="mb-6">
        <label htmlFor="sort" className="mr-2 font-bold">
          Sort By:
        </label>
        <select
          id="sort"
          value={sortOption}
          onChange={applySorting}
          className="p-2 border rounded"
        >
          <option value="">Select...</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
          <option value="date_desc">Date Added (new First)</option>
          <option value="date_asc">Date Added (old First)</option>

          <option value="price_asc">Price (Low to High)</option>
          <option value="price_desc">Price (High to Low)</option>
        </select>
      </div>

      {/* Displaying Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.slug}
            className="border rounded p-4 cursor-pointer"
            onClick={() => window.open(`/product/${product.slug}`, "_blank")}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-cover mb-2"
            />
            <h2 className="text-lg font-bold">{product.name}</h2>
            <p>
              Price:{" "}
              <span className="text-green-600 font-semibold">
                ${product.price}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
