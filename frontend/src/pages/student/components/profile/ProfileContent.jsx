import { Avatar, Badge, Box, Button, Card, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import { AlertCircle, Calendar, CheckCircle, Edit, Phone, X } from "lucide-react";
import { useState } from "react";
import { useUserProfile } from "../../../../api/user/user.queries";
import ErrorCallout from "../../../../components/ErrorCallout";
import Loader from "../../../../components/Loader";
import { formatDate } from "../../../../utils/helperFunctions";
import AvatarUploadDialog from "./AvatarUploadDialog";
import ChangePasswordDialog from "./ChangePasswordDialog";
import EditProfileDialog from "./EditProfileDialog";
import PhoneVerificationDialog from "./PhoneVerificationDialog";

// Profile Content Component
export default function ProfileContent() {
  const { data: profileData, isLoading, error, isFetching } = useUserProfile()

  if (isFetching) {
    return (
      <Flex justify="center" align="center">
        <Loader />
      </Flex>
    )
  }

  if (error) return <ErrorCallout errorMessage={error?.message} />;

  const user = profileData?.data?.user

  return (
    <Box className='space-y-6'>

      <Flex gap="4" wrap="wrap">
        <EditProfileDialog user={user} />
        <ChangePasswordDialog />
      </Flex>
      {/* Profile Overview Card */}
      <Card size="3" className="space-y-6 shadow-md">
        <Flex align="start" gap="6" wrap="wrap">
          <AvatarSection user={user} />
          <Box style={{ flex: 1 }}>
            <Box>
              <Heading size="4" weight="bold" mb="1" className='capitalize'>
                {user?.firstName} {user?.lastName}
              </Heading>
              <Text as='p' size={'2'} mb="3">{user?.email}</Text>
              <Flex gap="2" wrap="wrap">
                <Badge
                  variant="soft"
                  className="capitalize"
                >
                  Student
                </Badge>
              </Flex>
            </Box>

            <Separator size="4" my="4" />

            <Flex gap="4" wrap="wrap" >
              <Box className='flex-1 text-nowrap'>
                <Text as='p' size="1" weight="medium" color="gray" mb="1">Phone Number</Text>
                <Flex align="center" gap="2" >
                  <Phone size={16} className="shrink-0"/>
                  <Text as='p' size="2">{user?.phoneNumber || 'Not provided'}</Text>
                  {user?.phoneNumber && (
                    <PhoneVerificationBadge
                      isVerified={user?.isPhoneVerified}
                      phoneNumber={user?.phoneNumber}
                    />
                  )}
                </Flex>
              </Box>
              <Box className='flex-1 text-nowrap'>
                <Text as='p' size="1" weight="medium" color="gray" mb="1">Date of Birth</Text>
                <Flex align="center" gap="2">
                  <Calendar size={16} />
                  <Text as='p' size="2">
                    {user?.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'}
                  </Text>
                </Flex>
              </Box>
            </Flex>
          </Box>
        </Flex>
        {/* Account Status */}
        <Card size={{ initial: '2', sm: '3' }} className='space-y-4'>
          <Text as='p' weight={'bold'}>
            Account Status
          </Text>
          <Flex gap="4" direction={'column'} >
            <Flex gap="4" wrap="wrap">
              <Box className='flex-1 whitespace-nowrap'>
                <Text as='p' size="1" weight="medium" color="gray" mb="1">Email Status</Text>
                <Flex align="center" gap="2">
                  <Badge color={user?.isVerified ? 'green' : 'orange'} variant="soft">
                    {user?.isVerified ? <><CheckCircle size={14} />Verified</> : <><AlertCircle size={14} />Unverified</>}
                  </Badge>
                </Flex>
              </Box>
              <Box className='flex-1 whitespace-nowrap'>
                <Text as='p' size="1" weight="medium" color="gray" mb="1">Account Status</Text>
                <Flex align="center" gap="2">
                  <Badge
                    color={user?.isActive ? 'green' : 'red'}
                    variant="soft"
                  >
                    {user?.isActive ? <><CheckCircle size={14} />Active</> : <><X size={14} />Inactive</>}
                  </Badge>
                </Flex>
              </Box>
            </Flex>
            <Flex gap="4" wrap="wrap">
              <Box className='flex-1 whitespace-nowrap'>
                <Text as='p' size="1" weight="medium" color="gray" mb="1">Member Since</Text>
                <Text as='p' size="2">
                  {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                </Text>
              </Box>
              <Box className='flex-1 whitespace-nowrap'>
                <Text as='p' size="1" weight="medium" color="gray" mb="1">Last Updated</Text>
                <Text as='p' size="2">
                  {user?.updatedAt ? formatDate(user.updatedAt) : 'Unknown'}
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Card>
      </Card>
    </Box>
  )
}

// Avatar Section Component
function AvatarSection({ user }) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  return (
    <>
      <AvatarUploadDialog
        isOpen={isUploadDialogOpen}
        setIsOpen={setIsUploadDialogOpen}
      >
        <Button variant='ghost' color='gray' className="relative" onClick={() => setIsUploadDialogOpen(true)}>
          <Avatar
            size="9"
            src={user?.avatar}
            fallback={user?.firstName?.[0] || 'S'}
            radius="full"
            color='cyan'
            highContrast
          />
          <Badge size="2" className="absolute bottom-2 left-2" variant="solid" highContrast color="gray"><Edit size={'14'} /> Edit</Badge>

        </Button>
      </AvatarUploadDialog>
    </>
  )
}

// Phone Verification Badge Component
function PhoneVerificationBadge({ isVerified, phoneNumber }) {
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false)

  if (isVerified) {
    return (
      <Badge color="green" variant="soft" size="1">
        <CheckCircle size={14} />
        Verified
      </Badge>
    )
  }

  return (
    <Flex align={'center'} gap={'2'} wrap={'wrap'}>
      <Badge color="orange" variant="soft" size="2">
        <AlertCircle size={14} />
        Unverified
      </Badge>
      <PhoneVerificationDialog
        isOpen={isVerifyDialogOpen}
        setIsOpen={setIsVerifyDialogOpen}
        phoneNumber={phoneNumber}
      >
        <Button size="1" onClick={() => setIsVerifyDialogOpen(true)}>
          Verify
        </Button>
      </PhoneVerificationDialog>
    </Flex>
  )
}
