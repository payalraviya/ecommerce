import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
      setProducts(data || []); 
      setTotalPages(data.totalPages || 7); 
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
    fetchProducts(searchQuery, 1);
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

  const removeVariant = (productToUpdate, variantToRemove) => {
    const updatedProduct = {
      ...productToUpdate,
      variants: productToUpdate.variants.filter(variant => variant.id !== variantToRemove.id),
    };

    const updatedSelectedProducts = selectedProducts.map((product) =>
      product.product.id === updatedProduct.product.id ? updatedProduct : product
    );

    setSelectedProducts(updatedSelectedProducts);
  };

  const handleDiscountVisibility = (index) => {
    setShowDiscount((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleShowVariants = (index) => {
    setShowVariants((prev) => ({
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

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedProducts = Array.from(selectedProducts);
    const [movedProduct] = reorderedProducts.splice(result.source.index, 1);
    reorderedProducts.splice(result.destination.index, 0, movedProduct);

    setSelectedProducts(reorderedProducts);
  };

  const handleVariantDragEnd = (productIndex) => (result) => {
    if (!result.destination) return;

    const updatedProducts = [...selectedProducts];
    const reorderedVariants = Array.from(updatedProducts[productIndex].variants);
    const [movedVariant] = reorderedVariants.splice(result.source.index, 1);
    reorderedVariants.splice(result.destination.index, 0, movedVariant);

    updatedProducts[productIndex].variants = reorderedVariants;
    setSelectedProducts(updatedProducts);
};

  return (
    <div className='mt-5 px-5 mx-5 container'>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="products">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <h2 className="mb-4">Add Products</h2>
              {selectedProducts.map((selection, index) => (
                <Draggable key={index} draggableId={String(index)} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="mb-3 p-3">
                      <div className="d-flex align-items-center">
                        <i className="fa-solid fa-grip-vertical text-secondary mx-3"></i>
                        {index + 1}.
                        <div className="flex-grow-1 mx-2 position-relative">
                          <input
                            type="text"
                            value={selection.product ? `${selection.product.title}` : ''}
                            placeholder="Select a product"
                            readOnly
                            className="form-control me-2"
                          />
                          <button className="btn btn-link position-absolute" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }} onClick={() => handleShowModal(index)}>
                            <i className="fa-solid fa-pen text-secondary"></i>
                          </button>
                        </div>

                        {!showDiscount[index] && (
                          <button
                            className="btn btn-success mx-2 px-5"
                            onClick={() => handleDiscountVisibility(index)}
                          >
                            Add Discount
                          </button>
                        )}
                        {showDiscount[index] && (
                          <div className="d-flex align-items-center">
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
                          <i className="fa-solid fa-times text-secondary"></i>
                        </button>
                      </div>
                      <div className="align-items-center mt-3">
                        <div className='text-end'>
                          <button className="btn btn-link" onClick={() => toggleShowVariants(index)}>
                            {showVariants[index] ? "Hide Variants" : "Show Variants"}
                          </button>
                        </div>
                      </div>

                      <DragDropContext onDragEnd={handleVariantDragEnd(index)}>
                      <Droppable droppableId={`variants-${index}`}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.droppableProps}>
                            {showVariants[index] && selection.variants.length > 0 && selection.variants.map((variant, variantIndex) => (
                              <Draggable key={variant.id} draggableId={String(variant.id)} index={variantIndex}>
                                {(provided) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="p-2 mt-2">
                                    <div className="d-flex align-items-center ms-5 ms-3">
                                    <i className="fa-solid fa-grip-vertical text-secondary mx-3"></i>
                                      <input
                                        type="text"
                                        value={variant.title}
                                        placeholder="Select a product"
                                        readOnly
                                        className="form-control"
                                      />
                                      {showDiscount[index] && (
                                        <div className="d-flex align-items-center">
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
                                              <option value="%">% Off</option>
                                              <option value="flat">Flat Off</option>
                                            </select>
                                          </div>
                                        </div>
                                      )}
                                      <button className="btn btn-link" onClick={() => removeVariant(selection, variant)}>
                                        <i className="fa-solid fa-times text-secondary"></i>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                      </DragDropContext>

                    </div>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>

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
                  </div>
                ))}
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
          <button className='btn btn-outline-success px-5 py-3' onClick={addRow}>Add Product</button>
        </div>
      </DragDropContext>
    </div>
  );
};

export default ProductList;
