import Product from "../models/productModel.js";
import Vendor from "../models/VendorModel.js";

// Test endpoint to verify API is working
export const testVendorAPI = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vendor API is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      createVendor: 'POST /api/vendors',
      getVendors: 'GET /api/vendors',
      getVendor: 'GET /api/vendors/:id',
      updateVendor: 'PUT /api/vendors/:id',
      deleteVendor: 'DELETE /api/vendors/:id',
      createPurchase: 'POST /api/vendors/:vendorId/purchases',
      getPurchases: 'GET /api/vendors/:vendorId/purchases',
      updatePurchase: 'PUT /api/vendors/:vendorId/purchases/:purchaseId',
      deletePurchase: 'DELETE /api/vendors/:vendorId/purchases/:purchaseId'
    }
  });
};

// Create new vendor
export const createVendor = async (req, res) => {
  try {
    console.log('📝 Creating vendor with data:', req.body);
    
    const { name, phoneNumber, location } = req.body;
    
    // Validate required fields
    if (!name || !phoneNumber || !location) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone number, and location are required'
      });
    }
    
    const vendor = await Vendor.create({
      name,
      phoneNumber,
      location
    });
    
    console.log('✅ Vendor created:', vendor);
    
    res.status(201).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('❌ Error creating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating vendor',
      error: error.message
    });
  }
};

// Get all vendors
export const getVendors = async (req, res) => {
  try {
    console.log('📋 Fetching all vendors');
    
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    
    console.log(`✅ Found ${vendors.length} vendors`);
    
    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors
    });
  } catch (error) {
    console.error('❌ Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors',
      error: error.message
    });
  }
};

// Get single vendor
export const getVendor = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`👤 Fetching vendor with ID: ${id}`);
    
    const vendor = await Vendor.findById(id);
    
    if (!vendor) {
      console.log(`❌ Vendor ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    console.log('✅ Vendor found:', vendor.name);
    
    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('❌ Error fetching vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor',
      error: error.message
    });
  }
};

// Update vendor
export const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, location } = req.body;
    
    console.log(`✏️ Updating vendor ${id} with data:`, req.body);
    
    // Validate required fields
    if (!name || !phoneNumber || !location) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone number, and location are required'
      });
    }
    
    const vendor = await Vendor.findByIdAndUpdate(
      id,
      { 
        name, 
        phoneNumber, 
        location,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!vendor) {
      console.log(`❌ Vendor ${id} not found for update`);
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    console.log('✅ Vendor updated:', vendor);
    
    res.status(200).json({
      success: true,
      data: vendor,
      message: 'Vendor updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vendor',
      error: error.message
    });
  }
};

// Delete vendor
export const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting vendor ${id}`);
    
    const vendor = await Vendor.findByIdAndDelete(id);
    
    if (!vendor) {
      console.log(`❌ Vendor ${id} not found for deletion`);
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    console.log('✅ Vendor deleted:', vendor.name);
    
    res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully',
      data: vendor
    });
  } catch (error) {
    console.error('❌ Error deleting vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vendor',
      error: error.message
    });
  }
};

