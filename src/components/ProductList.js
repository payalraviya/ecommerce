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
  const [showDiscount, setShowDiscount] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async (query = '', page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://stageapi.monkcommerce.app/task/products/search?search=${query}&page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': '72njgfa948d9aS7gs5', // Your API Key here
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data || []); // Set products to an empty array if undefined
      setTotalPages(data.totalPages || 7); // Ensure totalPages is set correctly
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
    setCurrentPage(1);
    fetchProducts(searchQuery, 1); // Fetch products when the modal is opened
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
    setCurrentPage(1);
    fetchProducts(e.target.value, 1);
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

  const removeProduct = (index) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updatedProducts);
  };

  const handleDiscountVisibility = (index) => {
    setShowDiscount((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchProducts(searchQuery, nextPage);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchProducts(searchQuery, prevPage);
    }
  };

  return (
    <div className='mt-5'>
      <h2 className="mb-4">Add Products</h2>
      {selectedProducts.map((selection, index) => (
        <div key={index} className="mb-3 p-3">
          <div className="d-flex align-items-center">
            {index + 1}.
            <div className="flex-grow-1 mx-2 position-relative" style={{ width: '95%' }}>
              <input
                type="text"
                value={selection.product ? `${selection.product.title}` : ''}
                placeholder="Select a product"
                readOnly
                className="form-control me-2"
              />
              <button className="btn btn-link position-absolute" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }} onClick={() => handleShowModal(index)}>
                <i className="fa-solid fa-pen"></i> {/* Edit icon */}
              </button>
            </div>

            {!showDiscount[index] && (
              <button
                className="btn btn-success mx-2"
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
                    <option value="%">% Off</option>
                  </select>
                </div>
              </div>
            )}
            <button className="btn btn-link" onClick={() => removeProduct(index)} style={{ fontSize: '1.5rem', lineHeight: '1' }}>
              <i className="fa-solid fa-times"></i> {/* Remove icon */}
            </button>
          </div>
          <div className="align-items-center mt-3">
            <div className='text-end'>
              <button className="btn btn-link" onClick={() => toggleShowVariants(index)}>
                {showVariants[index] ? "Hide Variants" : "Show Variants"}
              </button>
            </div>
            <div className='text-end'>
              {showVariants[index] && selection.variants.length > 0 && selection.variants.map((variant) => (
                <div key={variant.id} className="p-2 mt-2">
                  <div className="d-flex align-items-center ms-3">
                    <div className="flex-grow-1 d-flex mx-2 ms-5 position-relative">
                      <input
                        type="text"
                        value={variant.title}
                        placeholder="Select a product"
                        readOnly
                        className="form-control me-2"
                      />
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
                              <option value="%">% Off</option>
                            </select>
                          </div>
                        </div>
                      )}
                      <button className="btn btn-link" onClick={() => handleToggleVariant(variant)}><i className="fa-solid fa-times"></i></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <>
              {products.map((product) => (
                <div key={product.id} className="p-2 mb-2">
                  <div className='d-flex'>
                    <input
                      type="checkbox"
                      name="product"
                      checked={selectedProduct && selectedProduct.id === product.id}
                      onChange={() => handleSelectProduct(product)}
                    />
                    <h5 className='mx-2'>{product.title}</h5>
                  </div>
                  {selectedProduct && selectedProduct.id === product.id && (
                    <div className="mt-2 ms-5">
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
              ))}
              {/* Pagination Controls */}
              <div className="d-flex justify-content-between mt-3">
                <Button
                  variant="secondary"
                  disabled={currentPage === 1}
                  onClick={handlePreviousPage}
                >
                  Previous
                </Button>
                <span>Page {currentPage} of {totalPages}</span>
                <Button
                  variant="secondary"
                  disabled={currentPage === totalPages}
                  onClick={handleNextPage}
                >
                  Next
                </Button>
              </div>
            </>
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
