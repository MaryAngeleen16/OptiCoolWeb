// import React, { useEffect, useState } from 'react'
// import Header from '../../Components/Layouts/Header'
// import { Avatar, Box, Button, Container } from '@mui/material'
// import DeleteIcon from '@mui/icons-material/Delete';
// import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

// import DataTable from 'datatables.net-react';
// import DT from 'datatables.net-dt';
// import axios from 'axios';
// DataTable.use(DT);

// export default function UsersList() {

//     const [tableData, setTableData] = useState([]);

//     const fetchAllUsers = async () => {
//         try {

//             const { data } = await axios.get(`${process.env.REACT_APP_API}/users/all`,)

//             setTableData(data.users)
//             console.log(data.users)

//         } catch (err) {
//             console.log(err);
//         }
//     }

//     useEffect(() => {
//         fetchAllUsers();
//     }, [])

//     return (
//         <div>
//             <Header />

//             <Container sx={{ mt: 15 }}>

//                 <DataTable className="display"
//                     data={tableData}
//                     options={{}}
//                     columns={[
//                         { data: 'avatar.url' },
//                         { data: 'username' },
//                         { data: 'email' },
//                         { data: 'role' },
//                         { data: 'createdAt' },
//                         { data: '_id' },
//                     ]}
//                     slots={{
//                         0: (data, row) => (
//                             <Avatar src={data} sx={{ width: 75, height: 75, }} />
//                         ),
//                         4: (data, row) => (
//                             <div>{new Date(data).toLocaleDateString()}</div>
//                         ),
//                         5: (data, row) => (
//                             <div>
//                                 <ManageAccountsIcon color='warning' sx={{ cursor: 'pointer', }} fontSize='large' />
//                                 <DeleteIcon color='error' sx={{ cursor: 'pointer' }} fontSize='large' />
//                             </div>
//                         ),
//                     }}
//                 >
//                     <thead>
//                         <tr>
//                             <th>Avatar</th>
//                             <th>Username</th>
//                             <th>Email</th>
//                             <th>Role</th>
//                             <th>Created At</th>
//                             <th>Action</th>
//                         </tr>
//                     </thead>
//                 </DataTable>

//             </Container>

//         </div>
//     )
// }

// import React, { useEffect, useState } from 'react';
// import Header from '../../Components/Layouts/Header';
// import { Avatar, Box, Button, Container, Menu, MenuItem } from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';
// import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
// import DataTable from 'datatables.net-react';
// import DT from 'datatables.net-dt';
// import axios from 'axios';

// DataTable.use(DT);

// export default function UsersList() {
//     const [tableData, setTableData] = useState([]);
//     const [anchorEl, setAnchorEl] = useState(null); // For menu
//     const [selectedUserId, setSelectedUserId] = useState(null); // Track the user being updated

