import { Badge, Button, DataList, Dialog, Flex, Link, ScrollArea, Text } from '@radix-ui/themes';
import { ExternalLink, FileText } from 'lucide-react';
import React from 'react';
import { formatDate } from '../../../utils/helperFunctions';

function PreviewTaskForm({ open, setOpen, task }) {
  // Format assigned people for display
  const formatAssignedPeople = () => {
    if (!task?.selectedPeople || task.selectedPeople.length === 0) {
      if(task?.assigned === 'school') return 'School';
      if(task?.assigned === 'student') return 'All students';
      if(task?.assigned === 'parent') return 'All parents';
      return `All users`;
    }
    return `Selected ${task.assigned}s`;
  };

  // Format approver type for display
  const formatApproverType = (approverType) => {
    if (!approverType) return 'N/A';
    return approverType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format difficulty for display
  const formatDifficulty = (difficulty) => {
    if (!difficulty) return 'Not specified';
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  // Check if external resource has any data
  const hasExternalResource = () => {
    return task?.externalResource && (
      task.externalResource.platform || 
      task.externalResource.resourceId || 
      task.externalResource.url
    );
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
      label: 'Difficulty',
      value: formatDifficulty(task?.difficulty)
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
          <ScrollArea className="max-h-[60vh]">
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
                      ) : field.label === 'Difficulty' ? (
                        <Badge 
                          color={
                            field.value === 'Easy' ? 'green' :
                            field.value === 'Medium' ? 'yellow' :
                            field.value === 'Hard' ? 'orange' :
                            field.value === 'Challenging' ? 'red' : 'gray'
                          } 
                          variant="soft"
                        >
                          {field.value}
                        </Badge>
                      ) : (
                        <Text size="2">{field.value}</Text>
                      )}
                    </DataList.Value>
                  </DataList.Item>
                ))}
              </DataList.Root>

              {/* External Resource Section */}
              {hasExternalResource() && (
                <div className="space-y-3">
                  <Text as='p' size="3" weight="medium" className="flex gap-2 items-center">
                    <ExternalLink size={16} />
                    External Resource
                  </Text>
                  <div className="pl-6 space-y-2">
                    {task.externalResource.platform && (
                      <div>
                        <Text size="2" color="gray">Platform:</Text>
                        <Text size="2" className="ml-2">{task.externalResource.platform}</Text>
                      </div>
                    )}
                    {task.externalResource.resourceId && (
                      <div>
                        <Text size="2" color="gray">Resource ID:</Text>
                        <Text size="2" className="ml-2">{task.externalResource.resourceId}</Text>
                      </div>
                    )}
                    {task.externalResource.url && (
                      <div>
                        <Text size="2" color="gray">URL:</Text>
                        <Link href={task.externalResource.url} target="_blank" size="2" className="ml-2">
                          {task.externalResource.url}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Attachments Section */}
              {((task?.attachments && task.attachments.length > 0) || (task?.existingAttachments && task.existingAttachments.length > 0)) && (
                <div className="space-y-3">
                  <Text as='p' size="3" weight="medium" className="flex gap-2 items-center">
                    <FileText size={16} />
                    Attachments ({(task?.attachments?.length || 0) + (task?.existingAttachments?.length || 0)})
                  </Text>
                  <div className="pl-6 space-y-2">
                    {/* Existing Attachments */}
                    {task?.existingAttachments && task.existingAttachments.map((attachment, index) => (
                      <Flex key={`existing-${index}`} align="center" gap="2" className="p-2 bg-[--gray-a2] rounded">
                        <FileText size={14} />
                        <div className="flex-1">
                          <Text size="2">{attachment.filename || attachment.name}</Text>
                          <Text size="1" color="gray" className="block">
                            {attachment.mimetype || attachment.contentType} • Existing file
                          </Text>
                        </div>
                        <Badge variant="outline" size="1" color="blue">
                          Existing
                        </Badge>
                      </Flex>
                    ))}
                    
                    {/* New Attachments */}
                    {task?.attachments && task.attachments.map((attachment, index) => (
                      <Flex key={`new-${index}`} align="center" gap="2" className="p-2 bg-[--gray-a2] rounded">
                        <FileText size={14} />
                        <div className="flex-1">
                          <Text size="2">{attachment.name}</Text>
                          <Text size="1" color="gray" className="block">
                            {attachment.type} • {attachment.contentType} • New file
                          </Text>
                        </div>
                        <Badge variant="outline" size="1" color="green">
                          New
                        </Badge>
                      </Flex>
                    ))}
                  </div>
                </div>
              )}

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
          </ScrollArea>
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
