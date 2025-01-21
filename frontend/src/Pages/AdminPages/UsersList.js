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















import React, { useEffect, useState } from 'react';
import Header from '../../Components/Layouts/Header';
import { Avatar, Box, Button, Container, Menu, MenuItem } from '@mui/material';
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

    const fetchAllUsers = async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API}/users/all`);
            setTableData(data.users);
        } catch (err) {
            console.error(err);
        }
    };

    const updateUserRole = async (userId, newRole) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API}/users/update-role/${userId}`,
                { role: newRole }
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

    const handleMenuClick = (event, userId) => {
        setAnchorEl(event.currentTarget);
        setSelectedUserId(userId);
    };

    const handleMenuClose = (newRole) => {
        setAnchorEl(null);
        if (newRole && selectedUserId) {
            updateUserRole(selectedUserId, newRole);
        }
        setSelectedUserId(null);
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
                                    onClick={(event) => handleMenuClick(event, row._id)}
                                />
                                <DeleteIcon
                                    color="error"
                                    sx={{ cursor: 'pointer' }}
                                    fontSize="large"
                                    onClick={() => alert('Delete functionality not implemented')}
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
