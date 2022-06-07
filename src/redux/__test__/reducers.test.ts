import rootReducer from 'redux/reducers';
import { TYPES } from 'redux/actions';
import { products } from 'mocks/db.json';

const initialState = {
  productsState: {
    isLoading: false,
    error: null,
    productList: [],
  },
  productDetailState: {
    isLoading: false,
    error: null,
    productDetail: null,
  },
  cartState: {
    isLoading: false,
    error: null,
    cart: [],
  },
};

describe('전체 상품 목록을 불러올 수 있다.', () => {
  const expectedActions = {
    pending: {
      type: `${TYPES.GET_PRODUCT_LIST}_PENDING`,
      payload: null,
    },
    fulfilled: {
      type: `${TYPES.GET_PRODUCT_LIST}_FULFILLED`,
      payload: products,
    },
    rejected: {
      type: `${TYPES.GET_PRODUCT_LIST}_REJECTED`,
      payload: 'some error object',
    },
  } as const;

  test('요청 시 isLoading을 true로, error를 null로 변경한다.', () => {
    const actual = rootReducer(initialState, expectedActions.pending);

    expect(actual).toEqual({
      ...initialState,
      isLoading: true,
      error: null,
    });
  });

  test('성공 시 isLoading을 false로, productList를 응답 데이터로 변경한다.', () => {
    const actual = rootReducer(initialState, expectedActions.fulfilled);

    expect(actual).toEqual({
      ...initialState,
      isLoading: false,
      productList: expectedActions.fulfilled.payload,
    });
  });

  test('실패 시 isLoading을 false로, error를 응답 데이터로 변경한다.', () => {
    const actual = rootReducer(initialState, expectedActions.rejected);

    expect(actual).toEqual({
      ...initialState,
      isLoading: false,
      error: expectedActions.rejected.payload,
    });
  });
});
