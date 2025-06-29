import { useState } from 'react';
import axios from 'axios';
import './ReportForm.css';
import { useSelector } from 'react-redux';
import moment from 'moment-timezone';
import { useNavigate } from 'react-router-dom';

const ReportForm = () => {
  const [appliance, setAppliance] = useState('');
  const [fanCount, setFanCount] = useState(1);
  const [exhaustCount, setExhaustCount] = useState(1);
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const { user, token } = useSelector(state => state.auth);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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
    "Fan",
    "Exhaust Fan",
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

      let finalAppliance = appliance;
      if (appliance === "Fan") {
        finalAppliance = `${fanCount} Fan${fanCount > 1 ? 's' : ''}`;
      } else if (appliance === "Exhaust Fan") {
        finalAppliance = `${exhaustCount} Exhaust Fan${exhaustCount > 1 ? 's' : ''}`;
      }

      const reportPayload = {
        appliance: finalAppliance,
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
        navigate('/'); // Go back to dashboard
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
    <div className="report-form-container">
      <h2>Report an Appliance Issue</h2>
      <form onSubmit={handleSubmit} className="report-form">
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

        {/* Fan Count */}
        {appliance === "Fan" && (
          <>
            <label htmlFor="fanCount">Number of Fans Broken:</label>
            <input
              type="number"
              id="fanCount"
              min="1"
              max="4"
              value={fanCount}
              onChange={(e) => setFanCount(Number(e.target.value))}
              required
            />
          </>
        )}

        {/* Exhaust Fan Count */}
        {appliance === "Exhaust Fan" && (
          <>
            <label htmlFor="exhaustCount">Number of Exhaust Fans Broken:</label>
            <input
              type="number"
              id="exhaustCount"
              min="1"
              max="2"
              value={exhaustCount}
              onChange={(e) => setExhaustCount(Number(e.target.value))}
              required
            />
          </>
        )}

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

        {/* Reason */}
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

        <button
          type="button"
          onClick={() => navigate('/')}
          style={{ marginLeft: '10px' }}
        >
          Back to Dashboard
        </button>
      </form>
    </div>
  );
};

export default ReportForm;
