import React, { useState } from 'react';
import axios from 'axios';
import './ReportForm.css'; 
import { useSelector } from 'react-redux'; 
import moment from 'moment-timezone'; 

const ReportForm = ({ onClose }) => {
  const [appliance, setAppliance] = useState('');
  const [unit, setUnit] = useState('');
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const { user, token } = useSelector(state => state.auth);
  const [submitting, setSubmitting] = useState(false);

  const reasons = [
    "Overheating",
    "Producing Unusual Noises",
    "Weak Air",
    "Turning Off Unexpectedly",
    "Not Responding to Commands",
    "Physical Damage"
  ];

  const applianceOptions = [
    "Midea AC",
    "Carrier AC",
    "Fan 1", "Fan 2", "Fan 3", "Fan 4",
    "Exhaust 1", "Exhaust 2",
    "Blower"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appliance || !status || !reason) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      if (!user) {
        alert("User information is missing. Please log in again.");
        return;
      }

      setSubmitting(true);

      const timeReported = moment().tz("Asia/Manila").format("hh:mm:ss A");

      const reportPayload = {
        appliance: appliance,
        description: reason,
        status: status,
        reportDate: new Date(),
        timeReported: timeReported,
        user: user._id ?? "Missing ID"
      };

      const response = await axios.post(`${process.env.REACT_APP_API}/ereport`, reportPayload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert("Report submitted successfully.");
        onClose();
      } else {
        alert("Failed to submit report. Reason: " + response.data.message);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Report an Appliance Issue</h2>
        <form onSubmit={handleSubmit}>
          {/* Appliance Dropdown */}
          <label htmlFor="appliance">Select Appliance:</label>
          <select
            id="appliance"
            value={appliance}
            onChange={(e) => setAppliance(e.target.value)}
            required
          >
            <option value="">-- Select Appliance --</option>
            {applianceOptions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          {/* Status Dropdown */}
          <label htmlFor="status">Current Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="">-- Select Status --</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Reason Radio Buttons */}
          <label>Reason:</label>
          {reasons.map((r) => (
            <div key={r}>
              <input
                type="radio"
                id={r}
                name="reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
              />
              <label htmlFor={r}>{r}</label>
            </div>
          ))}

          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;
