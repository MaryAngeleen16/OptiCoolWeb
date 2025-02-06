import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

const ElectricityUsage = () => {
    const [view, setView] = useState('daily');
    const [data, setData] = useState({
        labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
        datasets: [
            {
                label: 'Electricity Usage (kWh)',
                data: [5, 6, 7, 8, 5, 6, 7, 8, 5, 6, 7, 8, 5, 6, 7, 8, 5, 6, 7, 8, 5, 6, 7, 8],
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
            },
        ],
    });

    useEffect(() => {
        fetchData(view);
    }, [view]);

    const generateDummyElectricityData = (view) => {
        let labels = [];
        let dummyData = [];

        if (view === 'daily') {
            labels = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
            dummyData = Array.from({ length: 24 }, () => Math.floor(Math.random() * 30));
        } else if (view === 'weekly') {
            labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            dummyData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 150));
        } else if (view === 'monthly') {
            labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            dummyData = Array.from({ length: 12 }, () => Math.floor(Math.random() * 700));
        }

        return { labels, dummyData };
    };

    const fetchData = async (view) => {
        try {
            const response = await axios.get(`http://your_raspberry_pi_ip:5000/power_consumption_data?view=${view}`);
            const fetchedData = response.data;

            let labels = [];
            if (view === 'daily') {
                labels = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
            } else if (view === 'weekly') {
                labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            } else if (view === 'monthly') {
                labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            }

            setData({
                labels: labels,
                datasets: [
                    {
                        label: 'Electricity Usage (kWh)',
                        data: fetchedData.data,
                        borderColor: 'rgba(75,192,192,1)',
                        backgroundColor: 'rgba(75,192,192,0.2)',
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching electricity usage data:', error);

            // Use dummy data in case of error
            const { labels, dummyData } = generateDummyElectricityData(view);
            setData({
                labels: labels,
                datasets: [
                    {
                        label: 'Electricity Usage (kWh)',
                        data: dummyData,
                        borderColor: 'rgba(75,192,192,1)',
                        backgroundColor: 'rgba(75,192,192,0.2)',
                    },
                ],
            });
        }
    };

    const handleViewChange = (newView) => {
        setView(newView);
    };

    return (
        <div>
            <div className="view-toggle"  style={{paddingBottom: '40px' }}>
                <button onClick={() => handleViewChange('daily')} className={view === 'daily' ? 'active' : ''}>Daily</button>
                <button onClick={() => handleViewChange('weekly')} className={view === 'weekly' ? 'active' : ''}>Weekly</button>
                <button onClick={() => handleViewChange('monthly')} className={view === 'monthly' ? 'active' : ''}>Monthly</button>
            </div>

            <section  style={{fontSize: '20px' }}>
                <Line
                    data={data}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: { display: true },
                        },
                        scales: {
                            y: {
                                title: {
                                    display: true,
                                    text: 'kWh',
                                    
                                },
                            },
                        },
                    }}
                />
            </section>
        </div>
    );
};

export default ElectricityUsage;