import { Avatar, Badge, Box, Button, Callout, Flex, Select, Separator, Tabs, Text, TextField, Theme } from '@radix-ui/themes'
import { AlertCircle, CheckCircle, Clock, Copy, Info, Link2, Link2Off, RefreshCw, UserPlus, Users } from 'lucide-react'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  useAddChild,
  useCancelOutgoingRequest,
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
import { ConfirmationDialog, EmptyStateCard, Loader, SectionHeader } from '../../../components'
import { gradeOptions } from '../../../utils/constants'

function LinkedAccounts() {
  const [linkCodeCopied, setLinkCodeCopied] = useState(false)

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

  // Track currently processing request ID for loading states
  const [processingRequestId, setProcessingRequestId] = useState(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      childName: '',
      childEmail: '',
      childAge: '',
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

  // Handle adding a child
  const onSubmit = (data) => {
    const formData = {
      childName: data.childName,
      childEmail: data.childEmail,
      childAge: data.childAge ? parseInt(data.childAge) : undefined,
      grade: data.grade || undefined
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
        <Loader borderWidth={2} className='size-8' borderColor='var(--accent-11)' />
      </Flex>
    )
  }

  if (isError) {
    return (
      <Callout.Root color="red" size="2" className="max-w-4xl">
        <Callout.Icon>
          <AlertCircle size={16} />
        </Callout.Icon>
        <Callout.Text>
          {error?.response?.data?.message || error?.message || "Could not load parent profile"}
        </Callout.Text>
      </Callout.Root>
    )
  }

  // Count all requests for the notification badge
  const totalPendingRequests = pendingLinkRequests.length + outgoingRequests.length;

  return (
    <>
      <Box className="max-w-4xl">
        {/* HEADER */}
        <Flex direction="column" className="mb-6">
          <Flex align="center" gap="2" mb="1">
            <Link2 size={22} className="text-[--accent-9]" />
            <Text as="h1" size="6" weight="medium">
              Account Connections
            </Text>
          </Flex>
          <Text as="p" size="2" color="gray">
            Manage your connections with children to monitor their academic progress, achievements, and help them succeed in their educational journey.
          </Text>
        </Flex>

        {/* TABS INTERFACE */}
        <Tabs.Root defaultValue="connections">
          <Tabs.List wrap={'wrap'}>
            <Tabs.Trigger value="connections">
              <Flex align="center" gap="1">
                <Link2 size={16} />
                <span>Connections</span>
              </Flex>
            </Tabs.Trigger>
            <Tabs.Trigger value="requests" className="relative">
              <Flex align="center" gap="1">
                <Clock size={16} />
                <span>Requests</span>
              </Flex>
              {totalPendingRequests > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] flex items-center justify-center text-xs rounded-full bg-[--accent-9] text-[--accent-contrast] font-medium">
                  {totalPendingRequests}
                </span>
              )}
            </Tabs.Trigger>
            <Tabs.Trigger value="manage">
              <Flex align="center" gap="1">
                <UserPlus size={16} />
                <span>Manage</span>
              </Flex>
            </Tabs.Trigger>
          </Tabs.List>

          {/* ACTIVE CONNECTIONS TAB */}
          <Tabs.Content value="connections" className="mt-6">
            <Flex direction="column" gap="6">
              {/* CONNECTED CHILDREN SECTION */}
              <Box className="rounded-lg border border-[--gray-a6] overflow-hidden">
                <SectionHeader
                  icon={<Users />}
                  title="Family Connections"
                />

                <Box className="p-4 md:p-6">
                  {isChildrenLoading ? (
                    <Flex align="center" justify="center" pb="6">
                      <Loader borderWidth={2} className='size-6' borderColor='var(--accent-11)' />
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
                    <Box className="grid gap-3 mb-6">
                      {children.map((child) => (
                        <Box key={child._id} className="flex items-center justify-between p-4 bg-[--gray-a2] rounded-lg border border-[--gray-a5] hover:border-[--focus-8] transition-colors flex-wrap gap-3">
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
                              <Text size="2" color="gray">{child?.userId?.email}</Text>
                              {child?.grade && (
                                <Badge size="1" variant="surface" className="self-start mt-1">
                                  Grade {child.grade}
                                </Badge>
                              )}
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
                        </Box>
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

                  <Box className="space-y-5">
                    <Separator size="4" />

                    <Box className="rounded-lg border border-[--gray-a5] overflow-hidden">
                      <SectionHeader
                        icon={<Info />}
                        title="Your Connection Code"
                        size="medium"
                      />

                      <Box className="p-4">
                        <Flex direction="column" gap="3">
                          <Text size="2" color="gray">
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
                            <Flex gap="3" align="center" className="border rounded-lg p-4 border-[--gray-a6]">
                              <Box className="flex-1">
                                <Text as="p" size="2">You don't have a link code yet</Text>
                                <Text as="p" size="2" color="gray">Generate a code to share with your child</Text>
                              </Box>
                              <Button
                                onClick={handleGenerateLinkCode}
                                disabled={generateLinkCodeMutation.isPending}
                              >
                                {generateLinkCodeMutation.isPending ? (
                                  <Loader className="w-4 h-4" />
                                ) : (
                                  <>
                                    <Link2 size={16} />
                                    <Text size="2">Generate Code</Text>
                                  </>
                                )}
                              </Button>
                            </Flex>
                          )}
                          <Text size="1" color="gray">
                            Your children will use this code when they add a parent in their account settings.
                          </Text>
                        </Flex>
                      </Box>
                    </Box>

                    <Callout.Root color="blue" variant='surface'>
                      <Callout.Icon>
                        <Info size={16} />
                      </Callout.Icon>
                      <Callout.Text>
                        When children connect with you using your parent code, you'll be able to monitor their academic progress, achievements, and educational activities.
                      </Callout.Text>
                    </Callout.Root>
                  </Box>
                </Box>
              </Box>
            </Flex>
          </Tabs.Content>

          {/* PENDING REQUESTS TAB */}
          <Tabs.Content value="requests" className="mt-6">
            <Flex direction="column" gap="6">
              {/* INCOMING REQUESTS */}
              <Box className="rounded-lg border border-[--gray-a6] overflow-hidden">
                <SectionHeader
                  icon={<Clock />}
                  title="Incoming Connection Requests"
                />

                <Box className="p-4 md:p-6">
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
                      <Loader borderWidth={2} className='size-6' borderColor='var(--accent-11)' />
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
                            <Box key={request._id} className="overflow-hidden rounded-lg border border-[--gray-a6]">
                              <Box className="bg-[--gray-a3] px-4 py-3">
                                <Flex align="center" justify="between">
                                  <Flex align="center" gap="2">
                                    <Users size={16} className="text-[--accent-9]" />
                                    <Text size="2" weight="medium">
                                      Child Connection Request
                                    </Text>
                                  </Flex>
                                  <Badge variant="soft" color="amber">
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                  </Badge>
                                </Flex>
                              </Box>

                              <Box className="p-4">
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
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <EmptyStateCard
                          icon={<CheckCircle />}
                          title="No incoming requests"
                          description="You don't have any pending connection requests from children. When a child requests to connect with you, it will appear here."
                        />
                      )}
                </Box>
              </Box>

              {/* OUTGOING REQUESTS */}
              <Box className="rounded-lg border border-[--gray-a6] overflow-hidden">
                <SectionHeader
                  icon={<Clock />}
                  title="Outgoing Connection Requests"
                />

                <Box className="p-4 md:p-6">
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
                      <Loader borderWidth={2} className='size-6' borderColor='var(--accent-11)' />
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
                            <Box key={request._id} className="overflow-hidden rounded-lg border border-[--gray-a6]">
                              <Box className="bg-[--gray-a3] px-4 py-3">
                                <Flex align="center" justify="between">
                                  <Flex align="center" gap="2">
                                    <Users size={16} className="text-[--accent-9]" />
                                    <Text size="2" weight="medium">
                                      Request Pending Child Approval
                                    </Text>
                                  </Flex>
                                  <Badge variant="soft" color="amber">
                                    Awaiting Response
                                  </Badge>
                                </Flex>
                              </Box>

                              <Box className="p-4">
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
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <EmptyStateCard
                          icon={<CheckCircle />}
                          title="No outgoing requests"
                          description="You haven't sent any connection requests to children that are pending approval."
                        />
                      )}
                </Box>
              </Box>
            </Flex>
          </Tabs.Content>

          {/* MANAGE CHILDREN TAB */}
          <Tabs.Content value="manage" className="mt-6">
            <Box className="rounded-lg border border-[--gray-a6] overflow-hidden">
              <SectionHeader
                icon={<UserPlus />}
                title="Invite a Child"
              />

              <Box className="p-4 md:p-6">
                <Text as="p" size="2" mb="4">
                  Send a connection request to your child. They will need to approve the request before you can see their account.
                </Text>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Box className="space-y-4">
                    <Box>
                      <label>
                        <Text as="div" size="2" mb="1" weight="medium">
                          Child's Name <Text color="red">*</Text>
                        </Text>
                        <TextField.Root
                          placeholder="Enter your child's name"
                          {...register('childName', {
                            required: 'Child name is required'
                          })}
                        />
                      </label>
                      {errors.childName && (
                        <Text as="p" size="1" color="red" className="flex gap-1 items-center mt-1">
                          <Info size={14} /> {errors.childName.message}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <label>
                        <Text as="div" size="2" mb="1" weight="medium">
                          Child's Email <Text color="red">*</Text>
                        </Text>
                        <TextField.Root
                          placeholder="Enter your child's email address"
                          type="email"
                          {...register('childEmail', {
                            required: 'Child email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
                            }
                          })}
                        />
                      </label>
                      <Text size="1" color="gray">
                        This will be used for your child's account
                      </Text>
                      {errors.childEmail && (
                        <Text as="p" size="1" color="red" className="flex gap-1 items-center mt-1">
                          <Info size={14} /> {errors.childEmail.message}
                        </Text>
                      )}
                    </Box>

                    <Flex gap="4" className="flex-col sm:flex-row">
                      <Box className="flex-1">
                        <label>
                          <Text as="div" size="2" mb="1" weight="medium">
                            Age (Optional)
                          </Text>
                          <TextField.Root
                            placeholder="Age"
                            type="number"
                            {...register('childAge', {
                              min: { value: 3, message: 'Age must be at least 3' },
                              max: { value: 25, message: 'Age must be less than 25' },
                              valueAsNumber: true
                            })}
                          />
                        </label>
                        {errors.childAge && (
                          <Text as="p" size="1" color="red" className="flex gap-1 items-center mt-1">
                            <Info size={14} /> {errors.childAge.message}
                          </Text>
                        )}
                      </Box>
                      <Box className="flex-1">
                        <label>
                          <Text as="div" size="2" mb="1" weight="medium">
                            Grade (Optional)
                          </Text>
                          <Controller
                            control={control}
                            name="grade"
                            render={({ field }) => (
                              <Select.Root
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <Select.Trigger
                                  placeholder="Select Grade"
                                  className="w-full"
                                />
                                <Select.Content position="popper">
                                  {gradeOptions.map((g) => (
                                    <Select.Item key={g} value={g} className="capitalize">
                                      {g}
                                    </Select.Item>
                                  ))}
                                </Select.Content>
                              </Select.Root>
                            )}
                          />
                        </label>
                        {errors.grade && (
                          <Text as="p" size="1" color="red" className="flex gap-1 items-center mt-1">
                            <Info size={14} /> {errors.grade.message}
                          </Text>
                        )}
                      </Box>
                    </Flex>

                    <Flex justify="end" mt="4">
                      <Button
                        type="submit"
                        size="2"
                        disabled={addChildMutation.isPending}
                      >
                        <UserPlus size={16} />
                        <Text>
                          {addChildMutation.isPending ? 'Sending Invitation...' : 'Send Invitation'}
                        </Text>
                      </Button>
                    </Flex>
                  </Box>
                </form>

                <Box className="mt-6">
                  <Callout.Root color="blue" variant='surface'>
                    <Callout.Icon>
                      <Info size={16} />
                    </Callout.Icon>
                    <Callout.Text>
                      Inviting a child sends them a link request which they'll need to approve. If they don't have an account yet, one will be created for them.
                    </Callout.Text>
                  </Callout.Root>
                </Box>
              </Box>
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Box>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        title="Reject Connection Request"
        description={`Are you sure you want to reject the connection request from ${selectedChildName || 'this student'}?`}
        additionalContent={
          <Text as="p" size="1" color="gray">
            This action cannot be undone. The student will need to send a new connection request if you change your mind.
          </Text>
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
