import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Image, message, Modal, Input, Button, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const ProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState({});
  const [imageFile, setImageFile] = useState(null); // State for storing the selected image file
  const fetchProduct = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/products/${slug}`
      );
      setProduct(response.data.data);
      setEditedProduct(response.data.data);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };
  useEffect(() => {
    fetchProduct();
  }, [slug]);

  if (!product)
    return <p className="text-center mt-8 text-gray-500">Loading...</p>;

  // Function to handle product deletion
  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/products/${slug}`
      );
      if (response.data.success) {
        message.success("Product deleted successfully!");
        window.location.href = "/products";
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      message.error("Failed to delete product.");
    }
  };

  // Function to handle the edit form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  // Function to handle file input change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (imageFile) {
      console.log(imageFile);

      formData.append("image", imageFile);
    }
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/products/${slug}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Set the correct header for file upload
          },
        }
      );
      fetchProduct(); // Refresh product list after adding a new product
      setIsEditing(false);
    } catch (error) {
      console.error("Error submitting product:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

      {/* Product Image */}
      <Image src={product.image} alt={product.name} width={600} height={400} />

      {/* Product Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Column 1 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Details</h2>
          <p className="mb-2">
            <span className="font-medium text-gray-600">Price:</span> $
            {product.price}
          </p>
          <p className="mb-2">
            <span className="font-medium text-gray-600">Discount:</span>{" "}
            {product.discount}%
          </p>
          <p className="mb-2">
            <span className="font-medium text-gray-600">Created At:</span>{" "}
            {new Date(product.createdAt).toLocaleDateString()}{" "}
            {new Date(product.createdAt).toLocaleTimeString()}
          </p>
          <p className="mb-2">
            <span className="font-medium text-gray-600">Updated At:</span>{" "}
            {new Date(product.updatedAt).toLocaleDateString()}{" "}
            {new Date(product.updatedAt).toLocaleTimeString()}
          </p>
        </div>

        {/* Column 2 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Seller Information
          </h2>
          <p className="mb-2">
            <span className="font-medium text-gray-600">Name:</span>{" "}
            {product.sellerName}
          </p>
          <p className="mb-2">
            <span className="font-medium text-gray-600">Phone:</span>{" "}
            {product.sellerPhone}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-between">
        <Button
          type="primary"
          onClick={() => setIsEditing(true)}
          className="mr-2"
        >
          Edit
        </Button>
        <Button type="danger" onClick={handleDelete}>
          Delete
        </Button>
      </div>

      {/* Edit Form Modal */}
      <Modal
        title="Edit Product"
        visible={isEditing}
        onCancel={() => setIsEditing(false)}
        footer={null} // Removing default footer to use form buttons inside
      >
        <form onSubmit={handleFormSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Name</label>
              <Input
                name="name"
                value={editedProduct.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Price</label>
              <Input
                type="number"
                name="price"
                value={editedProduct.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Discount</label>
              <Input
                type="number"
                name="discount"
                value={editedProduct.discount}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block mb-2">Seller Name</label>
              <Input
                name="sellerName"
                value={editedProduct.sellerName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Seller Phone</label>
              <Input
                name="sellerPhone"
                value={editedProduct.sellerPhone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
              {imageFile && (
                <p className="mt-2">Selected image: {imageFile.name}</p>
              )}
            </div>
          </div>
          {/* Form Footer Buttons */}
          <div className="mt-4 flex justify-end space-x-2">
            <Button onClick={() => setIsEditing(false)} key="cancel">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" key="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductDetails;
