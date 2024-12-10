const Product = require("../models/productModel");
const fs = require("fs");

// Create Product
const createProduct = async (req, res) => {
  try {
    const { name, sellerName, sellerPhone, price, discount } = req.body;
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Product image is required" });
    }

    const product = await Product.create({
      ...req.body,
      image: req.file.path, // Save the image path in the database
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get All Products
const path = require("path");

// const getProducts = async (req, res) => {
//   try {
//     // Fetch only the top 10 products
//     const products = await Product.find()
//       .select("image price name slug") // Use a single string with space-separated field names
//       .limit(5);

//     // Map through products and convert image to base64
//     const updatedProducts = await Promise.all(
//       products.map(async (product) => {
//         if (product.image) {
//           // Ensure the product has an image path
//           const imagePath = path.join(product.image); // Adjust path as needed
//           console.log(imagePath);

//           try {
//             const fileData = fs.readFileSync(imagePath);
//             // console.log(fileData);

//             const mimeType = "image/jpeg"; // Replace with actual MIME type if necessary
//             product.image = `data:${mimeType};base64,${fileData.toString(
//               "base64"
//             )}`;
//           } catch (imageError) {
//             console.error(
//               `Error reading image for product ${product._id}:`,
//               imageError
//             );
//             product.image = null; // Set to null if the image cannot be read
//           }
//         } else {
//           product.image = null; // No image provided
//         }
//         return product;
//       })
//     );

//     res.status(200).json({ success: true, data: updatedProducts });
//   } catch (error) {
//     console.log(error.message);

//     res.status(500).json({ success: false, message: error.message });
//   }
// };



const getProducts = async (req, res) => {
  try {
    // Extract sorting parameter from query
    const sortParam = req.query.sort || "name_asc"; // Default to "name_asc" if not provided

    // Parse the sorting parameter
    const [sortField, sortDirection] = sortParam.split("_");
    const sortOrder = sortDirection === "asc" ? 1 : -1;

    // Construct sorting object
    const sortQuery = {};

    // Map fields like price, date to their respective database fields
    switch (sortField) {
      case "price":
        sortQuery.price = sortOrder;
        break;
      case "date":
        sortQuery.createdAt = sortOrder;
        break;
      case "name":
      default:
        sortQuery.name = sortOrder;
        break;
    }

    // Fetch products with sorting and limit to top 5
    console.log(sortQuery);
    const projections = { image: 1, price: 1, name: 1, slug: 1 }; 
    const products = await Product.find()
    .select(projections) // Specify fields to retrieve
    .sort(sortQuery) // Apply sorting
    .limit(5); 
      const lowestPriceProduct = await Product.findOne().sort({ price: 1 }); // Sort by price in ascending order to get the lowest

      const lowestPrice = lowestPriceProduct ? lowestPriceProduct.price : 0; // Ensure a default value of 0 if no products exist
  
    // Map through products and convert image to base64
    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        if (product.image) {
          const imagePath = path.join(product.image); // Adjust the path as necessary
          try {
            const fileData = fs.readFileSync(imagePath);
            const mimeType = "image/jpeg"; // Adjust MIME type as needed
            product.image = `data:${mimeType};base64,${fileData.toString(
              "base64"
            )}`;
          } catch (imageError) {
            console.error(
              `Error reading image for product ${product._id}:`,
              imageError
            );
            product.image = null; // Set to null if the image cannot be read
          }
        } else {
          product.image = null; // No image provided
        }
        return product;
      })
    );

    // Respond with sorted products
    res.status(200).json({ success: true, data: updatedProducts ,lowest:lowestPrice});
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


const getProduct = async (req, res) => {
  try {
    // Fetch only the top 10 products
    const products = await Product.findOne({ slug: req.params.slug });

    if (products.image) {
      // Ensure the product has an image path
      const imagePath = path.join(products.image); // Adjust path as needed
      console.log(imagePath);

      try {
        const fileData = fs.readFileSync(imagePath);
        // console.log(fileData);

        const mimeType = "image/jpeg"; // Replace with actual MIME type if necessary
        products.image = `data:${mimeType};base64,${fileData.toString(
          "base64"
        )}`;
      } catch (imageError) {
        console.error(
          `Error reading image for product ${product._id}:`,
          imageError
        );
        products.image = null; // Set to null if the image cannot be read
      }
    } else {
      products.image = null; // No image provided
    }

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
    try {
      const updateData = { ...req.body };
   console.log(updateData);
   
      // If an image is uploaded, set the new image path
      if (req.file) {
        updateData.image = req.file.path;
        console.log(req.file.path);
        
      }
   
      // Update the product using the slug
      const product = await Product.findOneAndUpdate(
        { slug: req.params.slug },
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );
  
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
  
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
  

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ slug: req.params.slug });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Filter Products

const filterProducts = async (req, res) => {
  try {
    const {
      name,
      sellerName,
      sellerPhone,
      minPrice,
      maxPrice,
      minDiscount,
      maxDiscount,
    } = req.body;
    console.log(req.body);

    const query = {};

    if (name) {
      query.name = { $regex: name, $options: "i" }; // Case-insensitive search
    }
    if (sellerName) {
      query.sellerName = { $regex: sellerName, $options: "i" };
    }
    if (sellerPhone) {
      query.sellerPhone = sellerPhone;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (minDiscount || maxDiscount) {
      query.discount = {};
      if (minDiscount) query.discount.$gte = Number(minDiscount);
      if (maxDiscount) query.discount.$lte = Number(maxDiscount);
    }

    const products = await Product.find(query);
    console.log(products);
    const updatedProducts = await Promise.all(
        products.map(async (product) => {
          if (product.image) {
            // Ensure the product has an image path
            const imagePath = path.join(product.image); // Adjust path as needed
            console.log(imagePath);
  
            try {
              const fileData = fs.readFileSync(imagePath);
              // console.log(fileData);
  
              const mimeType = "image/jpeg"; // Replace with actual MIME type if necessary
              product.image = `data:${mimeType};base64,${fileData.toString(
                "base64"
              )}`;
            } catch (imageError) {
              console.error(
                `Error reading image for product ${product._id}:`,
                imageError
              );
              product.image = null; // Set to null if the image cannot be read
            }
          } else {
            product.image = null; // No image provided
          }
          return product;
        })
      );
    res.status(200).json({ success: true, data: updatedProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  filterProducts,
};
