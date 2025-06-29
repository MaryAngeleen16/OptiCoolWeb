import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api/v1/add-hardware';

const AddHardwarePage = () => {
  const [appliance, setAppliance] = useState('');
  const [watts, setWatts] = useState('');
  const [type, setType] = useState('AC');
  const [quantity, setQuantity] = useState(1);
  const [hardwareList, setHardwareList] = useState([]);
  const [editId, setEditId] = useState(null);

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
        await axios.put(`${API_URL}/${editId}`, { Appliance: appliance, Watts: watts, Type: type, Quantity: quantity });
      } else {
        await axios.post(API_URL, { Appliance: appliance, Watts: watts, Type: type, Quantity: quantity });
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

  return (
    <div style={{ maxWidth: 500, margin: 'auto' }}>
      <h2>Add / Edit Hardware</h2>
      <form onSubmit={handleSubmit}>
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
      <ul>
        {hardwareList.map(hw => (
          <li key={hw._id}>
            {hw.Appliance} - {hw.Watts}W - {hw.Type} - Qty: {hw.Quantity || 1}
            <button onClick={() => handleEdit(hw)}>Edit</button>
            <button onClick={() => handleDelete(hw._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddHardwarePage;
