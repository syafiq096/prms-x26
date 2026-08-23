import { AppBar, Box, Container, CssBaseline, Toolbar, Typography } from '@mui/material';
import { Route, Routes, Link } from 'react-router-dom';

export function App() {
  return <><CssBaseline /><AppBar position="static"><Toolbar><Typography component={Link} to="/" color="inherit" sx={{ textDecoration: 'none' }} variant="h6">Spaceship X26 PRMS</Typography></Toolbar></AppBar><Container maxWidth="lg"><Box component="main" sx={{ py: 6 }}><Routes><Route path="*" element={<><Typography variant="h3" gutterBottom>Passenger Resource Management</Typography><Typography color="text.secondary">Mission control dashboard foundation. Level 1 modules will be added here.</Typography></>} /></Routes></Box></Container></>;
}
