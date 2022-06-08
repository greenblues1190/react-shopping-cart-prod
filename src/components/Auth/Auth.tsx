import { PATHS } from 'constants/paths';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { StoreState } from 'types';

type SelectedState = StoreState['customerState']['accessToken'];
type Props = React.PropsWithChildren<{ option?: boolean }>;

function Auth({ option, children }: Props) {
  const navigate = useNavigate();
  const accessToken = useSelector<StoreState, SelectedState>(
    ({ customerState }) => customerState.accessToken
  );

  useEffect(() => {
    if (option === undefined) {
      return;
    }

    if (accessToken && !option) {
      // 로그인한 유저가 비로그인만 접근 가능한 페이지를 접속할 때
      navigate(PATHS.INDEX);
    }

    if (!accessToken && option) {
      // 로그인하지 않은 유저가 로그인 유저만 접근 가능한 페이지를 접속할 때
      navigate(PATHS.SIGNIN);
    }
  }, [navigate, accessToken, option]);

  return <>{children}</>;
}

export default Auth;