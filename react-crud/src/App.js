import React, { useState, useEffect } from 'react';
import CrudForm from './components/CrudForm';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [filter, setFilter] = useState('');
  const [notification, setNotification] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const addItem = async (item) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      const newItem = await response.json();
      setItems([...items, newItem]);
      notify('Product added successfully');
    } catch (error) {
      notify('Error adding product');
    }
  };

  const editItem = async (item) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      const updatedItem = await response.json();
      setItems(items.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
    } catch (error) {
      notify('Error updating product');
    }
  };

  const deleteSelectedItems = async () => {
    if (selectedItems.size === 0) return;
    try {
      await Promise.all(Array.from(selectedItems).map(async (id) => {
        await fetch(`http://127.0.0.1:5000/items/${id}`, {
          method: 'DELETE',
        });
      }));
      setItems(items.filter((item) => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
      setSelectedItem(null);
      notify('Selected items deleted successfully');
    } catch (error) {
      notify('Error deleting items');
    }
  };

  const toggleSelectItem = (item) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(item.id)) {
      newSelectedItems.delete(item.id);
      if (selectedItem && selectedItem.id === item.id) {
        setSelectedItem(null);
      }
    } else {
      newSelectedItems.add(item.id);
      setSelectedItem(item);
    }
    setSelectedItems(newSelectedItems);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const filteredItems = items.filter(item => {
    const itemName = item.name.toLowerCase();
    const itemId = item.id.toString(); // Convertir ID a string para la comparación
    return (
      itemName.startsWith(filter.toLowerCase()) || itemId.startsWith(filter)
    );
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const notify = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = React.useMemo(() => {
    let sortableItems = [...paginatedItems];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [paginatedItems, sortConfig]);

  return (
    <div className="App">
      <h1>Product Management</h1>
      <CrudForm
        addItem={addItem}
        editItem={editItem}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />
      {notification && <div className="notification">{notification}</div>}
      <div className="filter-container">
        <input
          type="text"
          placeholder="Filter by ID or Name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="product-list-container">
        <h2>Product List</h2>
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedItems.size === filteredItems.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th onClick={() => requestSort('id')}>
                ID
                {sortConfig.key === 'id' ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : null}
              </th>
              <th onClick={() => requestSort('name')}>
                Name
                {sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : null}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleSelectItem(item)}
                  />
                </td>
                <td>{item.id}</td>
                <td>{item.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button onClick={prevPage} disabled={currentPage === 1}>Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
        </div>
      </div>
      <div className="action-buttons">
        <button onClick={deleteSelectedItems} disabled={selectedItems.size === 0} className="delete-btn">
          <i className="fas fa-trash"></i> Delete Selected
        </button>
      </div>
    </div>
  );
}

export default App;
