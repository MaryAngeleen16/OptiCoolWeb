import React, { useState } from 'react';
import axios from 'axios';
import './ReportForm.css'; 
import { useSelector } from 'react-redux'; 
import moment from 'moment-timezone'; 

const ReportForm = ({ device, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const { user, token } = useSelector(state => state.auth); // Get user and token from Redux store
  const [submitting, setSubmitting] = useState(false);

  const statuses = [
    "Overheating",
    "Producing Unusual Noises",
    "Weak Air",
    "Turning Off Unexpectedly",
    "Not Responding to Commands",
    "Physical Damage"
  ];

  const handleRadioChange = (status) => {
    setSelectedStatus(status);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) {
      alert("Please select a status.");
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
        appliance: device,
        status: selectedStatus,
        reportDate: new Date(), // Set the report date
        timeReported: timeReported, 
        user: user._id ? user._id : "Missing ID"
      };

      console.log("Final reportPayload:", JSON.stringify(reportPayload, null, 2)); // Log the final report payload
      console.log("Token:", token); // Log the token

      const response = await axios.post(`${process.env.REACT_APP_API}/ereport`, reportPayload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("API Response:", response.data); // Log the response data

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
        <h2>Report Issue for {device}</h2>
        <form onSubmit={handleSubmit}>
          {statuses.map((status) => (
            <div key={status}>
              <input
                type="radio"
                id={status}
                name="status"
                value={status}
                checked={selectedStatus === status}
                onChange={() => handleRadioChange(status)}
              />
              <label htmlFor={status}>{status}</label>
            </div>
          ))}
          <button type="submit" disabled={submitting}>Submit Report</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;