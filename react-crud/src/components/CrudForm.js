import React, { useState, useEffect } from 'react';

const CrudForm = ({ addItem, editItem, selectedItem, setSelectedItem }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedItem) {
      setName(selectedItem.name);
    } else {
      setName('');
    }
  }, [selectedItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nombre del Producto cannot be empty');
      return;
    }
    const item = { id: selectedItem ? selectedItem.id : Date.now(), name };

    if (selectedItem) {
      editItem(item);
    } else {
      addItem(item);
    }

    setName('');
    setSelectedItem(null);
    setError('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError(''); // Clear error when user types
        }}
        placeholder="Product name"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">{selectedItem ? 'Update' : 'Add'}</button>
    </form>
  );
};

export default CrudForm;