// Create purchase for vendor
export const createPurchase = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const {
      products,
      amountDue,
      amountPaid,
      paymentMethod = 'cash',
      notes = ''
    } = req.body;
    
    console.log(`🛒 Creating purchase for vendor ${vendorId}`);
    console.log('Purchase data:', { products, amountDue, amountPaid, paymentMethod, notes });
    
    // Find vendor
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      console.log(`❌ Vendor ${vendorId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    // Validate required fields
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required and must not be empty'
      });
    }
    
    if (amountDue === undefined || amountPaid === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Amount due and amount paid are required'
      });
    }
    
    // Process products and calculate totals
    const processedProducts = [];
    let totalPurchaseAmount = 0;
    
    for (const item of products) {
      // Validate item
      if (!item.quantity || !item.unitPrice || !item.productName) {
        return res.status(400).json({
          success: false,
          message: 'Each product must have quantity, unitPrice, and productName'
        });
      }
      
      let product = null;
      
      // If productId exists, find and update the product
      if (item.productId) {
        product = await Product.findById(item.productId);
        if (product) {
          // Update product quantity
          product.stock = (product.stock || 0) + item.quantity;
          await product.save();
          console.log(`📦 Updated product ${product.name} stock to ${product.stock}`);
        }
      }
      
      // If product doesn't exist, create it
      if (!product && item.productName) {
        product = await Product.create({
          name: item.productName,
          price: item.unitPrice,
          cost: item.unitPrice, // Assuming cost = unitPrice for now
          stock: item.quantity,
          vendor: vendorId
        });
        console.log(`🆕 Created new product: ${product.name}`);
      }
      
      const itemTotal = item.quantity * item.unitPrice;
      totalPurchaseAmount += itemTotal;
      
      processedProducts.push({
        productId: product?._id || null,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: itemTotal
      });
    }
    
    // Create purchase
    const purchase = {
      products: processedProducts,
      amountDue,
      amountPaid,
      paymentMethod,
      notes,
      purchaseDate: new Date()
    };
    
    // Add purchase to vendor
    vendor.purchases.push(purchase);
    vendor.totalPurchases = (vendor.totalPurchases || 0) + 1;
    vendor.totalAmount = (vendor.totalAmount || 0) + totalPurchaseAmount;
    vendor.balance = (vendor.balance || 0) + (amountDue - amountPaid);
    vendor.updatedAt = new Date();
    
    await vendor.save();
    
    console.log(`✅ Purchase added to vendor ${vendor.name}`);
    console.log(`   Total purchases: ${vendor.totalPurchases}`);
    console.log(`   Total amount: $${vendor.totalAmount}`);
    console.log(`   Balance: $${vendor.balance}`);
    
    // Get the last purchase (the one we just added)
    const lastPurchase = vendor.purchases[vendor.purchases.length - 1];
    
    res.status(201).json({
      success: true,
      data: {
        vendor,
        purchase: lastPurchase
      },
      message: 'Purchase created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error creating purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating purchase',
      error: error.message
    });
  }
};

// Get vendor purchases
export const getVendorPurchases = async (req, res) => {
  try {
    const { vendorId } = req.params;
    console.log(`📜 Fetching purchases for vendor ${vendorId}`);
    
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    console.log(`✅ Found ${vendor.purchases?.length || 0} purchases`);
    
    res.status(200).json({
      success: true,
      count: vendor.purchases?.length || 0,
      data: vendor.purchases || []
    });
  } catch (error) {
    console.error('❌ Error fetching purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchases',
      error: error.message
    });
  }
};

// Update purchase
export const updatePurchase = async (req, res) => {
  try {
    const { vendorId, purchaseId } = req.params;
    const { 
      products, 
      amountDue, 
      amountPaid, 
      paymentMethod, 
      notes,
      updateStock = true 
    } = req.body;
    
    console.log(`✏️ Updating purchase ${purchaseId} for vendor ${vendorId}`);
    console.log('Update data:', req.body);
    
    // Find vendor
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    // Find purchase index
    const purchaseIndex = vendor.purchases.findIndex(
      p => p._id.toString() === purchaseId
    );
    
    if (purchaseIndex === -1) {
      console.log(`❌ Purchase ${purchaseId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }
    
    const oldPurchase = vendor.purchases[purchaseIndex];
    const oldTotal = oldPurchase.products?.reduce((sum, p) => sum + (p.total || 0), 0) || 0;
    const oldBalanceChange = (oldPurchase.amountDue || 0) - (oldPurchase.amountPaid || 0);
    
    // Revert old purchase effects if updating products
    if (products && updateStock) {
      for (const item of oldPurchase.products || []) {
        if (item.productId) {
          const product = await Product.findById(item.productId);
          if (product) {
            product.stock = Math.max(0, (product.stock || 0) - (item.quantity || 0));
            await product.save();
            console.log(`↩️ Reverted product ${product.name} stock to ${product.stock}`);
          }
        }
      }
    }
    
    // Process new products
    let processedProducts = oldPurchase.products || [];
    let newTotal = oldTotal;
    
    if (products) {
      processedProducts = [];
      newTotal = 0;
      
      for (const item of products) {
        // Validate item
        if (!item.quantity || !item.unitPrice || !item.productName) {
          return res.status(400).json({
            success: false,
            message: 'Each product must have quantity, unitPrice, and productName'
          });
        }
        
        let product = null;
        
        // If productId exists, find and update the product
        if (item.productId) {
          product = await Product.findById(item.productId);
          if (product && updateStock) {
            // Update product quantity
            product.stock = (product.stock || 0) + item.quantity;
            await product.save();
            console.log(`📦 Updated product ${product.name} stock to ${product.stock}`);
          }
        }
        
        // If product doesn't exist and updateStock is true, create it
        if (!product && item.productName && updateStock) {
          product = await Product.create({
            name: item.productName,
            price: item.unitPrice,
            cost: item.unitPrice,
            stock: item.quantity,
            vendor: vendorId
          });
          console.log(`🆕 Created new product: ${product.name}`);
        }
        
        const itemTotal = item.quantity * item.unitPrice;
        newTotal += itemTotal;
        
        processedProducts.push({
          productId: product?._id || item.productId || null,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: itemTotal
        });
      }
    }
    
    // Calculate new amounts
    const finalAmountDue = amountDue !== undefined ? amountDue : oldPurchase.amountDue;
    const finalAmountPaid = amountPaid !== undefined ? amountPaid : oldPurchase.amountPaid;
    const finalPaymentMethod = paymentMethod || oldPurchase.paymentMethod;
    const finalNotes = notes !== undefined ? notes : oldPurchase.notes;
    
    const newBalanceChange = finalAmountDue - finalAmountPaid;
    
    // Update vendor totals
    vendor.totalAmount = (vendor.totalAmount || 0) - oldTotal + newTotal;
    vendor.balance = (vendor.balance || 0) - oldBalanceChange + newBalanceChange;
    
    // Update the purchase
    vendor.purchases[purchaseIndex] = {
      ...oldPurchase,
      products: processedProducts,
      amountDue: finalAmountDue,
      amountPaid: finalAmountPaid,
      paymentMethod: finalPaymentMethod,
      notes: finalNotes,
      updatedAt: new Date()
    };
    
    vendor.updatedAt = new Date();
    await vendor.save();
    
    console.log(`✅ Purchase updated for vendor ${vendor.name}`);
    console.log(`   New total amount: $${vendor.totalAmount}`);
    console.log(`   New balance: $${vendor.balance}`);
    
    res.status(200).json({
      success: true,
      data: {
        vendor,
        purchase: vendor.purchases[purchaseIndex]
      },
      message: 'Purchase updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error updating purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating purchase',
      error: error.message
    });
  }
};

