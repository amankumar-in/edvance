import { useEffect, useRef } from 'react';
import { useNavigation } from 'react-router';
import LoadingBar from 'react-top-loading-bar';

export default function TopLoadingBar() {
  const { state } = useNavigation();
  const ref = useRef(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (state === 'loading' || state === 'submitting') {
      hasStartedRef.current = true;
      ref.current?.start();
    } else if (state === 'idle' && hasStartedRef.current) {
      ref.current?.complete();
      hasStartedRef.current = false;
    }
  }, [state]);

  return (
    <LoadingBar
      color="#06b6d4"
      ref={ref}
      height={3}
      className="z-50"
      waitingTime={300}
      shadow={false}
    />
  );
}