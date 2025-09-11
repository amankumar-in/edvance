import { Button, Callout, Dialog, Flex, Text, TextField } from "@radix-ui/themes"
import { useQueryClient } from "@tanstack/react-query"
import { isValidPhoneNumber } from "libphonenumber-js"
import { Phone } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { toast } from "sonner"
import { useSendOtp, useVerifyPhone } from "../../../../api/auth/auth.mutations"
import ErrorCallout from "../../../../components/ErrorCallout"
import { FormFieldErrorMessage } from "../../../../components/FormFieldErrorMessage"

// Phone Verification Dialog
function PhoneVerificationDialog({ isOpen, setIsOpen, phoneNumber, children }) {
  const [step, setStep] = useState('send') // 'send' or 'verify'
  const [otpSent, setOtpSent] = useState(false)
  const queryClient = useQueryClient()

  const sendOtpMutation = useSendOtp()
  const verifyPhoneMutation = useVerifyPhone()

  const { register: registerSend, handleSubmit: handleSubmitSend, formState: { errors: errorsSend }, control, reset } = useForm({
    defaultValues: { phoneNumber: phoneNumber || '' }
  })

  const { register: registerVerify, handleSubmit: handleSubmitVerify, formState: { errors: errorsVerify }, reset: resetVerify } = useForm({
    defaultValues: { otp: '' }
  })

  const onSendOtp = async (data) => {
    try {
      await sendOtpMutation.mutateAsync({
        phoneNumber: data.phoneNumber,
        purpose: 'verify'
      })
      toast.success('OTP sent successfully')
      setOtpSent(true)
      setStep('verify')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send OTP');
    }
  }

  const onVerifyOtp = async (data) => {
    try {
      await verifyPhoneMutation.mutateAsync({
        phoneNumber: phoneNumber,
        otp: data.otp
      });
      toast.success('Phone number verified successfully');
      queryClient.invalidateQueries(['users', 'profile']);
      resetAll();
      setIsOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to verify OTP');
    }
  }

  function resetAll() {
    setStep('send');
    setOtpSent(false);
    reset();
    resetVerify();
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => {
      setIsOpen(o)
      if (!o) {
        resetAll();
      }
    }}>
      {children && (
        <Dialog.Trigger>
          {children}
        </Dialog.Trigger>
      )}
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Verify Phone Number</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {step === 'send'
            ? 'We\'ll send a verification code to your phone number'
            : 'Enter the verification code sent to your phone'
          }
        </Dialog.Description>

        {step === 'send' && (
          <form onSubmit={handleSubmitSend(onSendOtp)}>
            <Flex direction="column" gap="3">
              {sendOtpMutation.isError && (
                <ErrorCallout
                  errorMessage={sendOtpMutation.error?.response?.data?.message || 'Failed to send OTP'}
                />
              )}
              <label>
                <Text as="div" size="2" weight="medium" mb="1">
                  Phone Number *
                </Text>
                <Controller
                  control={control}
                  name="phoneNumber"
                  rules={{
                    required: 'Phone number is required',
                    validate: (value) => {
                      return isValidPhoneNumber(value) || 'Invalid phone number'
                    }
                  }}
                  render={({ field }) => (
                    <PhoneInput
                      placeholder="Enter phone number"
                      value={field.value || ''}
                      onChange={field.onChange}
                      defaultCountry=""
                      className="flex px-4 w-full bg-[--color-surface] ring-1 ring-[--gray-a7] focus-within:ring-[1.5px] focus-within:outline-none focus-within:ring-[--focus-8] rounded-md h-[38px]"
                      numberInputProps={{
                        className: "flex-1 border-0 bg-transparent outline-none placeholder:text-[--gray-a9] placeholder:text-[16px]"
                      }}
                    />
                  )}
                />
                <FormFieldErrorMessage errors={errorsSend} field="phoneNumber" />
              </label>

              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray">Cancel</Button>
                </Dialog.Close>
                <Button
                  type="submit"
                  disabled={sendOtpMutation.isPending}
                >
                  {sendOtpMutation.isPending ? 'Sending...' : 'Send OTP'}
                </Button>
              </Flex>
            </Flex>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleSubmitVerify(onVerifyOtp)}>
            <Flex direction="column" gap="4">
              {/* Error Callout */}
              {verifyPhoneMutation.isError && (
                <ErrorCallout
                  errorMessage={verifyPhoneMutation.error?.response?.data?.message || 'Failed to verify OTP'}
                />
              )}

              {/* Success Callout */}
              <Callout.Root color="blue" size="1" variant='surface'>
                <Callout.Icon>
                  <Phone size={16} />
                </Callout.Icon>
                <Callout.Text>
                  Verification code sent to {phoneNumber}
                </Callout.Text>
              </Callout.Root>


              <label>
                <Text as="div" size="2" weight="medium" mb="1">
                  Verification Code *
                </Text>
                <TextField.Root
                  size={'3'}
                  type='number'
                  {...registerVerify('otp',
                    {
                      required: 'Verification code is required',
                      minLength: { value: 6, message: 'Verification code must be 6 digits' },
                      maxLength: { value: 6, message: 'Verification code must be 6 digits' }
                    })}
                  placeholder="Enter 6-digit code"
                />
                <FormFieldErrorMessage errors={errorsVerify} field="otp" />
              </label>

              <Flex gap="3" mt="4" justify="end">
                <Button
                  type="button"
                  variant="soft"
                  color="gray"
                  onClick={() => setStep('send')}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={verifyPhoneMutation.isPending}
                >
                  {verifyPhoneMutation.isPending ? 'Verifying...' : 'Verify'}
                </Button>
              </Flex>
            </Flex>
          </form>
        )}
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default PhoneVerificationDialog;