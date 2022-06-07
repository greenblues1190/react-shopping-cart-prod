import customerHandlers from 'mocks/handlers/customers';
import FillInfoStep from 'pages/SignupPage/Steps/FillInfoStep/FillInfoStep';

export default {
  title: 'Signup Step/FillInfoStep',
  component: FillInfoStep,
};

function Template(args) {
  return <FillInfoStep {...args} />;
}

export const Default = Template.bind({});
Default.parameters = {
  msw: {
    handlers: {
      customers: customerHandlers,
    },
  },
};
