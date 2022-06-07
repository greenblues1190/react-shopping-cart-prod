import { rest } from 'msw';
import API from 'configs/api';
import * as db from 'mocks/db.json';

const { cart, products } = db;
const userId = '1';

const cartHandlers = [
  rest.get(API.CART, (req, res, ctx) => {
    const items = cart.find((cartItem) => cartItem.userId === userId)?.items;

    if (!items) {
      return res(ctx.status(404), ctx.json(new Error('no such user')));
    }

    const joinedCart = items.map(({ productId, quantity }) => {
      const product = products.find((product) => product.id === productId);

      return { product, quantity };
    });

    return res(ctx.delay(2000), ctx.status(200), ctx.json(joinedCart));
  }),
  rest.post(API.CART, (req, res, ctx) => {
    if (!req.body) {
      return res(ctx.status(400), ctx.json(new Error('body is required')));
    }

    const newCartItem = req.body as { productId: string; quantity: string };
    const items = cart.find((cartItem) => cartItem.userId === userId)?.items;

    if (!items) {
      return res(ctx.status(404), ctx.json(new Error('no such user')));
    }

    const joinedCart = [
      ...items,
      { productId: newCartItem.productId, quantity: newCartItem.quantity },
    ].map(({ productId, quantity }) => {
      const product = products.find((product) => product.id === productId);

      return { product, quantity: Number(quantity) };
    });

    return res(ctx.status(200), ctx.json(joinedCart));
  }),
  rest.patch(API.CART, (req, res, ctx) => {
    if (!req.body) {
      return res(ctx.status(400), ctx.json(new Error('body is required')));
    }

    const newCartItem = req.body as { productId: string; quantity: string };

    const items = cart.find((cartItem) => cartItem.userId === userId)?.items;

    if (!items) {
      return res(ctx.status(404), ctx.json(new Error('no such user')));
    }

    const updatedCart = items.map(({ productId, quantity }) => {
      if (productId === newCartItem.productId) {
        return {
          productId,
          quantity: newCartItem.quantity,
        };
      }

      return { productId, quantity };
    });

    const joinedCart = updatedCart.map(({ productId, quantity }) => {
      const product = products.find((product) => product.id === productId);

      return { product, quantity: Number(quantity) };
    });

    return res(ctx.status(200), ctx.json(joinedCart));
  }),
  rest.delete(API.CART, (req, res, ctx) => {
    const productIdList = req.url.searchParams.getAll('id');

    const items = cart.find((cartItem) => cartItem.userId === userId)?.items;

    if (!items) {
      return res(ctx.status(404), ctx.json(new Error('no such user')));
    }

    const updatedCart = items.filter(({ productId }) => {
      return !productIdList.includes(productId);
    });

    const joinedCart = updatedCart.map(({ productId, quantity }) => {
      const product = products.find((product) => product.id === productId);

      return { product, quantity: Number(quantity) };
    });

    return res(ctx.status(200), ctx.json(joinedCart));
  }),
];

export default cartHandlers;
