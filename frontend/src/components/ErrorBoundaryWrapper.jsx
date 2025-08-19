import { Outlet, useNavigate } from 'react-router';
import ErrorBoundary from './ErrorBoundary';

const ErrorBoundaryWrapper = () => {
  const navigate = useNavigate();
  return (
    <ErrorBoundary navigate={navigate}>
      <Outlet />
    </ErrorBoundary>
  );
};

export default ErrorBoundaryWrapper;
