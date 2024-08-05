'use client'

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, Divider, Card, CardContent, CardActions, Snackbar, IconButton, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { firestore } from '@/firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  batch,
  getDoc,
} from 'firebase/firestore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [initialQuantity, setInitialQuantity] = useState(1); // Default to 1
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const snapshot = query(collection(firestore, 'inventory'));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({ 
          name: doc.id, 
          ...doc.data() });
      });
      setInventory(inventoryList);
    } catch (error) {
      setSnackbarMessage('Error fetching inventory.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = async (item) => {
    if (!item.trim()) {
      setSnackbarMessage('Item name cannot be empty.');
      setSnackbarOpen(true);
      return;
    }
    try {
      setLoading(true);
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1 });
      } else {
        await setDoc(docRef, { quantity: initialQuantity });
      }
      await fetchInventory();
      setSnackbarMessage('Item added successfully.');
    } catch (error) {
      setSnackbarMessage('Error adding item.');
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const handleRemoveItem = async (item) => {
    try {
      setLoading(true);
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1 });
        }
      }
      await fetchInventory();
      setSnackbarMessage('Item removed successfully.');
    } catch (error) {
      setSnackbarMessage('Error removing item.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (item) => {
    try {
      setLoading(true);
      const docRef = doc(collection(firestore, 'inventory'), item);
      await deleteDoc(docRef);
      await fetchInventory();
      setSnackbarMessage('Item deleted successfully.');
    } catch (error) {
      setSnackbarMessage('Error deleting item.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setItemName('');
    setInitialQuantity(1); // Reset initial quantity on close
    setOpen(false);
  };
  const handleSnackbarClose = () => setSnackbarOpen(false);
  const handleConfirmDialogOpen = () => setConfirmDialogOpen(true);
  const handleConfirmDialogClose = () => setConfirmDialogOpen(false);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      bgcolor="#f4f6f8"
      p={2}
      overflow="hidden"
    >
      {/* Sidebar */}
      <Box
        width="25vw"
        height="100%"
        bgcolor="#fff"
        p={2}
        display="flex"
        flexDirection="column"
        gap={2}
        boxShadow={3}
        borderRadius={2}
        overflow="auto"
      >
        <Typography variant="h5" color="primary" display="flex" alignItems="center" gap={1}>
          <ListAltIcon /> Inventory
        </Typography>
        <Divider />
        <Stack spacing={2}>
          {inventory.map(({ name, quantity }) => (
            <Card key={name} variant="outlined" sx={{ position: 'relative' }}>
              <CardContent>
                <Typography variant="h6">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography color="textSecondary">
                  Quantity: {quantity}
                </Typography>
              </CardContent>
              <IconButton
                onClick={() => handleDeleteItem(name)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                }}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Card>
          ))}
        </Stack>
      </Box>

      {/* Main Content */}
      <Box
        width="75vw"
        height="100%"
        display="flex"
        flexDirection="column"
        p={2}
        overflow="auto"
      >
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Stack width="100%" direction={'row'} spacing={2}>
              <TextField
                id="item-name"
                label="Item Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                id="quantity"
                label="Quantity"
                type="number"
                variant="outlined"
                fullWidth
                value={initialQuantity}
                onChange={(e) => setInitialQuantity(Number(e.target.value))}
                inputProps={{ min: 1 }} // Prevent negative values
              />
              <Button
                variant="contained"
                onClick={() => handleAddItem(itemName)}
                startIcon={<AddIcon />}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Add'}
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Box width="100%" maxWidth="800px">
          <Box
            width="100%"
            height="100px"
            bgcolor={'#ADD8E6'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            borderRadius="4px 4px 0 0"
            boxShadow={2}
          >
            <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
              Items in Inventory
            </Typography>
          </Box>
          <Stack width="100%" spacing={2} overflow="auto" p={2} bgcolor="#fff" boxShadow={1} borderRadius="0 0 4px 4px">
            {inventory.map(({ name, quantity }) => (
              <Card key={name} variant="outlined">
                <CardContent>
                  <Typography variant="h6">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography color="textSecondary">
                    Quantity: {quantity}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary" onClick={() => handleAddItem(name)} startIcon={<AddIcon />}>
                    Add
                  </Button>
                  <Button size="small" color="secondary" onClick={() => handleRemoveItem(name)} startIcon={<RemoveIcon />}>
                    Remove
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Stack>
        </Box>
      </Box>
      
      {/* Add New Item Button */}
      <Button
        variant="contained"
        color="secondary"
        onClick={handleOpen}
        startIcon={<AddIcon />}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1200, // Ensure it appears above other elements
        }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Add New Item'}
      </Button>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleSnackbarClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleConfirmDialogClose}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear all items in the inventory?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}