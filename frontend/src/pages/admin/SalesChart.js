// src/components/Charts/SalesChart.jsx
import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Paper, Typography, Box, useTheme } from '@mui/material';

const data = [
    { name: 'Tháng 1', DoanhThu: 4000, ChiPhi: 2400 },
    { name: 'Tháng 2', DoanhThu: 3000, ChiPhi: 1398 },
    { name: 'Tháng 3', DoanhThu: 2000, ChiPhi: 9800 },
    { name: 'Tháng 4', DoanhThu: 2780, ChiPhi: 3908 },
    { name: 'Tháng 5', DoanhThu: 1890, ChiPhi: 4800 },
    { name: 'Tháng 6', DoanhThu: 2390, ChiPhi: 3800 },
    { name: 'Tháng 7', DoanhThu: 3490, ChiPhi: 4300 },
];

const SalesChart = () => {
    const theme = useTheme();

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography variant="h6" gutterBottom>
                Biểu Đồ Doanh Thu & Chi Phí
            </Typography>
            <Box sx={{ flexGrow: 1, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                        <YAxis stroke={theme.palette.text.secondary} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: theme.palette.background.paper,
                                borderColor: theme.palette.divider,
                                color: theme.palette.text.primary,
                            }}
                            labelStyle={{ color: theme.palette.text.secondary }}
                        />
                        <Legend wrapperStyle={{ color: theme.palette.text.primary }} />
                        <Line
                            type="monotone"
                            dataKey="DoanhThu"
                            stroke={theme.palette.primary.main}
                            activeDot={{ r: 8 }}
                            name="Doanh Thu"
                        />
                        <Line
                            type="monotone"
                            dataKey="ChiPhi"
                            stroke={theme.palette.secondary.main}
                            name="Chi Phí"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default SalesChart;