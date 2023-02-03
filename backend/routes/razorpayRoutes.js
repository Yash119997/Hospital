import express from 'express';
const router = express.Router();
import Razorpay from 'razorpay';
import request from 'request';
import keys from '../keys.js';
import User from '../models/userModel.js';

const razorInstance = new Razorpay({
  key_id: keys.razorIdkey,
  key_secret: keys.razorIdSecret,
});
router.get('/order', (req, res) => {
  try {
    const options = {
      amount: 1499 * 100,
      currency: 'INR',
      receipt: 'receipt#1',
      payment_capture: 0, //1
    };
    razorInstance.orders.create(options, async function (err, order) {
      if (err) {
        return res.status(500).json({
          message: 'Something error!s',
        });
      }
      return res.status(200).json(order);
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Something error!s',
    });
  }
});

router.post('/capture/:Id', (req, res) => {
  try {
    return request(
      {
        method: 'POST',
        url: `https://${keys.razorIdkey}:${keys.razorIdSecret}@api.razorpay.com/v1/payments/${req.params.Id}/capture`,
        form: {
          amount: 1499 * 100,
          currency: 'INR',
        },
      },
      async function (err, response, body) {
        if (err) {
          return res.status(500).json({
            message: 'Something error!s',
          });
        }
        return res.status(200).json(body);
      }
    );
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

router.get('/member/:Id', async (req, res) => {
  const user = await User.findById(req.params.Id);
  console.log('member');
  console.log(user);
  if (user) {
    user.isMember = 'true';
    await user.save();
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export default router;
