import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const ProductList = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [showVariants, setShowVariants] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productDiscounts, setProductDiscounts] = useState({});
  const [showDiscount, setShowDiscount] = useState({}); // State to manage discount visibility

  const fetchProducts = async (query = '') => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://stageapi.monkcommerce.app/task/products/search?search=${query}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': '72njgfa948d9aS7gs5',  // Your API Key here
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (index) => {
    setSelectedProduct(null);
    setSelectedVariants([]);
    setShowModal(true);
    fetchProducts(); // Fetch products when the modal is opened
  };

  const addRow = () => {
    setSelectedProducts([...selectedProducts, { product: null, variants: [] }]);
  };

  const handleSaveSelection = (index) => {
    if (selectedProduct && selectedVariants.length > 0) {
      const updatedProducts = [...selectedProducts];
      updatedProducts[index] = {
        product: selectedProduct,
        variants: selectedVariants,
      };
      setSelectedProducts(updatedProducts);
      setShowModal(false);
    } else {
      alert('Please select a product and at least one variant');
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSelectedVariants([]);
  };

  const handleToggleVariant = (variant) => {
    if (selectedVariants.includes(variant)) {
      setSelectedVariants(selectedVariants.filter((v) => v.id !== variant.id));
    } else {
      setSelectedVariants([...selectedVariants, variant]);
    }
  };

  const toggleShowVariants = (index) => {
    setShowVariants((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    fetchProducts(e.target.value); // Fetch products based on search input
  };

  const handleDiscountChange = (index, value) => {
    setProductDiscounts((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        value: value,
      },
    }));
  };

  const handleDiscountTypeChange = (index, type) => {
    setProductDiscounts((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        type: type,
      },
    }));
  };

  // Remove selected product from the list
  const removeProduct = (index) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updatedProducts);
  };

  // Toggle visibility of the discount section
  const handleDiscountVisibility = (index) => {
    setShowDiscount((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className='mt-5'>
      <h2 className="mb-4">Add Products</h2>
      {selectedProducts.map((selection, index) => (
        <div key={index} className="mb-3 border p-3 rounded">
          <div className="d-flex align-items-center">
            <input
              type="text"
              value={selection.product ? `${selection.product.title}` : ''}
              placeholder="Select a product"
              readOnly
              className="form-control me-2"
            />
            <button className="btn btn-primary me-2" onClick={() => handleShowModal(index)}>Edit</button>
            <button className="btn btn-danger me-2" onClick={() => removeProduct(index)}>Remove</button>
            {!showDiscount[index] && (
              <button
                className="btn btn-success"
                onClick={() => handleDiscountVisibility(index)}
              >
                Add Discount
              </button>
            )}
          {showDiscount[index] && (
            <div className="d-flex align-items-center mt-2">
              <div className="d-flex align-items-center ms-3">
                <input
                  type="number"
                  placeholder="Discount"
                  value={productDiscounts[index]?.value || ''}
                  onChange={(e) => handleDiscountChange(index, e.target.value)}
                  className="form-control me-2"
                />
                <select
                  value={productDiscounts[index]?.type || 'flat'}
                  onChange={(e) => handleDiscountTypeChange(index, e.target.value)}
                  className="form-select"
                >
                  <option value="flat">Flat Off</option>
                  <option value="%">Percentage Off</option>
                </select>
              </div>
            </div>
          )}
          </div>
          <div className="align-items-center mt-3">
            <button className="btn btn-link" onClick={() => toggleShowVariants(index)}>
              {showVariants[index] ? "Hide Variants" : "Show Variants"}
            </button>

            {showVariants[index] && selection.variants.length > 0 && selection.variants.map((variant) => (
              <div key={variant.id} className="border p-2 mt-2 rounded w-100">
                <div className="d-flex justify-content-between align-items-center">
                  <span>{variant.title} - ${variant.price}</span>
                  <button className="btn btn-danger btn-sm" onClick={() => handleToggleVariant(variant)}>Remove Variant</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal for product and variant selection */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Product and Variants</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="form-control mb-3"
          />

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="border p-2 mb-2 rounded">
                <h5>{product.title}</h5>
                <input
                  type="radio"
                  name="product"
                  checked={selectedProduct && selectedProduct.id === product.id}
                  onChange={() => handleSelectProduct(product)}
                />
                {selectedProduct && selectedProduct.id === product.id && (
                  <div className="mt-2">
                    {product.variants.map((variant) => (
                      <div key={variant.id} className="d-flex align-items-center">
                        <input
                          type="checkbox"
                          checked={selectedVariants.some((v) => v.id === variant.id)}
                          onChange={() => handleToggleVariant(variant)}
                        />
                        <label className="ms-2">{variant.title} - ${variant.price}</label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => handleSaveSelection(selectedProducts.length - 1)}>Save Selection</Button>
        </Modal.Footer>
      </Modal>
      <div className='text-end'>
        <button className='btn btn-outline-success' onClick={addRow}>Add Product</button>
      </div>
    </div>
  );
};

export default ProductList;