// Delete purchase
export const deletePurchase = async (req, res) => {
  try {
    const { vendorId, purchaseId } = req.params;
    console.log(`🗑️ Deleting purchase ${purchaseId} for vendor ${vendorId}`);
    
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    // Find purchase index
    const purchaseIndex = vendor.purchases.findIndex(
      p => p._id.toString() === purchaseId
    );
    
    if (purchaseIndex === -1) {
      console.log(`❌ Purchase ${purchaseId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }
    
    const purchase = vendor.purchases[purchaseIndex];
    const purchaseTotal = purchase.products?.reduce((sum, p) => sum + (p.total || 0), 0) || 0;
    const balanceChange = (purchase.amountDue || 0) - (purchase.amountPaid || 0);
    
    // Revert stock changes
    for (const item of purchase.products || []) {
      if (item.productId) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock = Math.max(0, (product.stock || 0) - (item.quantity || 0));
          await product.save();
          console.log(`↩️ Reverted product ${product.name} stock to ${product.stock}`);
        }
      }
    }
    
    // Update vendor totals
    vendor.totalPurchases = Math.max(0, (vendor.totalPurchases || 1) - 1);
    vendor.totalAmount = Math.max(0, (vendor.totalAmount || 0) - purchaseTotal);
    vendor.balance = (vendor.balance || 0) - balanceChange;
    
    // Remove purchase
    vendor.purchases.splice(purchaseIndex, 1);
    vendor.updatedAt = new Date();
    await vendor.save();
    
    console.log(`✅ Purchase deleted from vendor ${vendor.name}`);
    console.log(`   Remaining purchases: ${vendor.totalPurchases}`);
    console.log(`   Updated total amount: $${vendor.totalAmount}`);
    console.log(`   Updated balance: $${vendor.balance}`);
    
    res.status(200).json({
      success: true,
      message: 'Purchase deleted successfully',
      data: {
        vendor,
        deletedPurchase: purchase
      }
    });
    
  } catch (error) {
    console.error('❌ Error deleting purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting purchase',
      error: error.message
    });
  }
};