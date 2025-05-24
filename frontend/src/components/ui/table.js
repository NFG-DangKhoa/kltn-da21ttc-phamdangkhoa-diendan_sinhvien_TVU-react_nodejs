// src/components/ui/table.js
import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

const CustomTable = ({ data }) => {
    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Tiêu Đề</TableCell>
                    <TableCell>Tác Giả</TableCell>
                    <TableCell>Thời Gian</TableCell>
                    <TableCell>Hành Động</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {data.map((row, index) => (
                    <TableRow key={index}>
                        <TableCell>{row.title}</TableCell>
                        <TableCell>{row.author}</TableCell>
                        <TableCell>{row.time}</TableCell>
                        <TableCell>{row.actions}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default CustomTable;
