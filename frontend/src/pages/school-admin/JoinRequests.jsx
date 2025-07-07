import { Badge, Button, Callout, Flex, Heading, Table, Text } from '@radix-ui/themes';
import { AlertCircle, Check, CheckCircle, Clock, Info, X } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { useRespondToJoinRequest } from '../../api/school-admin/school.mutations';
import { useGetAllPendingJoinRequests } from '../../api/school-admin/school.queries';
import { ConfirmationDialog, EmptyStateCard, Loader } from '../../components';
import { formatDate } from '../../utils/helperFunctions';

function JoinRequests() {
  const { data, isLoading, isError, error } = useGetAllPendingJoinRequests();
  const { mutate: respondToRequest, isPending } = useRespondToJoinRequest();
  const joinRequests = data?.data || [];

  // Separate state for approve and reject dialogs
  const [approveDialogData, setApproveDialogData] = React.useState({ open: false, request: null });
  const [rejectDialogData, setRejectDialogData] = React.useState({ open: false, request: null });

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
          {error?.response?.data?.message || error?.message || "Could not load join requests"}
        </Callout.Text>
      </Callout.Root>
    );
  }

  return (
    <div>
      {/* Enhanced Header Section */}
      <div className="mb-6">
        <Flex align="center" gap="3" mb="3">

          <div>
            <Heading size="6" weight="bold" mb="1">
              Student Join Requests
            </Heading>
            <Text as='p' size="3" color="gray">
              Review and manage student enrollment requests for your school
            </Text>
          </div>
        </Flex>
        
        <Flex direction="column" gap="2" mb="4">          
          <Callout.Root size="1" className="bg-[--accent-a2] border border-[--accent-a6]">
            <Callout.Icon>
              <Info size={16} />
            </Callout.Icon>
            <Callout.Text size="2">
              <span className='font-medium'>Review Process: </span>
              Carefully review each student's information before approving. 
              Approved students will gain access to school resources and be able to participate in school activities.
            </Callout.Text>
          </Callout.Root>
        </Flex>
      </div>

      {joinRequests.length === 0 ? (
        <EmptyStateCard
          icon={<CheckCircle />}
          title="No Pending Join Requests"
          description="When students request to join your school, you'll see them here."
        />
      ) : (
        <Table.Root variant='surface'>
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
            {joinRequests.map((request) => (
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
            ))}
          </Table.Body>
        </Table.Root>
      )}

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