//     const fetchAllUsers = async () => {
//         try {
//             const { data } = await axios.get(`${process.env.REACT_APP_API}/users/all`);
//             setTableData(data.users);
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     const updateUserRole = async (userId, newRole) => {
//         try {
//             const response = await axios.put(
//                 `${process.env.REACT_APP_API}/users/update-role/${userId}`,
//                 { role: newRole }
//             );
//             if (response.data.success) {
//                 alert('User role updated successfully');
//                 fetchAllUsers(); // Refresh table data
//             }
//         } catch (error) {
//             console.error(error);
//             alert('Failed to update user role');
//         }
//     };

//     const handleMenuClick = (event, userId) => {
//         setAnchorEl(event.currentTarget);
//         setSelectedUserId(userId);
//     };

//     const handleMenuClose = (newRole) => {
//         setAnchorEl(null);
//         if (newRole && selectedUserId) {
//             updateUserRole(selectedUserId, newRole);
//         }
//         setSelectedUserId(null);
//     };

//     useEffect(() => {
//         fetchAllUsers();
//     }, []);

//     return (
//         <div>
//             <Header />

//             <Container sx={{ mt: 15 }}>
//                 <DataTable
//                     className="display"
//                     data={tableData}
//                     options={{}}
//                     columns={[
//                         { data: 'avatar.url' },
//                         { data: 'username' },
//                         { data: 'email' },
//                         { data: 'role' },
//                         { data: 'createdAt' },
//                         { data: '_id' },
//                     ]}
//                     slots={{
//                         0: (data) => <Avatar src={data} sx={{ width: 75, height: 75 }} />,
//                         4: (data) => <div>{new Date(data).toLocaleDateString()}</div>,
//                         5: (data, row) => (
//                             <div>
//                                 <ManageAccountsIcon
//                                     color="warning"
//                                     sx={{ cursor: 'pointer', marginRight: 2 }}
//                                     fontSize="large"
//                                     onClick={(event) => handleMenuClick(event, row._id)}
//                                 />
//                                 <DeleteIcon
//                                     color="error"
//                                     sx={{ cursor: 'pointer' }}
//                                     fontSize="large"
//                                     onClick={() => alert('Delete functionality not implemented')}
//                                 />
//                             </div>
//                         ),
//                     }}
//                 >
//                     <thead>
//                         <tr>
//                             <th>Avatar</th>
//                             <th>Username</th>
//                             <th>Email</th>
//                             <th>Role</th>
//                             <th>Created At</th>
//                             <th>Action</th>
//                         </tr>
//                     </thead>
//                 </DataTable>

//                 {/* Role Update Menu */}
//                 <Menu
//                     anchorEl={anchorEl}
//                     open={Boolean(anchorEl)}
//                     onClose={() => handleMenuClose(null)}
//                 >
//                     <MenuItem onClick={() => handleMenuClose('admin')}>Set as Admin</MenuItem>
//                     <MenuItem onClick={() => handleMenuClose('user')}>Set as User</MenuItem>
//                 </Menu>
//             </Container>
//         </div>
//     );
// }










import React, { useEffect, useState } from 'react';
import Header from '../../Components/Layouts/Header';
import { Avatar, Container, Menu, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import axios from 'axios';

DataTable.use(DT);

export default function UsersList() {
    const [tableData, setTableData] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null); // For menu
    const [selectedUserId, setSelectedUserId] = useState(null); // Track the user being updated
    const token = localStorage.getItem('token'); // Get token from localStorage

    const fetchAllUsers = async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API}/users/all`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Add token in request headers
                }
            });
            setTableData(data.users);
        } catch (err) {
            console.error(err);
            // Handle error, e.g., redirect to login if not authorized
        }
    };

    const updateUserRole = async (userId, newRole) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API}/users/update-role/${userId}`,
                { role: newRole },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Send token here too
                    }
                }
            );
            if (response.data.success) {
                alert('User role updated successfully');
                fetchAllUsers(); // Refresh table data
            }
        } catch (error) {
            console.error(error);
            alert('Failed to update user role');
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
    
        try {
            const response = await axios.delete(`${process.env.REACT_APP_API}/users/delete/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Ensure the token is included
                }
            });
    
            if (response.data.success) {
                alert("User deleted successfully");
                fetchAllUsers(); // Refresh the user list after deletion
            }
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete user");
        }
    };
    


    const handleMenuClick = (event, userId) => {
        setAnchorEl(event.currentTarget);
        setSelectedUserId(userId);
    };

    const handleMenuClose = (newRole) => {
        setAnchorEl(null);
        if (newRole && selectedUserId) {
            updateUserRole(selectedUserId, newRole); // Update the user's role
        }
        setSelectedUserId(null); // Clear the selected user ID
    };

    useEffect(() => {
        fetchAllUsers();
    }, []);

    return (
        <div>
            <Header />
            <Container sx={{ mt: 15 }}>
                <DataTable
                    className="display"
                    data={tableData}
                    options={{}}
                    columns={[
                        { data: 'avatar.url' },
                        { data: 'username' },
                        { data: 'email' },
                        { data: 'role' },
                        { data: 'createdAt' },
                        { data: '_id' },
                    ]}
                    slots={{
                        0: (data) => <Avatar src={data} sx={{ width: 75, height: 75 }} />,
                        4: (data) => <div>{new Date(data).toLocaleDateString()}</div>,
                        5: (data, row) => (
                            <div>
                                <ManageAccountsIcon
                                    color="warning"
                                    sx={{ cursor: 'pointer', marginRight: 2 }}
                                    fontSize="large"
                                    onClick={(event) => handleMenuClick(event, row._id)} // Open the menu for the selected user
                                />
                             <DeleteIcon
                                color="error"
                                sx={{ cursor: 'pointer' }}
                                fontSize="large"
                                onClick={() => deleteUser(row._id)} // Call deleteUser with the user ID
                            />

                            </div>
                        ),
                    }}
                >
                    <thead>
                        <tr>
                            <th>Avatar</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Created At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                </DataTable>

                {/* Role Update Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => handleMenuClose(null)}
                >
                    <MenuItem onClick={() => handleMenuClose('admin')}>Set as Admin</MenuItem>
                    <MenuItem onClick={() => handleMenuClose('user')}>Set as User</MenuItem>
                </Menu>
            </Container>
        </div>
    );
}


