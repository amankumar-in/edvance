import { Badge, Button, Callout, Flex, Table, Text } from '@radix-ui/themes';
import { AlertCircle, Check, Clock, Info, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useRespondToJoinRequest } from '../../api/school-admin/school.mutations';
import { useGetAllPendingJoinRequests } from '../../api/school-admin/school.queries';
import { ConfirmationDialog, EmptyStateCard, Loader } from '../../components';
import { formatDate } from '../../utils/helperFunctions';
import PageHeader from './components/PageHeader';

function JoinRequests() {
  // State for approve and reject dialogs
  const [approveDialogData, setApproveDialogData] = useState({ open: false, request: null });
  const [rejectDialogData, setRejectDialogData] = useState({ open: false, request: null });

  // Queries
  const { data, isLoading, isError, error } = useGetAllPendingJoinRequests();
  const joinRequests = data?.data || [];

  // Mutations
  const { mutate: respondToRequest, isPending } = useRespondToJoinRequest();

  // Open approve dialog
  const handleApprove = (requestId) => {
    setApproveDialogData({
      open: true,
      request: data?.data.find(req => req._id === requestId)
    });
  };

  // Open reject dialog
  const handleReject = (requestId) => {
    setRejectDialogData({
      open: true,
      request: data?.data.find(req => req._id === requestId)
    });
  };

  // Approve join request
  const confirmApprove = () => {
    respondToRequest(
      { requestId: approveDialogData.request._id, action: 'approve' },
      {
        onSuccess: () => {
          toast.success('Join request approved successfully');
          setApproveDialogData({ open: false, request: null });
        },
        onError: (error) => {
          console.log(error)
          toast.error(error?.response?.data?.message || error?.message || "Failed to approve join request");
        }
      }
    );
  };

  // Reject join request
  const confirmReject = () => {
    respondToRequest(
      { requestId: rejectDialogData.request._id, action: 'reject' },
      {
        onSuccess: () => {
          toast.success('Join request rejected successfully');
          setRejectDialogData({ open: false, request: null });
        },
        onError: (error) => {
          console.log(error)
          toast.error(error?.response?.data?.message || error?.message || "Failed to reject join request");
        }
      }
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className='space-y-6'>
        <JoinRequestHeader />
        <Flex align="center" justify="center">
          <Loader />
        </Flex>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className='space-y-6'>
        <JoinRequestHeader />
        <Callout.Root color="red" variant='surface'>
          <Callout.Icon>
            <AlertCircle size={16} />
          </Callout.Icon>
          <Callout.Text>
            {error?.response?.data?.message || error?.message || "Could not load join requests"}
          </Callout.Text>
        </Callout.Root>
      </div>
    );
  }

  // Main return
  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <JoinRequestHeader />

      {/* Review Process */}
      <Callout.Root color='blue' variant='surface'>
        <Callout.Icon>
          <Info size={16} />
        </Callout.Icon>
        <Callout.Text>
          <span className='font-medium'>Review Process: </span>
          Carefully review each student's information before approving.
          Approved students will gain access to school resources and be able to participate in school activities.
        </Callout.Text>
      </Callout.Root>

      {/* Table */}
      <Table.Root variant='surface' className='shadow-md'>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell className='font-medium'>Student</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className='font-medium'>Grade</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className='font-medium'>Email</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className='font-medium text-nowrap'>Requested At</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className='font-medium'>Status</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className='font-medium'>Actions</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {joinRequests.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={6}>
                <EmptyStateCard
                  title="No Pending Join Requests"
                  description="When students request to join your school, you'll see them here."
                />
              </Table.Cell>
            </Table.Row>
          ) : (
            joinRequests.map((request) => (
              <Table.Row key={request._id} className='hover:bg-[--gray-a2]'>
                <Table.Cell className='text-nowrap'>
                  {request?.initiatorId?.userId?.firstName} {request?.initiatorId?.userId?.lastName}
                </Table.Cell>
                <Table.Cell className='text-nowrap'>
                  {request?.initiatorId?.grade}
                </Table.Cell>
                <Table.Cell className='text-nowrap'>
                  {request?.initiatorId?.userId?.email}
                </Table.Cell>
                <Table.Cell>
                  {formatDate(request.createdAt)}
                </Table.Cell>
                <Table.Cell>
                  <Badge color="amber" variant="soft">
                    <Flex align="center" gap="1">
                      <Clock size={14} />
                      <Text>Pending</Text>
                    </Flex>
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Flex gap="2">
                    <Button
                      size="1"
                      color="green"
                      variant="soft"
                      onClick={() => handleApprove(request._id)}
                      disabled={isPending}
                    >
                      <Check size={16} />
                      Approve
                    </Button>
                    <Button
                      size="1"
                      color="red"
                      variant="soft"
                      onClick={() => handleReject(request._id)}
                      disabled={isPending}
                    >
                      <X size={16} />
                      Reject
                    </Button>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>

      {/* Approve Dialog */}
      <ConfirmationDialog
        open={approveDialogData.open}
        onOpenChange={(open) => setApproveDialogData(prev => ({ ...prev, open }))}
        title="Approve Join Request"
        description={`Are you sure you want to approve ${approveDialogData.request?.initiatorId?.userId?.firstName} ${approveDialogData.request?.initiatorId?.userId?.lastName}'s request to join your school?`}
        additionalContent={
          <Text as='div' size="1">
            <Text as='span' weight={'medium'}>Note: </Text>
            Approving will add this student to your school. They will have access to school resources and activities.
          </Text>
        }
        confirmText="Approve"
        confirmColor="green"
        isLoading={isPending}
        onConfirm={confirmApprove}
      />

      {/* Reject Dialog */}
      <ConfirmationDialog
        open={rejectDialogData.open}
        onOpenChange={(open) => setRejectDialogData(prev => ({ ...prev, open }))}
        title="Reject Join Request"
        description={`Are you sure you want to reject ${rejectDialogData.request?.studentName}'s request to join your school?`}
        confirmText="Reject"
        confirmColor="red"
        isLoading={isPending}
        onConfirm={confirmReject}
      />
    </div>
  );
}

export default JoinRequests;

// Join Request Header
function JoinRequestHeader() {
  return (
    <div>
      <PageHeader
        title="Student Join Requests"
        description="Review and manage student enrollment requests for your school"
      />
    </div>
  )
}