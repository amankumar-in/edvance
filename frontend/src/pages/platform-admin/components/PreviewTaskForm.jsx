import { Badge, Button, DataList, Dialog, Flex, ScrollArea, Text } from '@radix-ui/themes'
import React from 'react'
import { formatDate } from '../../../utils/helperFunctions';
import { Scroll } from 'lucide-react';

function PreviewTaskForm({ open, setOpen, task }) {
  // Format assigned people for display
  const formatAssignedPeople = () => {
    if (!task?.selectedPeople || task.selectedPeople.length === 0) {
      return `All ${task?.assigned || 'users'}s`;
    }
    return `Selected ${task.assigned}s`;
  };

  // Format approver type for display
  const formatApproverType = (approverType) => {
    if (!approverType) return 'N/A';
    return approverType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formFields = [
    {
      label: 'Title',
      value: task?.title || 'Not specified'
    },
    {
      label: 'Due Date',
      value: task?.dueDate ? formatDate(new Date(task.dueDate), { timeStyle: 'short', dateStyle: 'medium' }) : 'Not specified'
    },
    {
      label: 'Description',
      value: task?.description || 'No description provided'
    },
    {
      label: 'Category',
      value: task?.subCategory || 'Not selected'
    },
    {
      label: 'Scholarship Points',
      value: task?.pointValue ? `${task.pointValue} points` : 'Not specified'
    },
    {
      label: 'Assigned To',
      value: formatAssignedPeople()
    },
    {
      label: 'Requires Approval',
      value: task?.requiresApproval === 'true' || task?.requiresApproval === true ? 'Yes' : 'No'
    },
    {
      label: 'Approval Required By',
      value: (task?.requiresApproval === 'true' || task?.requiresApproval === true)
        ? formatApproverType(task?.approverType)
        : 'N/A'
    },
  ]

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Content maxWidth="650px" >
        <Dialog.Title>Preview Task</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Review all task details before creating it.
        </Dialog.Description>

        {task && (
          <Flex direction="column" gap="4" pr='4'>
            <DataList.Root orientation={{ initial: "vertical", sm: "horizontal" }}>
              {formFields.map((field) => (
                <DataList.Item key={field.label}>
                  <DataList.Label minWidth="140px">
                    {field.label}
                  </DataList.Label>
                  <DataList.Value className="flex-1">
                    {field.label === 'Description' ? (
                      <Text size="2" className="whitespace-pre-wrap">
                        {field.value}
                      </Text>
                    ) : field.label === 'Requires Approval' ? (
                      <Badge
                        color={field.value === 'Yes' ? 'green' : 'gray'}
                        variant="soft"
                      >
                        {field.value}
                      </Badge>
                    ) : field.label === 'Scholarship Points' ? (
                      <Badge color="blue" variant="soft">
                        {field.value}
                      </Badge>
                    ) : field.label === 'Category' ? (
                      <Badge color="purple" variant="soft" className="capitalize">
                        {field.value}
                      </Badge>
                    ) : (
                      <Text size="2">{field.value}</Text>
                    )}
                  </DataList.Value>
                </DataList.Item>
              ))}
            </DataList.Root>

            {/* Additional info section */}
            {(task?.selectedPeople && task.selectedPeople.length > 0) && (
              <div>
                <Text as='p' size="2" color='gray' className="block mb-2">
                  Selected {task?.assigned}s:
                </Text>
                <div className="flex flex-wrap gap-1">
                  {task.selectedPeople.map((person, index) => (
                    <Badge key={index} variant="outline" size="1">
                      {person.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Flex>
        )}

        <Flex gap="3" mt="6" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Close
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default PreviewTaskForm
