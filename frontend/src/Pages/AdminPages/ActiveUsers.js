import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Assuming you use Axios for API requests
import Header from '../../Components/Layouts/Header';

const ActiveUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/users/all`); // Corrected URL to use baseURL
        setUsers(response.data.users);
      } catch (err) {
        console.error(err);
        setError('Failed to load active users');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveUsers();
  }, []);

  if (loading) {
    return (
      <div style={styles.centered}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p>Loading active users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centered}>
        <p style={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header />
      <h1 style={styles.title}>Active Users</h1>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Username</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} style={styles.tr}>
              <td style={styles.td}>{user.username}</td>
              <td style={styles.td}>{user.email}</td>
              <td style={{ ...styles.td, ...(user.isActive ? styles.online : styles.offline) }}>
                {user.isActive ? 'Online' : 'Offline'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  table: {
    width: '80%',
    borderCollapse: 'collapse',
    margin: '0 auto', 
    display: 'table'   ,
    marginTop: '5%',
  },
  th: {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
    backgroundColor: '#f2f2f2',
  },
  tr: {
    '&:nth-child(even)': { backgroundColor: '#f9f9f9' },
    '&:hover': { backgroundColor: '#ddd' },
  },
  td: {
    border: '1px solid #ddd',
    padding: '8px',
  },
  online: {
    color: 'green',
    fontWeight: 'bold',
  },
  offline: {
    color: 'red',
    fontWeight: 'bold',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  error: {
    fontSize: '18px',
    color: 'red',
  },
};

export default ActiveUsers;