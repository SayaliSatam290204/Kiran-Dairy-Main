import Dispatch from '../models/Dispatch.js';
import { generateDispatchNo } from '../utils/generateDispatchNo.js';
import { inventoryService } from '../services/inventoryService.js';
import { dispatchAnalyticsService } from '../services/dispatchAnalyticsService.js';
import { responseHelper } from '../utils/responseHelper.js';

export const dispatchController = {
  create: async (req, res) => {
    try {
      const { shopId, shopIds, items, isBatchDispatch } = req.body;

      // Validate input
      if ((isBatchDispatch ? !shopIds || shopIds.length === 0 : !shopId) || !items || items.length === 0) {
        return responseHelper.error(res, 'Invalid dispatch data', 400);
      }

      const dispatchNo = await generateDispatchNo();
      
      // Handle batch dispatch (multiple shops in one dispatch) or single shop dispatch
      const dispatchData = {
        dispatchNo,
        items,
        status: 'created',
        dispatchDate: new Date(),
        isBatchDispatch: isBatchDispatch || false
      };

      if (isBatchDispatch) {
        dispatchData.shopIds = shopIds;
        // Use first shop as primary reference
        dispatchData.shopId = shopIds[0];
      } else {
        dispatchData.shopId = shopId;
      }

      const dispatch = new Dispatch(dispatchData);
      await dispatch.save();

      // ✅ DO NOT update inventory here - wait until shop confirms
      // Inventory will be updated when dispatch status changes to 'received'

      await dispatch.populate('shopId', 'name location');
      if (isBatchDispatch) {
        await dispatch.populate('shopIds', 'name location');
      }
      await dispatch.populate('items.productId', 'name sku');

      responseHelper.success(res, dispatch, 'Dispatch created successfully', 201);
    } catch (error) {
      console.error('Error creating dispatch:', error);
      responseHelper.error(res, 'Failed to create dispatch', 500);
    }
  },

  getAll: async (req, res) => {
    try {
      const dispatches = await Dispatch.find()
        .populate('shopId', 'name location')
        .populate('shopIds', 'name location')
        .populate('items.productId', 'name sku')
        .populate('confirmedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(100);
      
      responseHelper.success(res, dispatches, 'Dispatches fetched successfully');
    } catch (error) {
      console.error('Error fetching dispatches:', error);
      responseHelper.error(res, 'Failed to fetch dispatches', 500);
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const dispatch = await Dispatch.findById(id)
        .populate('shopId', 'name location contactNo email')
        .populate('shopIds', 'name location contactNo email')
        .populate('items.productId', 'name sku')
        .populate('confirmedBy', 'name');

      if (!dispatch) {
        return responseHelper.error(res, 'Dispatch not found', 404);
      }

      responseHelper.success(res, dispatch, 'Dispatch fetched successfully');
    } catch (error) {
      console.error('Error fetching dispatch:', error);
      responseHelper.error(res, 'Failed to fetch dispatch', 500);
    }
  },

  getByShop: async (req, res) => {
    try {
      const { shopId } = req.params;

      const dispatches = await Dispatch.find({
        $or: [
          { shopId: shopId },
          { shopIds: shopId }
        ]
      })
        .populate('shopId', 'name location')
        .populate('shopIds', 'name location')
        .populate('items.productId', 'name sku')
        .sort({ createdAt: -1 })
        .limit(100);

      responseHelper.success(res, dispatches, 'Shop dispatches fetched successfully');
    } catch (error) {
      console.error('Error fetching shop dispatches:', error);
      responseHelper.error(res, 'Failed to fetch shop dispatches', 500);
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, receivedNotes, confirmedBy } = req.body;

      // Validate status
      const validStatuses = ['created', 'dispatched', 'received', 'pending'];
      if (!validStatuses.includes(status)) {
        return responseHelper.error(res, 'Invalid dispatch status', 400);
      }

      const dispatch = await Dispatch.findById(id);
      if (!dispatch) {
        return responseHelper.error(res, 'Dispatch not found', 404);
      }

      const oldStatus = dispatch.status;
      dispatch.status = status;

      // If marking as dispatched, set dispatchedDate
      if (status === 'dispatched' && !dispatch.dispatchedDate) {
        dispatch.dispatchedDate = new Date();
      }

      // If marking as received, set receivedDate and calculate delivery time
      if (status === 'received' && !dispatch.receivedDate) {
        dispatch.receivedDate = new Date();
        
        // Calculate delivery time in hours if we have dispatchedDate
        if (dispatch.dispatchedDate) {
          const timeDiff = dispatch.receivedDate - dispatch.dispatchedDate;
          dispatch.deliveryTime = Math.round(timeDiff / (1000 * 60 * 60)); // Convert to hours
        }

        if (receivedNotes) {
          dispatch.receivedNotes = receivedNotes;
        }

        if (confirmedBy || req.user?.id) {
          dispatch.confirmedBy = confirmedBy || req.user.id;
        }

        // ✅ Update inventory ONLY when shop confirms receipt
        const shopsToProcess = dispatch.isBatchDispatch ? dispatch.shopIds : [dispatch.shopId];
        for (const currentShopId of shopsToProcess) {
          for (const item of dispatch.items) {
            await inventoryService.updateInventory(
              currentShopId,
              item.productId,
              item.quantity,
              'received',
              dispatch._id.toString()
            );
          }
        }
      }

      await dispatch.save();

      // Populate for response
      await dispatch.populate('shopId', 'name location');
      await dispatch.populate('shopIds', 'name location');
      await dispatch.populate('items.productId', 'name sku');
      await dispatch.populate('confirmedBy', 'name');

      responseHelper.success(res, dispatch, `Dispatch status updated from ${oldStatus} to ${status}`, 200);
    } catch (error) {
      console.error('Error updating dispatch status:', error);
      responseHelper.error(res, 'Failed to update dispatch status', 500);
    }
  },

  getAnalytics: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const analytics = await dispatchAnalyticsService.getComprehensiveAnalytics(
        startDate,
        endDate
      );

      responseHelper.success(res, analytics, 'Analytics fetched successfully');
    } catch (error) {
      console.error('Error fetching dispatch analytics:', error);
      responseHelper.error(res, 'Failed to fetch dispatch analytics', 500);
    }
  }
};
