import React, { useEffect, useState } from 'react'
import Header from '../../Components/Layouts/Header'
import { Avatar, Box, Button, Container } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import axios from 'axios';
DataTable.use(DT);

export default function UsersList() {


    const [tableData, setTableData] = useState([]);

    const fetchAllUsers = async () => {
        try {

            const { data } = await axios.get(`${process.env.REACT_APP_API}/users/all`,)

            setTableData(data.users)
            console.log(data.users)

        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        fetchAllUsers();
    }, [])


    return (
        <div>
            <Header />

            <Container sx={{ mt: 15 }}>

                <DataTable className="display"
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
                        0: (data, row) => (
                            <Avatar src={data} sx={{ width: 75, height: 75, }} />
                        ),
                        4: (data, row) => (
                            <div>{new Date(data).toLocaleDateString()}</div>
                        ),
                        5: (data, row) => (
                            <div>
                                <ManageAccountsIcon color='warning' sx={{ cursor: 'pointer', }} fontSize='large' />
                                <DeleteIcon color='error' sx={{ cursor: 'pointer' }} fontSize='large' />
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


            </Container>

        </div>
    )
}
