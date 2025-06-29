import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import './AddHarwarePage.css';
import Sidebar from '../Components/Layouts/Sidebar'; 
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const API_URL = `${process.env.REACT_APP_API}/add-hardware`;

const AddHardwarePage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [appliance, setAppliance] = useState('');
  const [watts, setWatts] = useState('');
  const [type, setType] = useState('AC');
  const [quantity, setQuantity] = useState(1);
  const [hardwareList, setHardwareList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchHardware();
  }, []);

  const fetchHardware = async () => {
    try {
      const res = await axios.get(API_URL);
      setHardwareList(res.data);
    } catch (err) {
      setHardwareList([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${process.env.REACT_APP_API}/add-hardware/${editId}`, { Appliance: appliance, Watts: watts, Type: type, Quantity: quantity });
      } else {
        await axios.post(`${process.env.REACT_APP_API}/add-hardware`, { Appliance: appliance, Watts: watts, Type: type, Quantity: quantity });
      }
      setAppliance('');
      setWatts('');
      setType('AC');
      setQuantity(1);
      setEditId(null);
      fetchHardware();
    } catch (err) {
      alert('Error saving hardware');
    }
  };

  const handleEdit = (hw) => {
    setEditId(hw._id);
    setAppliance(hw.Appliance);
    setWatts(hw.Watts);
    setType(hw.Type);
    setQuantity(hw.Quantity || 1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hardware?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchHardware();
    } catch (err) {
      alert('Error deleting hardware');
    }
  };

  // Filtered and paginated hardware
  const filteredHardware = hardwareList.filter(hw =>
    hw.Appliance.toLowerCase().includes(search.toLowerCase()) ||
    hw.Type.toLowerCase().includes(search.toLowerCase())
  );
  const pageCount = Math.ceil(filteredHardware.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredHardware.slice(offset, offset + itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  if (!user || user.role !== "admin") return null;

  return (
<div className="add-hardware-page">
    <Sidebar />

     <div className="add-hardware-container">
    
      <h2>Add New Hardware</h2>
       
      <form className="add-hardware-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Appliance"
          value={appliance}
          onChange={e => setAppliance(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Watts"
          value={watts}
          onChange={e => setWatts(e.target.value)}
          required
        />
        <select value={type} onChange={e => setType(e.target.value)} required>
          <option value="AC">AC</option>
          <option value="Fan">Fan</option>
          <option value="Exhaust">Exhaust</option>
          <option value="Blower">Blower</option>
          <option value="Lights">Lights</option>
          <option value="Others">Others</option>
        </select>
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          min={1}
          onChange={e => setQuantity(Number(e.target.value))}
          required
        />
        <button type="submit">{editId ? 'Update' : 'Add'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setAppliance(''); setWatts(''); setType('AC'); setQuantity(1); }}>Cancel</button>}
      </form>
      <h3>Hardware List</h3>
      <input
        className="add-hardware-search"
        type="text"
        placeholder="Search by appliance or type..."
        value={search}
        onChange={e => { setSearch(e.target.value); setCurrentPage(0); }}
      />
      <table className="add-hardware-table">
        <thead>
          <tr>
            <th>Appliance</th>
            <th>Watts</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: 'center' }}>No hardware found.</td></tr>
          ) : (
            currentItems.map(hw => (
              <tr key={hw._id}>
                <td>{hw.Appliance}</td>
                <td>{hw.Watts}</td>
                <td>{hw.Type}</td>
                <td>{hw.Quantity || 1}</td>
                <td>
                  <button onClick={() => handleEdit(hw)}>Edit</button>
                  <button onClick={() => handleDelete(hw._id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <ReactPaginate
        previousLabel={"← Previous"}
        nextLabel={"Next →"}
        pageCount={pageCount}
        onPageChange={handlePageClick}
        forcePage={currentPage}
        containerClassName={"pagination"}
        activeClassName={"active"}
        pageRangeDisplayed={2}
        marginPagesDisplayed={1}
        breakLabel={"..."}
        renderOnZeroPageCount={null}
      />
       
    </div>
</div>

   
  );
};

export default AddHardwarePage;
