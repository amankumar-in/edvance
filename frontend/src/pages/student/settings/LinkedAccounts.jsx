import { Avatar, Badge, Box, Button, Callout, Card, Flex, Tabs, Text, TextField, Tooltip } from '@radix-ui/themes';
import { AlertCircle, Building, CheckCircle, HelpCircle, Info, Link, Link2Off, Mail, School, Shield, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  useCancelLinkRequest,
  useLinkWithParent,
  useLinkWithSchool,
  useRequestParentLink,
  useRespondToParentLinkRequest,
  useUnlinkFromParent,
  useUnlinkFromSchool
} from '../../../api/student/student.mutations';
import {
  useGetParentLinkRequests,
  useGetPendingLinkRequests,
  useStudentProfile
} from '../../../api/student/student.queries';
import { ConfirmationDialog, EmptyStateCard, Loader } from '../../../components';
import { useLocation } from 'react-router';

function LinkedAccounts() {
  const [parentCode, setParentCode] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const { hash } = useLocation();

  // Confirmation dialog states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedParentName, setSelectedParentName] = useState('');

  // Add state for parent unlink confirmation
  const [unlinkParentDialogOpen, setUnlinkParentDialogOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [selectedParentToUnlink, setSelectedParentToUnlink] = useState('');

  // Add state for school unlink confirmation
  const [unlinkSchoolDialogOpen, setUnlinkSchoolDialogOpen] = useState(false);
  const [schoolToUnlink, setSchoolToUnlink] = useState('');

  const { data: studentData, isLoading, isError, error } = useStudentProfile();
  const student = studentData?.data;

  const { data: linkRequestsData, isLoading: isLoadingLinkRequests } = useGetPendingLinkRequests();
  const pendingLinkRequests = linkRequestsData?.data || [];

  const { data: parentLinkRequestsData, isLoading: isLoadingParentLinkRequests } = useGetParentLinkRequests();
  const parentLinkRequests = parentLinkRequestsData?.data || [];

  const linkParentMutation = useLinkWithParent();
  const unlinkParentMutation = useUnlinkFromParent();
  const requestParentLinkMutation = useRequestParentLink();
  const respondToParentLinkMutation = useRespondToParentLinkRequest();

  const linkSchoolMutation = useLinkWithSchool();
  const unlinkSchoolMutation = useUnlinkFromSchool();
  const cancelLinkRequestMutation = useCancelLinkRequest();

  // Handle link parent form submission
  const handleLinkParent = (e) => {
    e.preventDefault();
    if (!parentCode) return;

    linkParentMutation.mutate(parentCode, {
      onSuccess: () => {
        toast.success("Successfully linked with parent");
        setParentCode('');
      },
      onError: (error) => {
        console.log(error);
        toast.error(error?.response?.data?.message || error?.message || "Failed to link with parent");
      }
    });
  };

  // Handle request parent link via email
  const handleRequestParentLink = (e) => {
    e.preventDefault();
    if (!parentEmail) return;

    requestParentLinkMutation.mutate(parentEmail, {
      onSuccess: () => {
        toast.success("Parent link request sent successfully");
        setParentEmail('');
      },
      onError: (error) => {
        console.log(error)
        toast.error(error?.response?.data?.message || error?.message || "Failed to send parent link request");
      }
    });
  };

  // Handle responding to a parent link request
  const handleRespondToParentLinkRequest = (requestId, action) => {
    if (action === 'approve') {
      // Approvals don't need confirmation
      confirmRespondToParentLinkRequest(requestId, action);
    } else {
      // For rejections, show confirmation dialog
      const request = parentLinkRequests.find(req => req._id === requestId);
      if (request) {
        setSelectedRequestId(requestId);
        setSelectedParentName(request.parentName);
        setRejectDialogOpen(true);
      }
    }
  };

  // Confirm and execute the response to parent link request
  const confirmRespondToParentLinkRequest = (requestId, action) => {
    respondToParentLinkMutation.mutate({ requestId, action }, {
      onSuccess: () => {
        toast.success(`Link request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        // Close dialog if open
        if (rejectDialogOpen) setRejectDialogOpen(false);
      },
      onError: (error) => {
        console.log(error);
        toast.error(error?.response?.data?.message || error?.message || `Failed to ${action} link request`);
      }
    });
  };

  // Handle unlinking a parent
  const handleUnlinkParent = (parentId, parentName) => {
    if (!parentId) return;

    setSelectedParentId(parentId);
    setSelectedParentToUnlink(parentName);
    setUnlinkParentDialogOpen(true);
  };

  // Confirm and execute parent unlinking
  const confirmUnlinkParent = () => {
    if (!selectedParentId || !student?._id) return;

    unlinkParentMutation.mutate({ id: student._id, parentId: selectedParentId }, {
      onSuccess: () => {
        toast.success("Successfully unlinked from parent");
        setUnlinkParentDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error?.message || "Failed to unlink from parent");
      }
    });
  };

  // Handle link school form submission
  const handleLinkSchool = (e) => {
    e.preventDefault();
    if (!schoolCode) return;

    linkSchoolMutation.mutate(schoolCode, {
      onSuccess: () => {
        toast.success("Successfully linked with school");
        setSchoolCode('');
      },
      onError: (error) => {
        console.log(error);
        toast.error(error?.response?.data?.message || error?.message || "Failed to link with school");
      }
    });
  };

  // Handle unlinking a school
  const handleUnlinkSchool = (schoolName) => {
    if (!student?._id) return;

    setSchoolToUnlink(schoolName || 'your school');
    setUnlinkSchoolDialogOpen(true);
  };

  // Confirm and execute school unlinking
  const confirmUnlinkSchool = () => {
    if (!student?._id) return;

    unlinkSchoolMutation.mutate({ id: student._id }, {
      onSuccess: () => {
        toast.success("Successfully unlinked from school");
        setUnlinkSchoolDialogOpen(false);
      },
      onError: (error) => {
        console.log(error);
        toast.error(error?.response?.data?.message || error?.message || "Failed to unlink from school");
      }
    });
  };

  // Handle canceling a link request
  const handleCancelLinkRequest = (requestId) => {
    // Show confirmation dialog
    setSelectedRequestId(requestId);
    setCancelDialogOpen(true);
  };

  // Confirm and execute the cancellation
  const confirmCancelLinkRequest = () => {
    if (!selectedRequestId) return;

    cancelLinkRequestMutation.mutate(selectedRequestId, {
      onSuccess: () => {
        toast.success("Link request canceled successfully");
        setCancelDialogOpen(false);
      },
      onError: (error) => {
        console.log(error)
        toast.error(error?.response?.data?.message || error?.message || "Failed to cancel link request");
      }
    });
  };

  // Scroll to hash on load
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [hash, isLoading]);

  if (isLoading) {
    return (
      <Flex align="center" justify="center">
        <Loader />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Callout.Root color="red" size="2" className="max-w-4xl">
        <Callout.Icon>
          <AlertCircle size={16} />
        </Callout.Icon>
        <Callout.Text>
          {error?.response?.data?.message || error?.message || "Could not load student profile"}
        </Callout.Text>
      </Callout.Root>
    );
  }

  return (
    <div>
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
              {(pendingLinkRequests.length > 0 || parentLinkRequests.length > 0) && (
                <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] flex items-center justify-center text-xs rounded-full bg-[--accent-9] text-[--accent-contrast] font-medium">
                  {pendingLinkRequests.length + parentLinkRequests.length}
                </span>
              )}
            </Tabs.Trigger>
          </Tabs.List>

          {/* ACTIVE CONNECTIONS TAB */}
          <Tabs.Content value="connections">
            <Flex direction="column" gap="6">
              {/* FAMILY SECTION */}
              <Card size={{initial: '2', sm: '3'}} className='space-y-4 card_no_border'>
                <Text as='p' weight={'bold'}>
                  Family Connections
                </Text>

                {student?.parentIds?.length > 0 ? (
                  <Box className="grid gap-3 mb-6">
                    {student.parentIds.map((parent) => (
                      <Card size='2' key={parent._id} className="flex flex-wrap gap-3 justify-between items-center">
                        <Flex gap="3" align="start" className="flex-1">
                          <Avatar
                            size="3"
                            src={parent?.avatar}
                            fallback={parent?.firstName?.[0] || ""}
                            radius="full"
                          />
                          <Flex direction="column" gap="1">
                            <Text size="2" weight="medium">
                              {parent.firstName} {parent.lastName}
                            </Text>
                            <Text size="2" color="gray">{parent.email}</Text>
                          </Flex>
                        </Flex>
                        <Button
                          color="red"
                          variant="soft"
                          size="2"
                          onClick={() => handleUnlinkParent(parent._id, parent.firstName)}
                          disabled={unlinkParentMutation.isPending}
                        >
                          <Link2Off size={16} />
                          {unlinkParentMutation.isPending ? "Unlinking..." : "Unlink"}
                        </Button>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <EmptyStateCard
                    icon={<Users />}
                    title="No family connections"
                    description="Link your parents or guardians to share your academic progress, achievements, and attendance records with them."
                    className="mb-6"
                  />
                )}

                <Card size={{initial: '2', sm: '3'}} className='space-y-4'>
                  <Text as='p' weight={'bold'}>
                    Connect with a Parent or Guardian
                  </Text>

                  <Flex gap="6" wrap="wrap">
                    {/* Link with Code */}
                    <Box className="flex-1 min-w-44">
                      <Text size="2" weight="medium" className="flex gap-1 items-center mb-2">
                        Link with Code
                        <Tooltip content="Ask your parent for their unique link code">
                          <HelpCircle size={14} />
                        </Tooltip>
                      </Text>
                      <form onSubmit={handleLinkParent} className="flex flex-col gap-2">
                        <TextField.Root
                          placeholder="Enter parent link code"
                          value={parentCode}
                          onChange={e => setParentCode(e.target.value)}
                          className="w-full"
                          size="2"
                        />
                        <Text size="1" color="gray" className="mb-1">
                          Parent link codes are provided to your parent/guardian
                        </Text>
                        <Button
                          type="submit"
                          size="2"
                          disabled={!parentCode || linkParentMutation.isPending}
                          className="self-start shadow-md"
                        >
                          {linkParentMutation.isPending ? "Linking..." : "Link Parent"}
                        </Button>
                      </form>
                    </Box>

                    {/* Request Link via Email */}
                    <Box className="flex-1 min-w-44">
                      <Text size="2" weight="medium" className="flex gap-1 items-center mb-2">
                        Send Link Request
                        <Tooltip content="Send a link request to your parent">
                          <HelpCircle size={14} />
                        </Tooltip>
                      </Text>
                      <form onSubmit={handleRequestParentLink} className="flex flex-col gap-2">
                        <TextField.Root
                          type="email"
                          placeholder="Enter parent's email address"
                          value={parentEmail}
                          onChange={e => setParentEmail(e.target.value)}
                          className="w-full"
                          size="2"
                        />
                        <Text size="1" color="gray" className="mb-1">
                          Your parent will receive a link request to connect
                        </Text>
                        <Button
                          type="submit"
                          size="2"
                          disabled={!parentEmail || requestParentLinkMutation.isPending}
                          className="self-start shadow-md"
                        >
                          {requestParentLinkMutation.isPending ? "Sending..." : "Request Link"}
                        </Button>
                      </form>
                    </Box>
                  </Flex>
                </Card>
              </Card>

              {/* SCHOOL SECTION */}
              <Card size={{ initial: '2', sm: '3' }} className='space-y-4 card_no_border scroll-smooth'>
                <Text as='p' weight={'bold'} id='school'>
                  Educational Institution
                </Text>

                {student?.schoolDetails ? (
                  <Card size='2'>
                    <Flex gap="4" wrap={'wrap'}>
                      <Avatar
                        size="5"
                        fallback={student?.schoolDetails?.name?.[0]}
                        src={student?.schoolDetails?.logo}
                        radius="full"
                        className="shadow-sm"
                      />
                      <Box className="flex-1 min-w-44">
                        <Flex direction="column" gap="1">
                          <Text as="p" size="3" weight="medium">
                            {student?.schoolDetails?.name}
                          </Text>
                          <Text as="div" size="1" color="gray" className='space-y-1'>
                            <div>
                              {student?.schoolDetails?.address}
                            </div>
                            <div>
                              {student?.schoolDetails?.city},&nbsp;
                              {student?.schoolDetails?.state}, {student?.schoolDetails?.zipCode}
                            </div>
                          </Text>
                        </Flex>
                        <Flex gapX="4" gapY="1" mt="3" align="center" wrap="wrap">
                          <Flex align="center" gap="1">
                            <Building size={14} />
                            <Text size="1" color="gray">{student?.schoolDetails?.phone || "No phone number"}</Text>
                          </Flex>
                          <Flex align="center" gap="1">
                            <Mail size={14} />
                            <Text size="1" color="gray">{student?.schoolDetails?.email || "No email"}</Text>
                          </Flex>
                          <Flex align="center" gap="1">
                            <Link size={14} />
                            <Text size="1" color="gray">{student?.schoolDetails?.website || "No website"}</Text>
                          </Flex>
                        </Flex>

                        <Flex mt="4" justify="end">
                          <Button
                            color="red"
                            variant="soft"
                            size="2"
                            onClick={() => handleUnlinkSchool(student?.schoolDetails?.name)}
                            disabled={unlinkSchoolMutation.isPending}
                          >
                            <Link2Off size={14} />{unlinkSchoolMutation.isPending ? "Unlinking..." : "Unlink School"}
                          </Button>
                        </Flex>
                      </Box>
                    </Flex>
                  </Card>
                ) : (
                  <EmptyStateCard
                    icon={<School />}
                    title="No school connected"
                    description="Join your school to track attendance, access assignments, and connect with teachers."
                    className="mb-6"
                  />
                )}

                {!student?.schoolDetails && (
                  <Card size={{initial: '2', sm: '3'}} className='space-y-4'>
                    <Text as='p' weight={'bold'}>
                      Connect with Your School
                    </Text>

                    {/* Link with Class Code */}
                    <Box>
                      <Text size="2" weight="medium" className="flex gap-1 items-center mb-2">
                        Join with Class Code
                        <Tooltip content="Get a join code from your school administrator or teacher">
                          <HelpCircle size={14} />
                        </Tooltip>
                      </Text>
                      <form onSubmit={handleLinkSchool} className="flex flex-col gap-2">
                        <TextField.Root
                          placeholder="Enter class join code"
                          value={schoolCode}
                          onChange={e => setSchoolCode(e.target.value)}
                          className="w-full"
                          size="2"
                        />
                        <Text size="1" color="gray" className="mb-1">
                          Class codes are provided by your school administrator or teacher
                        </Text>
                        <Button
                          type="submit"
                          size="2"
                          disabled={!schoolCode || linkSchoolMutation.isPending}
                          className="self-start shadow-md"
                        >
                          {linkSchoolMutation.isPending ? "Processing..." : "Join School"}
                        </Button>
                      </form>
                    </Box>
                  </Card>
                )}
              </Card>

              {/* TEACHERS SECTION */}
              {student?.schoolDetails && student?.teacherIds?.length > 0 && (
                <Card size={{initial: '2', sm: '3'}} className='space-y-4 card_no_border'>
                  <Text as='p' weight={'bold'}>
                    Connected Teachers
                  </Text>

                  <Box className="grid gap-4">
                    {student?.teacherIds.map((teacher) => (
                      <Card>
                        <Flex gap="3" align="start" className="flex-1">
                          <Avatar
                            size="3"
                            src={teacher?.avatar}
                            fallback={`${teacher.firstName?.[0] || ""}${teacher.lastName?.[0] || ""}`}
                            radius="full"
                            className="shadow-sm"
                          />
                          <Flex direction="column" gap="1">
                            <Text size="2" weight="medium">
                              {teacher.firstName} {teacher.lastName}
                            </Text>
                            <Text size="2" color="gray">{teacher.email}</Text>
                            {teacher.subjectsTaught?.length > 0 && (
                              <Flex gap="1" wrap="wrap" mt="1">
                                {teacher.subjectsTaught.map((subject) => (
                                  <Badge key={subject} size="1" color="gray" variant="soft">
                                    {subject}
                                  </Badge>
                                ))}
                              </Flex>
                            )}
                          </Flex>
                        </Flex>
                      </Card>
                    ))}
                  </Box>

                  <Callout.Root color="blue" size="1" className="mt-5" variant='surface'>
                    <Callout.Icon>
                      <Info size={16} />
                    </Callout.Icon>
                    <Callout.Text>
                      Teachers are automatically connected when you link with your school. No separate linking process is required.
                    </Callout.Text>
                  </Callout.Root>
                </Card>
              )}
            </Flex>
          </Tabs.Content>

          {/* PENDING REQUESTS TAB */}
          <Tabs.Content value="requests">
            <Flex direction="column" gap="6">
              {/* REQUESTS FROM PARENTS */}
              {parentLinkRequests.length > 0 && (
                <Card size={{initial: '2', sm: '3'}} className='space-y-4 card_no_border'>
                  <Text as='p' weight={'bold'}>
                    Parent Connection Requests
                  </Text>

                  <Callout.Root color="amber" size="1" variant='surface'>
                    <Callout.Icon>
                      <Info size={16} />
                    </Callout.Icon>
                    <Callout.Text>
                      Parents have requested to connect with your account. Review and approve or reject these requests.
                    </Callout.Text>
                  </Callout.Root>

                  {isLoadingParentLinkRequests ? (
                    <Flex align="center" justify="center" py="4">
                      <Loader borderWidth={2} className='size-6' borderColor='var(--accent-11)' />
                    </Flex>
                  ) : (
                    <Box className="grid gap-4">
                      {parentLinkRequests.map((request) => (
                        <Card key={request._id} size='2' className='space-y-6'>
                          <Flex direction="column" gap="3">
                            <Flex align="center" gap="2">
                              <Avatar
                                size="3"
                                src={request.parentAvatar}
                                fallback={request.parentName?.[0] || "P"}
                                radius="full"
                              />
                              <Flex direction="column">
                                <Text size="2" weight="medium">{request.parentName}</Text>
                                <Text size="1" color="gray">{request.parentEmail}</Text>
                              </Flex>
                            </Flex>

                            <Flex wrap="wrap" gap="3" className="text-sm">
                              <Box>
                                <Box className="bg-[--gray-a3] rounded px-2 py-1 inline-flex items-center gap-1">
                                  <Text size="1" color="gray">Code:</Text>
                                  <Text size="1" weight="bold" className="font-mono">{request.code}</Text>
                                </Box>
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
                                onClick={() => handleRespondToParentLinkRequest(request._id, 'reject')}
                                disabled={respondToParentLinkMutation.isPending}
                              >
                                Reject
                              </Button>
                              <Button
                                color="grass"
                                onClick={() => handleRespondToParentLinkRequest(request._id, 'approve')}
                                disabled={respondToParentLinkMutation.isPending}
                              >
                                Approve
                              </Button>
                            </Flex>
                          </Flex>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Card>
              )}

              {/* REQUESTS I'VE SENT */}
              <Card size={{initial: '2', sm: '3'}} className='space-y-4 card_no_border'>
                <Text as='p' weight={'bold'}>
                  My Pending Connection Requests
                </Text>

                <Callout.Root color="blue" size="1" className="mb-5" variant='surface'>
                  <Callout.Icon>
                    <Info size={16} />
                  </Callout.Icon>
                  <Callout.Text>
                    <Text as="p" size="2">Link requests allow you to connect your account with parents or schools. Once sent, they can approve or reject your connection request.</Text>
                    <Text as="p" size="2" mt="1">Requests automatically expire after 7 days if not acted upon.</Text>
                  </Callout.Text>
                </Callout.Root>

                {isLoadingLinkRequests ? (
                  <Flex align="center" justify="center" py="8">
                    <Loader borderWidth={2} className='size-6' borderColor='var(--accent-11)' />
                  </Flex>
                ) : pendingLinkRequests.length > 0 ? (
                  <Box className="grid gap-3">
                    {pendingLinkRequests.map((request) => (
                      <Card key={request._id} size='2' className='space-y-6'>
                        <Flex direction="column" gap="3">
                          <Flex align="center" gap="2">
                            <Shield size={14} className="text-[--accent-9]" />
                            <Text size="2" weight="medium">{request.targetEmail}</Text>
                          </Flex>

                          <Flex wrap="wrap" gap="3" className="text-sm">
                            <Box className="bg-[--gray-a3] rounded px-2 py-1 inline-flex items-center gap-1">
                              <Text size="1" color="gray">Code:</Text>
                              <Text size="1" weight="bold" className="font-mono">{request.code}</Text>
                            </Box>

                            <Box className="bg-[--gray-a3] rounded px-2 py-1 inline-flex items-center gap-1">
                              <Text size="1" color="gray">Created:</Text>
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
                              onClick={() => handleCancelLinkRequest(request._id)}
                              disabled={cancelLinkRequestMutation.isPending && cancelLinkRequestMutation.variables === request._id}
                            >
                              {cancelLinkRequestMutation.isPending && cancelLinkRequestMutation.variables === request._id ? "Cancelling..." : "Cancel Request"}
                            </Button>
                          </Flex>
                        </Flex>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <EmptyStateCard
                    icon={<CheckCircle />}
                    title="No pending requests"
                    description="You don't have any active link requests. Use the options in the Family or School sections to create new connection requests."
                  />
                )}
              </Card>
            </Flex>
          </Tabs.Content>
        </Tabs.Root>
      </Box>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        title="Reject Connection Request"
        description={`Are you sure you want to reject the connection request from ${selectedParentName || 'this parent'}?`}
        additionalContent={
          <Text as="p" size="1" color="gray">
            This action cannot be undone. The parent will need to send a new connection request if you change your mind.
          </Text>
        }
        confirmText="Reject Request"
        confirmColor="red"
        isLoading={respondToParentLinkMutation.isPending}
        onConfirm={() => confirmRespondToParentLinkRequest(selectedRequestId, 'reject')}
      />

      <ConfirmationDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancel Link Request"
        description="Are you sure you want to cancel this connection request?"
        additionalContent={
          <Text as="p" size="1" color="gray">
            This action cannot be undone. You will need to create a new request if you change your mind.
          </Text>
        }
        confirmText="Cancel Request"
        confirmColor="red"
        isLoading={cancelLinkRequestMutation.isPending}
        onConfirm={confirmCancelLinkRequest}
      />

      <ConfirmationDialog
        open={unlinkParentDialogOpen}
        onOpenChange={setUnlinkParentDialogOpen}
        title="Unlink Parent"
        description={`Are you sure you want to unlink ${selectedParentToUnlink || 'this parent'} from your account?`}
        additionalContent={
          <Text as="p" size="1" color="gray">
            This action will remove all connections between you and this parent.
          </Text>
        }
        confirmText="Unlink Parent"
        confirmColor="red"
        isLoading={unlinkParentMutation.isPending}
        onConfirm={confirmUnlinkParent}
      />

      <ConfirmationDialog
        open={unlinkSchoolDialogOpen}
        onOpenChange={setUnlinkSchoolDialogOpen}
        title="Unlink School"
        description={`Are you sure you want to unlink ${schoolToUnlink || 'your school'} from your account?`}
        additionalContent={
          <Text as="p" size="1" color="gray">
            This action will remove all connections between you and this school.
          </Text>
        }
        confirmText="Unlink School"
        confirmColor="red"
        isLoading={unlinkSchoolMutation.isPending}
        onConfirm={confirmUnlinkSchool}
      />
    </div>
    // </Theme>
  );
}

export default LinkedAccounts;

function LinkedAccountsHeader() {
  return (
    <Flex direction="column">
      <Text as="p" size="6" weight="bold" mb={'2'}>
        Account Connections
      </Text>
      <Text as="p" size="2" color="gray">
        Connect your account with family, schools and educational institutions to enhance your learning journey
        and share your progress with those who support you.
      </Text>
    </Flex>
  )
}