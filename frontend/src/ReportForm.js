import { useState, useEffect } from 'react';
import axios from 'axios';
import './ReportForm.css';
import { useSelector } from 'react-redux';
import moment from 'moment-timezone';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReportForm = () => {
  const [appliance, setAppliance] = useState('');
  const [fanCount, setFanCount] = useState(1);
  const [exhaustCount, setExhaustCount] = useState(1);
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState("");
  const { user, token } = useSelector(state => state.auth);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [hardwareOptions, setHardwareOptions] = useState([]);

  const reasons = [
    "Overheating",
    "Producing Unusual Noises",
    "Weak Air",
    "Turning Off Unexpectedly",
    "Not Responding to Commands",
    "Physical Damage",
    "Others"
  ];

  const applianceOptions = [
    "Midea AC",
    "Carrier AC",
    "Fan",
    "Exhaust Fan",
    "Blower"
  ];

  useEffect(() => {
    // Fetch custom hardware from backend
    const fetchHardware = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API}/add-hardware`);
        setHardwareOptions(res.data || []);
      } catch (err) {
        setHardwareOptions([]);
      }
    };
    fetchHardware();
  }, []);

  const allApplianceOptions = [
    ...applianceOptions,
    ...hardwareOptions.map(hw => hw.Appliance)
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appliance || !status || !reason || (reason === "Others" && !otherReason.trim())) {
      toast.error("Please fill out all fields.");
      return;
    }

    try {
      if (!user) {
        toast.error("User information is missing. Please log in again.");
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
        description: reason === "Others" ? otherReason : reason,
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
        toast.success("Report submitted successfully.");
        navigate('/home'); // Go back to home
      } else {
        toast.error("Failed to submit report. Reason: " + response.data.message);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-form-container">
      <ToastContainer />
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
          {allApplianceOptions.map((a) => (
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
        <div>
          {reasons.map((r) => (
            <div key={r} style={{ marginBottom: 4 }}>
              <input
                type="radio"
                id={r}
                name="reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
              />
              <label htmlFor={r}>{r}</label>
              {r === "Others" && reason === "Others" && (
                <input
                  type="text"
                  placeholder="Please specify..."
                  value={otherReason}
                  onChange={e => setOtherReason(e.target.value)}
                  style={{ marginLeft: 10 }}
                  required
                />
              )}
            </div>
          ))}
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Report"}
        </button>

        <button
          type="button"
          onClick={() => navigate('/home')}
          style={{ marginLeft: '10px' }}
        >
          Back to Dashboard
        </button>
      </form>
    </div>
  );
};

export default ReportForm;
