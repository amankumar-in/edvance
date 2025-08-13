import { Avatar, Box, Button, Callout, Card, Flex, Select, Separator, Spinner, Tabs, Text, TextField } from '@radix-ui/themes'
import { AlertCircle, CheckCircle, Copy, Info, Link2, Link2Off, RefreshCw, Users } from 'lucide-react'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  useAddChild,
  useCancelOutgoingRequest,
  useCreateChildAccount,
  useGenerateLinkCode,
  useRespondToLinkRequest,
  useUnlinkChild
} from '../../../api/parent/parent.mutations'
import {
  useChildren,
  useOutgoingLinkRequests,
  useParentProfile,
  usePendingLinkRequests
} from '../../../api/parent/parent.queries'
import { ConfirmationDialog, EmptyStateCard, ErrorCallout, FormFieldErrorMessage, Loader, PageHeader } from '../../../components'
import { gradeOptions } from '../../../utils/constants'

function LinkedAccounts() {
  const [linkCodeCopied, setLinkCodeCopied] = useState(false);
  const [childEmail, setChildEmail] = useState('');

  // Confirmation dialog states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const [selectedChildId, setSelectedChildId] = useState(null)
  const [selectedChildName, setSelectedChildName] = useState('')

  // Get parent profile
  const { data: parentData, isLoading, isError, error } = useParentProfile()
  const parent = parentData?.data
  const { childIds, linkCode } = parent || {}

  // Get children
  const { data: childrenData, isLoading: isChildrenLoading, isError: isChildrenError, error: childrenError } = useChildren()
  const children = childrenData?.data || []

  // Get incoming link requests (from students)
  const { data: linkRequestsData, isLoading: isLoadingLinkRequests, isError: isLinkRequestsError, error: linkRequestsError } = usePendingLinkRequests()
  const pendingLinkRequests = linkRequestsData?.data || []

  // Get outgoing link requests (to students)
  const { data: outgoingRequestsData, isLoading: isLoadingOutgoingRequests, isError: isOutgoingRequestsError, error: outgoingRequestsError } = useOutgoingLinkRequests()
  const outgoingRequests = outgoingRequestsData?.data || []

  const generateLinkCodeMutation = useGenerateLinkCode() // Generate link code
  const unlinkChildMutation = useUnlinkChild() // Unlink child
  const addChildMutation = useAddChild() // Add child
  const respondToLinkRequestMutation = useRespondToLinkRequest() // Respond to link request
  const cancelOutgoingRequestMutation = useCancelOutgoingRequest() // Cancel outgoing request
  const createChildAccountMutation = useCreateChildAccount() // Create new child account

  // Track currently processing request ID for loading states
  const [processingRequestId, setProcessingRequestId] = useState(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: { childEmail: '' }
  });

  // Form for creating a new child account
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    control: controlCreate,
    reset: resetCreate,
    watch: watchCreate,
    formState: { errors: createErrors }
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      grade: ''
    }
  });

  // Handle generating a link code
  const handleGenerateLinkCode = () => {
    generateLinkCodeMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Link code generated successfully")
      },
      onError: (error) => {
        console.log(error)
        toast.error(error?.response?.data?.message || error?.message || "Failed to generate link code")
      }
    })
  }

  // Handle copying link code to clipboard
  const handleCopyLinkCode = () => {
    if (!linkCode) return

    navigator.clipboard.writeText(linkCode)
      .then(() => {
        setLinkCodeCopied(true)
        toast.success("Link code copied to clipboard")
        setTimeout(() => setLinkCodeCopied(false), 3000)
      })
      .catch(() => {
        toast.error("Failed to copy code")
      })
  }

  // Handle unlinking a child
  const handleUnlinkChild = (childId, childName) => {
    if (!childId) return;

    // Show confirmation dialog
    setSelectedChildId(childId);
    setSelectedChildName(childName);
    setUnlinkDialogOpen(true);
  };

  // Confirm and execute child unlinking
  const confirmUnlinkChild = () => {
    if (!selectedChildId) return;

    unlinkChildMutation.mutate({ childId: selectedChildId }, {
      onSuccess: () => {
        toast.success("Successfully unlinked from child");
        setUnlinkDialogOpen(false);
      },
      onError: (error) => {
        console.log(error);
        toast.error(error?.response?.data?.message || error?.message || "Failed to unlink from child");
      }
    });
  };

  // Handle creating a brand new child account
  const onCreateChild = (data) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      grade: data.grade || undefined,
    }

    createChildAccountMutation.mutate(payload, {
      onSuccess: (res) => {
        const email = res?.data?.user?.email || data.email
        toast.success("Child account created successfully")
        resetCreate()
      },
      onError: (error) => {
        console.log(error)
        toast.error(error?.response?.data?.message || error?.message || 'Failed to create child account')
      }
    })
  }

  // Handle adding a child
  const onSubmit = (data) => {
    const formData = {
      childEmail: data.childEmail,
    }

    addChildMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Link request sent to child successfully")
        // Reset form
        reset()
      },
      onError: (error) => {
        console.log(error)
        toast.error(error?.response?.data?.message || error?.message || "Failed to send link request")
      }
    })
  }

  // Handle accepting a link request
  const handleAcceptRequest = (requestId) => {
    if (!requestId) return;

    setProcessingRequestId(requestId);

    respondToLinkRequestMutation.mutate(
      { requestId, action: 'approve' },
      {
        onSuccess: () => {
          toast.success("Successfully accepted link request");
          setProcessingRequestId(null);
        },
        onError: (error) => {
          console.log(error);
          toast.error(error?.response?.data?.message || error?.message || "Failed to accept link request");
          setProcessingRequestId(null);
        }
      }
    );
  };

  // Handle rejecting a link request
  const handleRejectRequest = (requestId, studentName) => {
    if (!requestId) return;

    // Show confirmation dialog
    setSelectedRequestId(requestId);
    setSelectedChildName(studentName);
    setRejectDialogOpen(true);
  };

  // Confirm and execute the rejection
  const confirmRejectRequest = () => {
    if (!selectedRequestId) return;

    setProcessingRequestId(selectedRequestId);

    respondToLinkRequestMutation.mutate(
      { requestId: selectedRequestId, action: 'reject' },
      {
        onSuccess: () => {
          toast.success("Link request rejected");
          setRejectDialogOpen(false);
          setProcessingRequestId(null);
        },
        onError: (error) => {
          console.log(error);
          toast.error(error?.response?.data?.message || error?.message || "Failed to reject link request");
          setProcessingRequestId(null);
        }
      }
    );
  };

  // Handle cancelling an outgoing request
  const handleCancelOutgoingRequest = (requestId, childName) => {
    if (!requestId) return;

    // Show confirmation dialog
    setSelectedRequestId(requestId);
    setSelectedChildName(childName);
    setCancelDialogOpen(true);
  };

  // Confirm and execute the cancellation
  const confirmCancelOutgoingRequest = () => {
    if (!selectedRequestId) return;

    setProcessingRequestId(selectedRequestId);

    cancelOutgoingRequestMutation.mutate(selectedRequestId, {
      onSuccess: () => {
        toast.success("Link request cancelled successfully");
        setCancelDialogOpen(false);
        setProcessingRequestId(null);
      },
      onError: (error) => {
        console.log(error);
        toast.error(error?.response?.data?.message || error?.message || "Failed to cancel link request");
        setProcessingRequestId(null);
      }
    });
  };

  if (isLoading) {
    return (
      <Flex align="center" justify="center">
        <Loader />
      </Flex>
    )
  }

  if (isError) {
    return (
      <ErrorCallout
        errorMessage={error?.response?.data?.message || error?.message || "Could not load parent profile"}
      />
    )
  }

  // Count all requests for the notification badge
  const totalPendingRequests = pendingLinkRequests.length + outgoingRequests.length;

  return (
    <>
      <Box className="space-y-6 max-w-4xl">
        {/* HEADER */}
        <LinkedAccountsHeader />

        {/* TABS INTERFACE */}
        <Tabs.Root defaultValue="connections" className='space-y-6'>
          <Tabs.List wrap={'wrap'}>
            <Tabs.Trigger value="connections">
              Connections
            </Tabs.Trigger>
            <Tabs.Trigger value="requests" className="relative">
              Requests
              {totalPendingRequests > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] flex items-center justify-center text-xs rounded-full bg-[--accent-9] text-[--accent-contrast] font-medium">
                  {totalPendingRequests}
                </span>
              )}
            </Tabs.Trigger>
            <Tabs.Trigger value="manage">
              Manage
            </Tabs.Trigger>
          </Tabs.List>

          {/* ACTIVE CONNECTIONS TAB */}
          <Tabs.Content value="connections" className="mt-6">
            <Flex direction="column" gap="6">
              {/* CONNECTED CHILDREN SECTION */}
              <Card size={{ initial: '2', sm: '3' }} className='space-y-6 shadow-md'>
                <Text as='p' weight={'bold'}>
                  Family Connections
                </Text>

                {isChildrenLoading ? (
                  <Flex align="center" justify="center" pb="6">
                    <Loader />
                  </Flex>
                ) : isChildrenError ? (
                  <Callout.Root color="red" size="2" className="mb-6">
                    <Callout.Icon>
                      <AlertCircle size={16} />
                    </Callout.Icon>
                    <Callout.Text>
                      {childrenError?.response?.data?.message || childrenError?.message || "Could not load children"}
                    </Callout.Text>
                  </Callout.Root>
                ) : children.length > 0 ? (
                  <Box className="grid gap-3">
                    {children.map((child) => (
                      <Card key={child._id} className="flex flex-wrap gap-3 justify-between items-center hover:shadow-md">
                        <Flex gap="3" align="start" className="flex-1">
                          <Avatar
                            size="3"
                            src={child?.userId?.avatar}
                            fallback={child?.userId?.firstName?.[0]}
                            radius="full"
                          />
                          <Flex direction="column" gap="1">
                            <Text size="2" weight="medium">
                              {child?.userId?.firstName} {child?.userId?.lastName}
                            </Text>
                            <Text size="1" color="gray">{child?.userId?.email}</Text>
                          </Flex>
                        </Flex>
                        <Button
                          color="red"
                          variant="soft"
                          onClick={() => handleUnlinkChild(child._id, child?.userId?.firstName)}
                          disabled={unlinkChildMutation.isPending}
                          className='ml-auto'
                        >
                          <Link2Off size={16} />
                          {unlinkChildMutation.isPending ? "Unlinking..." : "Unlink"}
                        </Button>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <EmptyStateCard
                    icon={<Users />}
                    title="No children connected"
                    description="You don't have any connected children yet. Your children can send you link requests, or you can share your parent code with them."
                    className="mb-6"
                  />
                )}

                <Card size={{ initial: '2', sm: '3' }} className='space-y-4'>
                  <Text as='p' weight={'bold'}>
                    Invite a Child to Your Account
                  </Text>

                  {/* Link with Class Code */}
                  <Box>
                    <Text size="2" weight="medium" className="flex gap-1 items-center mb-2">
                      Send Link Request
                    </Text>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
                      <TextField.Root
                        placeholder="Enter child's email"
                        {...register('childEmail', {
                          required: 'Child email is required',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Invalid email address'
                          }
                        })}
                        className="w-full"
                        size="2"
                      />
                      <Text size="1" color="gray">
                        The child will receive a link request to connect with you.
                      </Text>
                      <FormFieldErrorMessage errors={errors} field='childEmail' />
                      <Button
                        type="submit"
                        size="2"
                        disabled={!watch('childEmail') || addChildMutation.isPending}
                        className="self-end shadow-md"
                        onClick={handleSubmit(onSubmit)}
                      >
                        {addChildMutation.isPending ? "Processing..." : "Send Request"}
                      </Button>
                    </form>
                  </Box>
                </Card>


                <Box className="space-y-5">
                  <Separator size="4" />

                  <Card size={{ initial: '2', sm: '3' }} className='space-y-4'>
                    <Text as='p' weight={'bold'}>
                      Your Connection Code
                    </Text>

                    <Flex direction="column" gap="3">
                      <Text as='p' size="2">
                        Share this code with your children to let them connect with you:
                      </Text>
                      {linkCode ? (
                        <Box className="bg-[--gray-a2] rounded-lg p-3 flex items-center justify-between border border-[--gray-a5]">
                          <Text size="3" weight="medium" className="font-mono">
                            {linkCode}
                          </Text>
                          <Flex gap="2">
                            <Button
                              size="1"
                              variant={linkCodeCopied ? "soft" : "outline"}
                              color={linkCodeCopied ? "green" : "gray"}
                              onClick={handleCopyLinkCode}
                            >
                              <Copy size={14} />
                              {linkCodeCopied ? "Copied!" : "Copy"}
                            </Button>
                            <Button
                              size="1"
                              variant="soft"
                              onClick={handleGenerateLinkCode}
                              disabled={generateLinkCodeMutation.isPending}
                            >
                              <span className={generateLinkCodeMutation.isPending ? "animate-spin" : ""}>
                                <RefreshCw size={14} />
                              </span>
                              New
                            </Button>
                          </Flex>
                        </Box>
                      ) : (
                        <Card>
                          <Flex gap="3" align="center">
                            <Box className="flex-1">
                              <Text as="p" size="2" color={'gray'}>You don't have a link code yet</Text>
                            </Box>
                            <Button
                              onClick={handleGenerateLinkCode}
                              disabled={generateLinkCodeMutation.isPending}
                              className='shadow-md'
                            >
                              {generateLinkCodeMutation.isPending ? (
                                <Spinner />
                              ) : (
                                <>
                                  <Link2 size={16} />
                                  <Text size="2">Generate Code</Text>
                                </>
                              )}
                            </Button>
                          </Flex>
                        </Card>
                      )}
                      <Text size="1" color="gray">
                        Your children will use this code when they add a parent in their account settings.
                      </Text>
                    </Flex>
                  </Card>

                  <Callout.Root color="blue" variant='surface'>
                    <Callout.Icon>
                      <Info size={16} />
                    </Callout.Icon>
                    <Callout.Text>
                      When children connect with you using your parent code, you'll be able to monitor their academic progress, achievements, and educational activities.
                    </Callout.Text>
                  </Callout.Root>
                </Box>
              </Card>
            </Flex>
          </Tabs.Content>

          {/* PENDING REQUESTS TAB */}
          <Tabs.Content value="requests" className="mt-6">
            <Flex direction="column" gap="6">
              {/* INCOMING REQUESTS */}
              <Card size={{ initial: '2', sm: '3' }} className='space-y-4 shadow-md'>
                <Text as='p' weight={'bold'}>
                  Incoming Connection Requests
                </Text>

                <Callout.Root color="blue" size="1" className="mb-5" variant='surface'>
                  <Callout.Icon>
                    <Info size={16} />
                  </Callout.Icon>
                  <Callout.Text>
                    <Text as="p" size="2">Review and respond to connection requests from children who want to link with your account.</Text>
                    <Text as="p" size="2" mt="1">Accepting a request will give you access to view their academic progress.</Text>
                  </Callout.Text>
                </Callout.Root>

                {isLoadingLinkRequests ? (
                  <Flex align="center" justify="center" py="8">
                    <Loader />
                  </Flex>
                ) :
                  isLinkRequestsError ? (
                    <Callout.Root color="red" size="1" className="mb-5">
                      <Callout.Icon>
                        <AlertCircle size={14} />
                      </Callout.Icon>
                      <Callout.Text>
                        {linkRequestsError?.response?.data?.message || linkRequestsError?.message || "Could not load link requests"}
                      </Callout.Text>
                    </Callout.Root>
                  ) :
                    pendingLinkRequests.length > 0 ? (
                      <Box className="grid gap-3">
                        {pendingLinkRequests.map((request) => (
                          <Card size={'2'} key={request._id} className='hover:shadow-md'>
                            <Flex direction="column" gap="3">
                              <Flex align="center" gap="3">
                                <Avatar
                                  size="3"
                                  fallback={request?.studentName?.[0] || "S"}
                                  radius="full"
                                  className="shadow-sm"
                                />
                                <Flex direction="column">
                                  <Text size="2" weight="medium">
                                    {request?.studentName}
                                  </Text>
                                  <Text size="2" color="gray">{request?.studentEmail || "student@example.com"}</Text>
                                </Flex>
                              </Flex>

                              <Flex wrap="wrap" gap="3" className="text-sm">
                                <Box className="bg-[--gray-a3] rounded px-2 py-1 inline-flex items-center gap-1">
                                  <Text size="1" color="gray">Code:</Text>
                                  <Text size="1" weight="bold" className="font-mono">{request.code}</Text>
                                </Box>

                                <Box className="bg-[--gray-a3] rounded px-2 py-1 inline-flex items-center gap-1">
                                  <Text size="1" color="gray">Received:</Text>
                                  <Text size="1">{new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                                </Box>

                                <Box className="bg-[--gray-a3] rounded px-2 py-1 inline-flex items-center gap-1">
                                  <Text size="1" color="gray">Expires:</Text>
                                  <Text size="1">{new Date(request.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                                </Box>
                              </Flex>

                              <Flex justify="end" gap="2">
                                <Button
                                  color="red"
                                  variant="soft"
                                  size="2"
                                  onClick={() => handleRejectRequest(request._id, request?.studentName)}
                                  disabled={respondToLinkRequestMutation.isPending && processingRequestId === request._id}
                                >
                                  Reject
                                </Button>
                                <Button
                                  color="green"
                                  size="2"
                                  onClick={() => handleAcceptRequest(request._id)}
                                  disabled={respondToLinkRequestMutation.isPending && processingRequestId === request._id}
                                >
                                  Approve
                                </Button>
                              </Flex>
                            </Flex>
                          </Card>
                        ))}
                      </Box>
                    ) : (
                      <EmptyStateCard
                        icon={<CheckCircle />}
                        title="No incoming requests"
                        description="You don't have any pending connection requests from children. When a child requests to connect with you, it will appear here."
                      />
                    )}
              </Card>

              {/* OUTGOING REQUESTS */}
              <Card size={{ initial: '2', sm: '3' }} className='space-y-4 shadow-md'>
                <Text as='p' weight={'bold'}>
                  Outgoing Connection Requests
                </Text>

                <Callout.Root color="blue" size="1" className="mb-5" variant='surface'>
                  <Callout.Icon>
                    <Info size={16} />
                  </Callout.Icon>
                  <Callout.Text>
                    <Text as="p" size="2">Connection requests you've sent to children are waiting for their approval.</Text>
                    <Text as="p" size="2" mt="1">These requests will expire after 7 days if not accepted.</Text>
                  </Callout.Text>
                </Callout.Root>

                {isLoadingOutgoingRequests ? (
                  <Flex align="center" justify="center" py="8">
                    <Loader />
                  </Flex>
                ) :
                  isOutgoingRequestsError ? (
                    <Callout.Root color="red" size="1" className="mb-5">
                      <Callout.Icon>
                        <AlertCircle size={14} />
                      </Callout.Icon>
                      <Callout.Text>
                        {outgoingRequestsError?.response?.data?.message || outgoingRequestsError?.message || "Could not load outgoing requests"}
                      </Callout.Text>
                    </Callout.Root>
                  ) :
                    outgoingRequests.length > 0 ? (
                      <Box className="grid gap-3">
                        {outgoingRequests.map((request) => (
                          <Card size={'2'} key={request._id} className='hover:shadow-md'>
                            <Flex direction="column" gap="3">
                              <Flex align="center" gap="3">
                                <Avatar
                                  size="3"
                                  fallback={request?.childName?.[0] || request?.studentName?.[0] || "C"}
                                  radius="full"
                                  className="shadow-sm"
                                />
                                <Flex direction="column">
                                  <Text size="2" weight="medium">
                                    {request?.childName || request?.studentName}
                                  </Text>
                                  <Text size="2" color="gray">{request?.childEmail || request?.studentEmail}</Text>
                                </Flex>
                              </Flex>

                              <Flex wrap="wrap" gap="3" className="text-sm">
                                <Box className="bg-[--gray-a3] rounded px-2 py-1 inline-flex items-center gap-1">
                                  <Text size="1" color="gray">Code:</Text>
                                  <Text size="1" weight="bold" className="font-mono">{request.code}</Text>
                                </Box>

                                <Box className="bg-[--gray-a3] rounded px-2 py-1 inline-flex items-center gap-1">
                                  <Text size="1" color="gray">Sent:</Text>
                                  <Text size="1">{new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                                </Box>

                                <Box className="bg-[--gray-a3] rounded px-2 py-1 inline-flex items-center gap-1">
                                  <Text size="1" color="gray">Expires:</Text>
                                  <Text size="1">{new Date(request.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                                </Box>
                              </Flex>

                              <Flex justify="end">
                                <Button
                                  color="red"
                                  variant="soft"
                                  size="2"
                                  onClick={() => handleCancelOutgoingRequest(request._id, request?.childName || request?.studentName)}
                                  disabled={cancelOutgoingRequestMutation.isPending && processingRequestId === request._id}
                                >
                                  {cancelOutgoingRequestMutation.isPending && processingRequestId === request._id ?
                                    "Cancelling..." : "Cancel Request"}
                                </Button>
                              </Flex>
                            </Flex>
                          </Card>
                        ))}
                      </Box>
                    ) : (
                      <EmptyStateCard
                        icon={<CheckCircle />}
                        title="No outgoing requests"
                        description="You haven't sent any connection requests to children that are pending approval."
                      />
                    )}
              </Card>
            </Flex>
          </Tabs.Content>

          {/* MANAGE CHILDREN TAB */}
          <Tabs.Content value="manage" className="mt-6">

            {/* Success Callout for creating a new child account */}
            {createChildAccountMutation.isSuccess && <Callout.Root color="green" variant='surface' className='mb-6'>
              <Callout.Icon>
                <Info size={16} />
              </Callout.Icon>
              <Callout.Text weight={'bold'}>
                Child account created successfully
              </Callout.Text>
              <Text as="p" size="2">
                A verification email has been sent to {createChildAccountMutation.data?.data?.email || "your child's email"}. Ask them to verify and sign in, then complete linking.
              </Text>
            </Callout.Root>}

            {/* Create New Child Account */}
            <Card size={{ initial: '2', sm: '3' }} className='mt-6 space-y-4 shadow-md'>
              <Text as='p' weight={'bold'}>Create a New Child Account</Text>

              <Callout.Root color="blue" variant='surface'>
                <Callout.Icon>
                  <Info size={16} />
                </Callout.Icon>
                <Callout.Text>
                  After creating the account, a verification email will be sent to your child's email. They must verify their account and sign in. Then, link their account using your parent code or by handling a link request.
                </Callout.Text>
              </Callout.Root>

              <form onSubmit={handleSubmitCreate(onCreateChild)} className='space-y-3'>
                <Flex gap="3" wrap="wrap">
                  <Box className='flex-1 min-w-[220px]'>
                    <label>
                      <Text as="div" size="2" mb="1" weight="medium">
                        First Name <Text color="red">*</Text>
                      </Text>
                      <TextField.Root
                        placeholder="Enter first name"
                        {...registerCreate('firstName', { required: 'First name is required' })}
                      />
                    </label>
                    {createErrors.firstName && (
                      <FormFieldErrorMessage errors={createErrors} field='firstName' />
                    )}
                  </Box>
                  <Box className='flex-1 min-w-[220px]'>
                    <label>
                      <Text as="div" size="2" mb="1" weight="medium">
                        Last Name <Text color="red">*</Text>
                      </Text>
                      <TextField.Root
                        placeholder="Enter last name"
                        {...registerCreate('lastName', { required: 'Last name is required' })}
                      />
                    </label>
                    {createErrors.lastName && (
                      <FormFieldErrorMessage errors={createErrors} field='lastName' />
                    )}
                  </Box>
                </Flex>

                <Flex gap="3" wrap="wrap">
                  <Box className='flex-1 min-w-[260px]'>
                    <label>
                      <Text as="div" size="2" mb="1" weight="medium">
                        Child's Email <Text color="red">*</Text>
                      </Text>
                      <TextField.Root
                        placeholder="email@example.com"
                        type="email"
                        {...registerCreate('email', {
                          required: 'Child email is required',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Invalid email address'
                          }
                        })}
                      />
                    </label>
                    {createErrors.email && (
                      <FormFieldErrorMessage errors={createErrors} field='email' />
                    )}
                  </Box>
                  <Box className='flex-1 min-w-[220px]'>
                    <label>
                      <Text as="div" size="2" mb="1" weight="medium">
                        Set Password <Text color="red">*</Text>
                      </Text>
                      <TextField.Root
                        placeholder="Minimum 8 characters"
                        type="password"
                        {...registerCreate('password', {
                          required: 'Password is required',
                          minLength: { value: 8, message: 'Password must be at least 8 characters' }
                        })}
                      />
                    </label>
                    {createErrors.password && (
                      <FormFieldErrorMessage errors={createErrors} field='password' />
                    )}
                  </Box>
                  <Box className='flex-1 min-w-[220px]'>
                    <label>
                      <Text as="div" size="2" mb="1" weight="medium">
                        Grade (Optional)
                      </Text>
                      <Controller
                        control={controlCreate}
                        name="grade"
                        render={({ field }) => (
                          <Select.Root value={field.value} onValueChange={field.onChange}>
                            <Select.Trigger placeholder="Select Grade" className="w-full" />
                            <Select.Content position="popper" variant='soft'>
                              {gradeOptions.map((g) => (
                                <Select.Item key={g} value={g} className="capitalize">{g}</Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Root>
                        )}
                      />
                    </label>
                  </Box>
                </Flex>

                <Flex justify="end" mt="2">
                  <Button
                    type="submit"
                    size="2"
                    className='shadow-md'
                    disabled={createChildAccountMutation.isPending || !watchCreate('firstName') || !watchCreate('lastName') || !watchCreate('email') || !watchCreate('password')}
                  >
                    {createChildAccountMutation.isPending ? 'Creating...' : 'Create Account'}
                  </Button>
                </Flex>
              </form>

            </Card>
          </Tabs.Content>
        </Tabs.Root>
      </Box >

      {/* Confirmation Dialogs */}
      < ConfirmationDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        title="Reject Connection Request"
        description={`Are you sure you want to reject the connection request from ${selectedChildName || 'this student'}?`
        }
        additionalContent={
          < Text as="p" size="1" color="gray" >
            This action cannot be undone.The student will need to send a new connection request if you change your mind.
          </Text >
        }
        confirmText="Reject Request"
        confirmColor="red"
        isLoading={respondToLinkRequestMutation.isPending}
        onConfirm={confirmRejectRequest}
      />

      <ConfirmationDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancel Link Request"
        description={`Are you sure you want to cancel your connection request to ${selectedChildName || 'this student'}?`}
        additionalContent={
          <Text as="p" size="1" color="gray">
            This action cannot be undone. You will need to create a new request if you change your mind.
          </Text>
        }
        confirmText="Cancel Request"
        confirmColor="red"
        isLoading={cancelOutgoingRequestMutation.isPending}
        onConfirm={confirmCancelOutgoingRequest}
      />

      <ConfirmationDialog
        open={unlinkDialogOpen}
        onOpenChange={setUnlinkDialogOpen}
        title="Unlink Child"
        description={`Are you sure you want to unlink ${selectedChildName || 'this child'} from your account?`}
        additionalContent={
          <Text as="p" size="1" color="gray">
            This action will remove all connections between you and this child.
          </Text>
        }
        confirmText="Unlink Child"
        confirmColor="red"
        isLoading={unlinkChildMutation.isPending}
        onConfirm={confirmUnlinkChild}
      />
    </>
  )
}

export default LinkedAccounts

function LinkedAccountsHeader() {
  return (
    <PageHeader
      title={"Account Connections"}
      description={"Manage your connections with children to monitor their academic progress, achievements, and help them succeed in their educational journey."}
      titleSize={{ initial: '5', sm: '6' }}
    />
  )
}
