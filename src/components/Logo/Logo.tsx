import ICONS from 'constants/icons';
import * as S from 'components/Logo/Logo.styled';

function Logo() {
  return (
    <S.LogoBox>
      {ICONS.LOGO}
      <h1>WOOWA SHOP</h1>
    </S.LogoBox>
  );
}

export default Logo;
