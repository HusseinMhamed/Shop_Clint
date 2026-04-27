import React from 'react';
import { Container, Grid, Card, CardContent, CardMedia, Typography, Button, Box } from '@mui/material';

// Dummy products for display
const dummyProducts = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: '$99.99',
    description: 'High quality noise-canceling wireless headphones.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
  },
  {
    id: 2,
    name: 'Smart Watch',
    price: '$149.99',
    description: 'Track your fitness and stay connected.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
  },
  {
    id: 3,
    name: 'Digital Camera',
    price: '$499.99',
    description: 'Capture beautiful moments with this amazing camera.',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80',
  },
  {
    id: 4,
    name: 'Laptop Backpack',
    price: '$45.00',
    description: 'Durable and water-resistant backpack for your gear.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
  }
];

const Products = () => {
  return (
    <Container sx={{ py: 8 }} maxWidth="lg">
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 6, fontWeight: 'bold' }}>
        Our Products
      </Typography>
      <Grid container spacing={4}>
        {dummyProducts.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
              <CardMedia
                component="img"
                sx={{
                  height: 200,
                  objectFit: 'cover'
                }}
                image={product.image}
                alt={product.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2" noWrap>
                  {product.name}
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  {product.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.description}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button size="small" variant="contained" fullWidth>
                  Add to Cart
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Products;
