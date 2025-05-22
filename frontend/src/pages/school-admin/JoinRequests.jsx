import { Badge, Button, Callout, Flex, Heading, Table, Text } from '@radix-ui/themes';
import { AlertCircle, Check, CheckCircle, Clock, X } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { useRespondToJoinRequest } from '../../api/school-admin/school.mutations';
import { useGetAllPendingJoinRequests } from '../../api/school-admin/school.queries';
import { ConfirmationDialog, EmptyStateCard, Loader } from '../../components';

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
          {error?.response?.data?.message || error?.message || "Could not load join requests"}
        </Callout.Text>
      </Callout.Root>
    );
  }

  return (
    <div>
      <Heading size="6" mb="4" weight={'medium'}>Student Join Requests</Heading>

      {joinRequests.length === 0 ? (
        <EmptyStateCard
          icon={<CheckCircle />}
          title="No Pending Join Requests"
          description="When students request to join your school, you'll see them here."
        />
      ) : (
        <Table.Root layout={'fixed'}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell className='font-medium'>Student Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className='font-medium'>Requested At</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className='font-medium'>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className='font-medium'>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {joinRequests.map((request) => (
              <Table.Row key={request._id}>
                <Table.Cell>
                  {request.studentName}
                </Table.Cell>
                <Table.Cell>
                  {new Date(request.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
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
        description={`Are you sure you want to approve ${approveDialogData.request?.studentName}'s request to join your school?`}
        additionalContent={
          <Text as='div' size="1">
            <Text as='span' weight={'medium'}>Note:</Text>
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