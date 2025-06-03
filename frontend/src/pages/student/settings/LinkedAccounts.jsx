import { Avatar, Badge, Box, Button, Callout, Flex, ScrollArea, Separator, Tabs, Text, TextField, Tooltip } from '@radix-ui/themes';
import { AlertCircle, Building, CheckCircle, Clock, GraduationCap, HelpCircle, Info, Link, Link2, Link2Off, Mail, School, Shield, UserPlus, Users } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  useCancelLinkRequest,
  useLinkWithParent,
  useLinkWithSchool,
  useRequestParentLink,
  useRequestSchoolLink,
  useRespondToParentLinkRequest,
  useUnlinkFromParent,
  useUnlinkFromSchool
} from '../../../api/student/student.mutations';
import {
  useGetParentLinkRequests,
  useGetPendingLinkRequests,
  useStudentProfile
} from '../../../api/student/student.queries';
import { ConfirmationDialog, EmptyStateCard, Loader, SectionHeader } from '../../../components';

function LinkedAccounts() {
  const [parentCode, setParentCode] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [schoolRequestCode, setSchoolRequestCode] = useState('');

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
  const requestSchoolLinkMutation = useRequestSchoolLink();
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

  // Handle request school link via code
  const handleRequestSchoolLink = (e) => {
    e.preventDefault();
    if (!schoolRequestCode) return;

    requestSchoolLinkMutation.mutate(schoolRequestCode, {
      onSuccess: () => {
        toast.success("School link request sent successfully");
        setSchoolRequestCode('');
      },
      onError: (error) => {
        console.log(error);
        toast.error(error?.response?.data?.message || error?.message || "Failed to send school link request");
      }
    });
  };

  if (isLoading) {
    return (
      <Flex align="center" justify="center">
        <Loader borderWidth={2} className='size-8' borderColor='var(--accent-11)' />
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
            Connect your account with family, schools and educational institutions to enhance your learning journey
            and share your progress with those who support you.
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
              {(pendingLinkRequests.length > 0 || parentLinkRequests.length > 0) && (
                <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] flex items-center justify-center text-xs rounded-full bg-[--accent-9] text-[--accent-contrast] font-medium">
                  {pendingLinkRequests.length + parentLinkRequests.length}
                </span>
              )}
            </Tabs.Trigger>
          </Tabs.List>

          {/* ACTIVE CONNECTIONS TAB */}
          <Tabs.Content value="connections" className="mt-6">
            <Flex direction="column" gap="6">
              {/* FAMILY SECTION */}
              <Box className="rounded-lg border border-[--gray-a6] overflow-hidden">
                <SectionHeader
                  icon={<Users />}
                  title="Family Connections"
                />

                <Box className="p-4 md:p-6">
                  {student?.parentIds?.length > 0 ? (
                    <Box>
                      <Box className="grid gap-3 mb-6">
                        {student.parentIds.map((parent) => (
                          <Box key={parent._id} className="flex items-center justify-between p-4 bg-[--gray-a2] rounded-lg border border-[--gray-a5] hover:border-[--focus-8] transition-all gap-3 flex-wrap">
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
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    <EmptyStateCard
                      icon={<Users />}
                      title="No family connections"
                      description="Link your parents or guardians to share your academic progress, achievements, and attendance records with them."
                      className="mb-6"
                    />
                  )}

                  <Box className="space-y-5">
                    <Separator size="4" />

                    <Box className="rounded-lg border border-[--gray-a5] overflow-hidden">
                      <SectionHeader
                        icon={<UserPlus />}
                        title="Connect with a Parent or Guardian"
                        size="medium"
                      />

                      <Box className="p-4">
                        <Flex gap="6" wrap="wrap">
                          {/* Link with Code */}
                          <Box className="flex-1 min-w-44">
                            <Text size="2" weight="medium" className="flex items-center gap-1 mb-2">
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
                                className="self-start"
                              >
                                {linkParentMutation.isPending ? "Linking..." : "Link Parent"}
                              </Button>
                            </form>
                          </Box>

                          {/* Request Link via Email */}
                          <Box className="flex-1 min-w-44">
                            <Text size="2" weight="medium" className="flex items-center gap-1 mb-2">
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
                                className="self-start"
                              >
                                {requestParentLinkMutation.isPending ? "Sending..." : "Request Link"}
                              </Button>
                            </form>
                          </Box>
                        </Flex>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* SCHOOL SECTION */}
              <Box className="rounded-lg border border-[--gray-a6] overflow-hidden">
                <SectionHeader
                  icon={<School />}
                  title="Educational Institution"
                />

                <Box className="p-4 md:p-6">
                  {student?.schoolDetails ? (
                    <Box className="mb-6">
                      <Box className="bg-[--gray-a2] rounded-lg border border-[--gray-a5] p-5 hover:border-[--focus-8] transition-all">
                        <Flex gap="4" wrap={'wrap'}>
                          <Avatar
                            size="5"
                            fallback={student?.schoolDetails?.name?.[0]}
                            src={student?.schoolDetails?.logo}
                            radius="full"
                            color="blue"
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
                      </Box>
                    </Box>
                  ) : (
                    <EmptyStateCard
                      icon={<School />}
                      title="No school connected"
                      description="Join your school to track attendance, access assignments, and connect with teachers."
                      className="mb-6"
                    />
                  )}

                  {!student?.schoolDetails && (
                    <Box className="rounded-lg border border-[--gray-a5] overflow-hidden">
                      <SectionHeader
                        icon={<School />}
                        title="Connect with Your School"
                        size="medium"
                      />

                      <Box className="p-4">
                        <Flex gap="6" wrap="wrap">
                          {/* Link with School Code */}
                          <Box className="flex-1 min-w-44">
                            <Text size="2" weight="medium" className="flex items-center gap-1 mb-2">
                              Join with School Code
                              <Tooltip content="Get a join code from your school administrator or teacher">
                                <HelpCircle size={14} />
                              </Tooltip>
                            </Text>
                            <form onSubmit={handleLinkSchool} className="flex flex-col gap-2">
                              <TextField.Root
                                placeholder="Enter school join code"
                                value={schoolCode}
                                onChange={e => setSchoolCode(e.target.value)}
                                className="w-full"
                                size="2"
                              />
                              <Text size="1" color="gray" className="mb-1">
                                School codes are provided by your school administrator
                              </Text>
                              <Button
                                type="submit"
                                size="2"
                                disabled={!schoolCode || linkSchoolMutation.isPending}
                                className="self-start"
                              >
                                {linkSchoolMutation.isPending ? "Joining..." : "Join School"}
                              </Button>
                            </form>
                          </Box>

                          {/* Request School Link via School Code */}
                          <Box className="flex-1 min-w-44">
                            <Text size="2" weight="medium" className="flex items-center gap-1 mb-2">
                              Request School Connection
                              <Tooltip content="Request a connection with your school using a school code">
                                <HelpCircle size={14} />
                              </Tooltip>
                            </Text>
                            <form onSubmit={handleRequestSchoolLink} className="flex flex-col gap-2">
                              <TextField.Root
                                placeholder="Enter school code"
                                value={schoolRequestCode}
                                onChange={e => setSchoolRequestCode(e.target.value)}
                                className="w-full"
                                size="2"
                              />
                              <Text size="1" color="gray" className="mb-1">
                                Enter the code provided by your school administration
                              </Text>
                              <Button
                                type="submit"
                                size="2"
                                disabled={!schoolRequestCode || requestSchoolLinkMutation.isPending}
                                className="self-start"
                              >
                                {requestSchoolLinkMutation.isPending ? "Requesting..." : "Request Connection"}
                              </Button>
                            </form>
                          </Box>
                        </Flex>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* TEACHERS SECTION */}
              {student?.schoolDetails && student?.teacherIds?.length > 0 && (
                <Box className="rounded-lg border border-[--gray-a6] overflow-hidden">
                  <SectionHeader
                    icon={<GraduationCap />}
                    title="Connected Teachers"
                  />

                  <ScrollArea type="auto" scrollbars="vertical" className="max-h-[400px]">
                    <Box className="p-4 md:p-6">
                      <Box className="grid gap-3">
                        {student?.teacherIds.map((teacher) => (
                          <Box key={teacher._id} className="flex items-center p-4 bg-[--gray-a2] rounded-lg border border-[--gray-a5] hover:border-[--accent-8] transition-all">
                            <Flex gap="3" align="start" className="flex-1">
                              <Avatar
                                size="3"
                                src={teacher?.avatar}
                                fallback={`${teacher.firstName?.[0] || ""}${teacher.lastName?.[0] || ""}`}
                                radius="full"
                                color="blue"
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
                          </Box>
                        ))}
                      </Box>

                      <Callout.Root color="blue" size="1" className="mt-5">
                        <Callout.Icon>
                          <Info size={14} />
                        </Callout.Icon>
                        <Callout.Text>
                          Teachers are automatically connected when you link with your school. No separate linking process is required.
                        </Callout.Text>
                      </Callout.Root>
                    </Box>
                  </ScrollArea>
                </Box>
              )}
            </Flex>
          </Tabs.Content>

          {/* PENDING REQUESTS TAB */}
          <Tabs.Content value="requests" className="mt-6">
            <Flex direction="column" gap="6">
              {/* REQUESTS FROM PARENTS */}
              {parentLinkRequests.length > 0 && (
                <Box className="rounded-lg border border-[--gray-a6] overflow-hidden">
                  <SectionHeader
                    icon={<Users />}
                    title="Parent Connection Requests"
                  />

                  <Box className="p-4 md:p-6">
                    <Callout.Root color="amber" size="1" className="mb-4">
                      <Callout.Icon>
                        <Info size={14} />
                      </Callout.Icon>
                      <Callout.Text>
                        <Text as="p" size="2">Parents have requested to connect with your account. Review and approve or reject these requests.</Text>
                      </Callout.Text>
                    </Callout.Root>

                    {isLoadingParentLinkRequests ? (
                      <Flex align="center" justify="center" py="4">
                        <Loader borderWidth={2} className='size-6' borderColor='var(--accent-11)' />
                      </Flex>
                    ) : (
                      <Box className="grid gap-3">
                        {parentLinkRequests.map((request) => (
                          <Box key={request._id} className="overflow-hidden rounded-lg border border-[--gray-a6]">
                            <Box className="bg-[--gray-a3] px-4 py-3">
                              <Flex align="center" justify="between">
                                <Flex align="center" gap="2">
                                  <Users size={16} className="text-[--blue-9]" />
                                  <Text size="2" weight="medium">
                                    Parent Connection Request
                                  </Text>
                                </Flex>
                                <Badge variant="soft" color="amber">
                                  Needs Review
                                </Badge>
                              </Flex>
                            </Box>

                            <Box className="p-4">
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
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* REQUESTS I'VE SENT */}
              <Box className="rounded-lg border border-[--gray-a6] overflow-hidden">
                <SectionHeader
                  icon={<Clock />}
                  title="My Pending Connection Requests"
                />

                <Box className="p-4 md:p-6">
                  <Callout.Root color="blue" size="1" className="mb-5">
                    <Callout.Icon>
                      <Info size={14} />
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
                        <Box key={request._id} className="overflow-hidden rounded-lg border border-[--gray-a5]">
                          <Box className="bg-[--gray-a3] px-4 py-3">
                            <Flex align="center" justify="between">
                              <Flex align="center" gap="2">
                                {request.requestType === 'parent' ? (
                                  <Users size={16} className="text-[--accent-9]" />
                                ) : (
                                  <School size={16} className="text-[--accent-9]" />
                                )}
                                <Text size="2" weight="medium">
                                  {request.requestType === 'parent' ? 'Parent Connection' : 'School Connection'}
                                </Text>
                              </Flex>
                              <Badge variant="soft" color="amber">
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </Badge>
                            </Flex>
                          </Box>

                          <Box className="p-4">
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
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <EmptyStateCard
                      icon={<CheckCircle />}
                      title="No pending requests"
                      description="You don't have any active link requests. Use the options in the Family or School sections to create new connection requests."
                    />
                  )}
                </Box>
              </Box>
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
