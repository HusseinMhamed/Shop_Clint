import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Paper } from '@mui/material';

const Dashboard = () => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const handleAddProduct = (e) => {
    e.preventDefault();
    // In the future this will hit the backend API
    console.log('Product Added:', { productName, price, description });
    alert('Product added successfully!');
    setProductName('');
    setPrice('');
    setDescription('');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" gutterBottom align="center" color="textSecondary">
          Add new products to the store
        </Typography>

        <Box component="form" onSubmit={handleAddProduct} sx={{ mt: 4 }}>
          <TextField
            fullWidth
            label="Product Name"
            variant="outlined"
            margin="normal"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Price"
            type="number"
            variant="outlined"
            margin="normal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            variant="outlined"
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
          >
            Add Product
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard;
