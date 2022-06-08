import { rest, RestRequest } from 'msw';
import { SERVER_URL } from 'configs/api';
import {
  Customer,
  SigninRequestBody,
  SignupRequestBody,
  User,
} from '../../types';
import * as db from 'mocks/db.json';

const TOKEN_PREFIX = 'lokbawoody';
const generateToken = (id: number) => `${TOKEN_PREFIX}${id}`;
const extractIdFromToken = (token: string) =>
  Number(token.replace(TOKEN_PREFIX, ''));

const extractIdFromHeader = <T>(
  req: RestRequest<T>
): {
  id?: number;
  isValidToken: boolean;
} => {
  const authorization = req.headers.get('Authorization');
  const accessToken = authorization?.trim().replace('Bearer', '');

  if (!accessToken) {
    return {
      isValidToken: false,
    };
  }

  return {
    id: extractIdFromToken(accessToken),
    isValidToken: true,
  };
};

let customers: User[] = [...(db.customers as User[])];

const customerHandlers = [
  // 이메일 중복 검사
  rest.get(`${SERVER_URL}/api/validation`, (req, res, ctx) => {
    const email = req.url.searchParams.get('email');

    if (!email)
      return res(
        ctx.status(400),
        ctx.json({ message: '유효하지 않은 이메일입니다.' })
      );

    const emailList = customers.map(({ email }) => email);

    if (emailList.includes(email)) {
      return res(
        ctx.status(400),
        ctx.json({ message: '유효하지 않은 이메일입니다.' })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        isDuplicated: false,
      })
    );
  }),
  //회원가입
  rest.post<SignupRequestBody>(
    `${SERVER_URL}/api/customers`,
    (req, res, ctx) => {
      const customerData = req.body;
      const userId = customers.length;
      const validCustomer: User = {
        userId,
        accessToken: null,
        ...customerData,
      };

      customers.push(validCustomer);
      return res(ctx.status(201));
    }
  ),
  // 로그인
  rest.post<SigninRequestBody>(
    `${SERVER_URL}/api/customer/authentication/sign-in`,
    (req, res, ctx) => {
      const { email, password } = req.body;
      const customer = customers.find((customer) => customer.email === email);

      if (!customer)
        return res(
          ctx.status(401),
          ctx.json({ message: '유효하지 않은 이메일입니다.' })
        );

      const isValidPassword = customer.password === password;

      if (!isValidPassword)
        return res(
          ctx.status(401),
          ctx.json({ message: '유효하지 않은 비밀번호입니다.' })
        );

      const accessToken = generateToken(customer.userId);
      customer.accessToken = accessToken;

      return res(
        ctx.status(200),
        ctx.json({
          accessToken,
          userId: customer.userId,
        })
      );
    }
  ),
  // 사용자 로그아웃
  rest.post<Pick<User, 'accessToken'>>(
    `${SERVER_URL}/api/customer/authentication/sign-out`,
    (req, res, ctx) => {
      const { id: userId, isValidToken } = extractIdFromHeader(req);

      if (!isValidToken) {
        return res(
          ctx.status(401),
          ctx.json({ message: '유효하지 않은 토큰입니다.' })
        );
      }

      const customer = customers.find((customer) => customer.userId === userId);

      if (!customer) {
        return res(
          ctx.status(401),
          ctx.json({ message: '유효하지 않은 토큰입니다.' })
        );
      }

      customer.accessToken = null;
      return res(ctx.status(204));
    }
  ),
  // 사용자 정보 조회
  rest.get(`${SERVER_URL}/api/customers/:customerId`, (req, res, ctx) => {
    const { customerId } = req.params;
    const customer = customers.find(
      ({ userId }) => userId === Number(customerId)
    );

    if (!customer) {
      return res(
        ctx.status(401),
        ctx.json({ message: '유효하지 않은 토큰입니다.' })
      );
    }

    const { password, ...restCustomerProperties } = customer;

    return res(ctx.status(200), ctx.json(restCustomerProperties));
  }),
  //사용자 정보 수정
  rest.put<Customer>(
    `${SERVER_URL}/api/customers/:customerId`,
    (req, res, ctx) => {
      const { customerId } = req.params;

      const customer = customers.find(
        ({ userId }) => userId === Number(customerId)
      );

      if (!customer) {
        return res(
          ctx.status(401),
          ctx.json({ message: '유효하지 않은 토큰입니다.' })
        );
      }

      return res(ctx.status(204));
    }
  ),
  //회원 탈퇴
  rest.delete(`${SERVER_URL}/api/customers/:customerId`, (req, res, ctx) => {
    const { id: userId, isValidToken } = extractIdFromHeader(req);

    if (!isValidToken) {
      return res(
        ctx.status(401),
        ctx.json({ message: '유효하지 않은 토큰입니다.' })
      );
    }

    const index = customers.findIndex((customer) => customer.userId === userId);

    if (index === -1) {
      return res(
        ctx.status(401),
        ctx.json({ message: '유효하지 않은 토큰입니다.' })
      );
    }

    customers.splice(index, 1);

    return res(ctx.status(204));
  }),
];

export default customerHandlers;
