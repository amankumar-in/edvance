import { useState, useEffect, useRef } from 'react';
import { Text, TextField, Button, Callout, Card, IconButton, Flex } from '@radix-ui/themes';
import MyButton from './MyButton';
import { toast } from 'sonner';
import { useSendOtp, useVerifyPhone } from '../api/auth/auth.mutations';
// import { useSendOtp, useVerifyPhone } from '../api/auth/auth.mutations';
import { ArrowLeft, Info } from 'lucide-react'
import { useUpdateUserProfile } from '../api/user/user.mutations';
import { useForm } from 'react-hook-form';
import { useAuth } from '../Context/AuthContext';

const OTP_TIMER = 45;

export default function VerifyMobileNumber({ onVerified, onResend }) {
  const { user, setUser } = useAuth();
  const { phoneNumber: userPhoneNumber } = user;
  const [otpTimer, setOtpTimer] = useState(0);
  const { mutate: sendOtp, isPending: isSendingOtp, isError, error } = useSendOtp();
  const { mutate: verifyPhone, isPending: isVerifying, isError: isErrorVerifying, error: errorVerifying } = useVerifyPhone();
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [sentOtp, setSentOtp] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, },
    reset
  } = useForm();


  const {
    mutateAsync: updateUserProfile,
    isPending: isUpdatingUserProfile,
  } = useUpdateUserProfile();

  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpTimer]);


  const handleSendOtp = (data) => {
    sendOtp(
      { phoneNumber: data.phoneNumber, purpose: 'verify' },
      {
        onSuccess: () => {
          setOtpTimer(OTP_TIMER);
          toast.success('OTP sent to your phone!');
          setSentOtp(true);
          setIsEditingPhone(false);
        },
        onError: (err) => {
          console.log(err)
        },
      }
    );
  };

  const handleVerify = (data) => {
    verifyPhone(
      { phoneNumber: userPhoneNumber, otp: data.otp },
      {
        onSuccess: () => {
          toast.success('Phone number verified!');
          if (onVerified) onVerified();
        },
        onError: (err) => {
          console.log(err)
        },
      }
    );
  };

  const handleUpdatePhoneNumber = (data) => {
    updateUserProfile({
      phoneNumber: data.phoneNumber,
    }, {
      onSuccess: () => {
        toast.success('Phone number updated!');
        setIsEditingPhone(false);
        setUser({ ...user, phoneNumber: data.phoneNumber });
        reset();
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || err?.message || 'Something went wrong please try again later');
      }
    })
  }

  return (
    <Card className="w-full max-w-lg p-6 mx-auto ">
      <div className="flex flex-col gap-5" /* onSubmit={handleVerify} */>
        <Flex align='center' className='relative'>
          {sentOtp && <IconButton
            variant='ghost'
            color='gray'
            highContrast
            size='2'
            className='absolute left-0'
            onClick={() => {
              setSentOtp(false);
            }}
          >
            <ArrowLeft />
          </IconButton>}
          <Text as="div" size="6" weight="bold" align="center" className='w-full'>
            Verify Your Mobile Number
          </Text>
        </Flex>

        {(isError || isErrorVerifying) && (
          <Callout.Root color="red" className="mb-2">
            <Callout.Icon>
              <Info className='w-4 h-4' />
            </Callout.Icon>
            <Callout.Text>
              {error?.response?.data?.message || error?.message || errorVerifying?.response?.data?.message || errorVerifying?.message || 'Something went wrong please try again later'}
            </Callout.Text>
          </Callout.Root>
        )}

        {!sentOtp ? <form 
        onSubmit={handleSubmit(handleSendOtp)}
        className='space-y-4'>
          <Text as="p" size="2" color='gray' align="center">
            We will send you a 6-digit OTP to your mobile number.
          </Text>
          <Text as="p" size="2" color='gray' align="center">
            Enter mobile number
          </Text>
          <TextField.Root
            size="3"
            type="tel"
            placeholder="Mobile Number"
            className="w-full"
            {...register('phoneNumber', {
              required: 'Phone number is required',
              value: userPhoneNumber,
              pattern: {
                value: /^\+?[1-9]\d{7,14}$/,
                message: 'Invalid phone number'
              },
              minLength: {
                value: 10,
                message: 'Phone number must be 10 digits'
              }
            })}
            autoFocus
            aria-label="New Mobile Number"
          />
          <Button
            type="submit"
            variant="solid"
            size="3"
            className='w-full'
            radius='full'
            disabled={isSendingOtp}
          >
            {isSendingOtp ? 'Sending OTP...' : 'Generate OTP'}
          </Button>
        </form> : (
          isEditingPhone ? (
            <form
              onSubmit={handleSubmit(handleUpdatePhoneNumber)}
              className="flex flex-col gap-1" >
              <Text as="p" align="center" size='2' mb='4' color='gray'>
                Enter your new mobile number
              </Text>
              <div>
                <TextField.Root
                  size="3"
                  type="tel"
                  placeholder="New Mobile Number"
                  className="w-full"
                  {...register('phoneNumber', {
                    value: "9632587456",
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+?[1-9]\d{7,14}$/,
                      message: 'Invalid phone number'
                    },
                    minLength: {
                      value: 10,
                      message: 'Phone number must be 10 digits'
                    }
                  })}
                  autoFocus
                  aria-label="New Mobile Number"
                />
                {errors.phoneNumber && (
                  <Text
                    as="p"
                    size={"1"}
                    color='red'
                    className="flex items-center gap-1 mt-1"
                  >
                    <Info size={14} /> {errors.phoneNumber.message}
                  </Text>
                )}
              </div>
              <Text as="p" size="1" color='gray' mt='1'>
                Enter a valid mobile number. After saving, click "Resend OTP" to receive a new code.
              </Text>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="soft"
                  color="gray"
                  onClick={() => {
                    setIsEditingPhone(false);
                    reset();
                  }}
                  disabled={isUpdatingUserProfile}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="solid"
                  disabled={isUpdatingUserProfile}
                >
                  {isUpdatingUserProfile ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit(handleVerify)} className='space-y-4'>
              <Text as="p" align="center" size='2' className="flex items-center justify-center gap-1 mb-2" color='gray' >
                Enter the 6-digit OTP sent to <Text as="span" weight='medium' highContrast>{userPhoneNumber}</Text>
                <button
                  className='ml-1'
                  type="button"
                  onClick={() => setIsEditingPhone(true)}
                >
                  <Text as="span" color='blue' className='underline'>
                    Change
                  </Text>
                </button>
              </Text>
              <div>
                <TextField.Root
                  size="3"
                  type="number"
                  radius="large"
                  placeholder="Enter OTP"
                  className="w-full"
                  {...register('otp', {
                    required: 'OTP is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Invalid OTP'
                    },
                    minLength: {
                      value: 6,
                      message: 'OTP must be 6 digits'
                    },
                    maxLength: {
                      value: 6,
                      message: 'OTP must be 6 digits'
                    }
                  })}
                  autoFocus
                  aria-label="OTP"
                />
                {errors.otp && (
                  <Text as="p" size="1" color='red' mt='1'
                    className="flex items-center gap-1 "
                  >
                    <Info size={14} /> {errors.otp.message}
                  </Text>
                )}
                <Text as="p" size="1" color='gray' mt='1'>
                  OTP is valid for 5 minutes.
                </Text>
              </div>
              <Button
                type='submit'
                radius='full'
                size='3'
                className='w-full'
                disabled={isVerifying}
                aria-label='Verify Mobile Number'
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
              <div className='flex justify-center'>
                <Button
                  type='button'
                  onClick={handleSendOtp}
                  disabled={otpTimer > 0 || isSendingOtp}
                  variant='ghost' color='gray' size='2' className='mx-auto font-medium w-max'>
                  {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Resend OTP'}
                </Button>
              </div>
              <Text as="p" size="1" align="center" color='gray'>
                Didn&apos;t receive the code? Check your SMS inbox or tap &quot;Resend OTP&quot;.<br />
                Your number will be used for account security and recovery.
              </Text>
            </form>
          )

        )}


      </div>
    </Card >
  );
} 